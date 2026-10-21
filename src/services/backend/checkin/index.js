import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import { getTodayDateString } from "@/lib/utils";
import AttendancePunch from "@/models/AttendancePunch";
import { FaceMatchService } from "@/services/backend/facematch";
import { OfficeLocationService } from "@/services/backend/location";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/lib/api/response-handler";

export class CheckInService {
  static async getEmployeeForUser(clerkUser, organizationId) {
    if (!clerkUser?.id) {
      throw new UnauthorizedError("Authentication required");
    }

    await dbConnect();
    const query = {
      $or: [
        { clerkId: clerkUser.id },
        {
          email: {
            $regex: new RegExp(
              `^${clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress}$`,
              "i"
            ),
          },
        },
      ],
    };

    if (organizationId) {
      const empInOrg = await Employee.findOne({ ...query, organizationId });
      if (empInOrg) return empInOrg;
    }

    const employee = await Employee.findOne(query);
    return employee;
  }

  static async getTodayStatus(clerkUser, organizationId, clientDate = null) {
    await dbConnect();
    const employee = await this.getEmployeeForUser(clerkUser, organizationId);
    if (!employee) {
      return {
        hasEmployee: false,
        employee: null,
        todayPunch: null,
        officeLocation: await OfficeLocationService.getOfficeLocation(organizationId),
      };
    }

    const todayDate = clientDate || getTodayDateString();
    await AttendancePunch.updateMany(
      {
        organizationId: employee.organizationId || organizationId,
        employeeId: employee._id,
        date: { $lt: todayDate },
        status: "IN_PROGRESS",
      },
      {
        $set: {
          status: "NO_PUNCH_OUT",
        },
      }
    );

    const todayPunch = await AttendancePunch.findOne({
      organizationId: employee.organizationId || organizationId,
      employeeId: employee._id,
      date: todayDate,
    }).lean();

    const officeLocation = await OfficeLocationService.getOfficeLocation(
      employee.organizationId || organizationId
    );

    return {
      hasEmployee: true,
      employee: {
        id: employee._id,
        _id: employee._id,
        name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        avatar: employee.avatar,
        hasEnrolledFace: Boolean(employee.avatar),
      },
      todayDate,
      todayPunch,
      officeLocation,
      hasCheckedIn: Boolean(todayPunch?.checkIn?.status === "SUCCESS"),
      hasCheckedOut: Boolean(todayPunch?.checkOut?.status === "SUCCESS"),
    };
  }

  static async checkIn(clerkUser, organizationId, payload) {
    const { latitude, longitude, accuracyMeters = 0, selfieUrl, clientDate } = payload || {};

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestError("Device GPS coordinates are required for check-in");
    }

    if (!selfieUrl) {
      throw new BadRequestError("Live camera face selfie is required for check-in");
    }

    const employee = await this.getEmployeeForUser(clerkUser, organizationId);
    if (!employee) {
      throw new NotFoundError("Employee profile not found. Please complete onboarding first.");
    }

    const orgId = employee.organizationId || organizationId;
    if (!employee.avatar) {
      throw new BadRequestError(
        "Face biometric photo is not enrolled yet. Please capture and save your profile photo in onboarding first."
      );
    }

    let officeLocation = await OfficeLocationService.getOfficeLocation(orgId);
    if (!officeLocation) {
      officeLocation = await OfficeLocationService.setOfficeLocation(orgId, {
        latitude,
        longitude,
        radiusMeters: 200,
        officeName: "Headquarters",
        address: "Office Geofence Calibrated",
        calibratedBy: `${employee.firstName} ${employee.lastName}`,
      });
    }

    const geofenceResult = OfficeLocationService.verifyGeofence(
      latitude,
      longitude,
      officeLocation
    );

    if (!geofenceResult.isWithinGeofence) {
      throw new BadRequestError(
        `Attendance Blocked: You are outside the office perimeter! You are ${geofenceResult.distanceMeters}m away from ${geofenceResult.officeName} (maximum allowed radius: ${geofenceResult.allowedRadius}m). Attendance cannot be marked.`
      );
    }

    const faceMatchResult = await FaceMatchService.compareFaces(
      selfieUrl,
      employee.avatar,
      75
    );

    if (!faceMatchResult.matched) {
      throw new BadRequestError(
        faceMatchResult.error ||
          `Face mismatch! Face similarity (${faceMatchResult.confidence}%) is below the required 70% threshold. Attendance cannot be marked.`
      );
    }

    const todayDate = clientDate || getTodayDateString();

    await AttendancePunch.updateMany(
      {
        organizationId: orgId,
        employeeId: employee._id,
        date: { $lt: todayDate },
        status: "IN_PROGRESS",
      },
      {
        $set: {
          status: "NO_PUNCH_OUT",
        },
      }
    );

    let punch = await AttendancePunch.findOne({
      organizationId: orgId,
      employeeId: employee._id,
      date: todayDate,
    });

    if (punch && punch.checkIn?.status === "SUCCESS") {
      throw new BadRequestError("You have already checked in for today!");
    }

    const checkInData = {
      time: new Date(),
      latitude,
      longitude,
      accuracyMeters,
      distanceMeters: geofenceResult.distanceMeters,
      withinGeofence: true,
      selfieUrl,
      faceMatchConfidence: faceMatchResult.confidence,
      faceMatched: true,
      verificationMethod: faceMatchResult.method || "REKOGNITION",
      status: "SUCCESS",
    };

    if (!punch) {
      punch = await AttendancePunch.create({
        organizationId: orgId,
        employeeId: employee._id,
        clerkId: clerkUser.id,
        date: todayDate,
        checkIn: checkInData,
        status: "IN_PROGRESS",
      });
    } else {
      punch.checkIn = checkInData;
      punch.status = "IN_PROGRESS";
      await punch.save();
    }

    return {
      message: "Check-in successful! Face verified & office location confirmed.",
      punch,
      distanceMeters: geofenceResult.distanceMeters,
      faceMatchConfidence: faceMatchResult.confidence,
    };
  }

  static async checkOut(clerkUser, organizationId, payload) {
    const { latitude, longitude, accuracyMeters = 0, selfieUrl, clientDate } = payload || {};

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestError("Device GPS coordinates are required for check-out");
    }

    if (!selfieUrl) {
      throw new BadRequestError("Live camera face selfie is required for check-out");
    }

    const employee = await this.getEmployeeForUser(clerkUser, organizationId);
    if (!employee) {
      throw new NotFoundError("Employee profile not found");
    }

    const orgId = employee.organizationId || organizationId;
    const todayDate = clientDate || getTodayDateString();

    const punch = await AttendancePunch.findOne({
      organizationId: orgId,
      employeeId: employee._id,
      date: todayDate,
    });

    if (!punch || !punch.checkIn || punch.checkIn.status !== "SUCCESS") {
      throw new BadRequestError("Cannot check out without checking in first for today.");
    }

    if (punch.checkOut && punch.checkOut.status === "SUCCESS") {
      throw new BadRequestError("You have already checked out for today!");
    }

    const officeLocation = await OfficeLocationService.getOfficeLocation(orgId);
    const geofenceResult = OfficeLocationService.verifyGeofence(
      latitude,
      longitude,
      officeLocation
    );

    if (!geofenceResult.isWithinGeofence) {
      throw new BadRequestError(
        `Outside office perimeter! You are ${geofenceResult.distanceMeters}m away from the office. Check-out must be performed from within office premises.`
      );
    }

    const faceMatchResult = await FaceMatchService.compareFaces(
      selfieUrl,
      employee.avatar,
      75
    );

    if (!faceMatchResult.matched) {
      throw new BadRequestError(
        faceMatchResult.error || "Face does not match registered biometric profile."
      );
    }

    const checkOutTime = new Date();
    const durationMinutes = Math.max(
      0,
      Math.round((checkOutTime.getTime() - new Date(punch.checkIn.time).getTime()) / 60000)
    );

    punch.checkOut = {
      time: checkOutTime,
      latitude,
      longitude,
      accuracyMeters,
      distanceMeters: geofenceResult.distanceMeters,
      withinGeofence: true,
      selfieUrl,
      faceMatchConfidence: faceMatchResult.confidence,
      faceMatched: true,
      verificationMethod: faceMatchResult.method || "REKOGNITION",
      status: "SUCCESS",
    };
    punch.durationMinutes = durationMinutes;
    punch.status = "COMPLETED";
    await punch.save();

    return {
      message: "Check-out successful! Attendance recorded.",
      punch,
      durationMinutes,
    };
  }

  static async getAdminAttendanceLogs(organizationId, { date, limit = 50 } = {}) {
    await dbConnect();
    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    }
    if (date) {
      query.date = date;
    }

    const punches = await AttendancePunch.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("employeeId", "name firstName lastName email department designation avatar employeeCode");

    return punches;
  }
}
