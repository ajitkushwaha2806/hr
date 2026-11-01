import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import { getTodayDateString } from "@/lib/utils";
import AttendancePunch from "@/models/AttendancePunch";
import { FaceMatchService } from "@/services/backend/facematch";
import { OfficeLocationService } from "@/services/backend/location";
import { sendTemplateEmail } from "@/services/backend/email";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/lib/api/response-handler";

function formatTime12h(dateObj) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj instanceof Date ? dateObj : new Date(dateObj));
  } catch {
    return "--:--";
  }
}

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

    // Evaluate if check-in is late compared to office shift start
    let isLate = false;
    let lateMinutes = 0;
    let consecutiveLateDays = 1;

    try {
      const shiftStartStr = officeLocation?.shiftStart || "10:00";
      const [shiftH = 10, shiftM = 0] = shiftStartStr.split(":").map(Number);
      const shiftMinutes = shiftH * 60 + shiftM;
      const gracePeriod = Number(officeLocation?.gracePeriod) || 0;
      const thresholdMinutes = shiftMinutes + gracePeriod;

      const punchIST = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(checkInData.time);

      const [punchH = 0, punchM = 0] = punchIST.split(":").map(Number);
      const punchMinutes = punchH * 60 + punchM;

      if (punchMinutes > thresholdMinutes) {
        isLate = true;
        lateMinutes = punchMinutes - shiftMinutes;

        // Count consecutive late days in reverse chronological order
        const pastPunches = await AttendancePunch.find({
          organizationId: orgId,
          employeeId: employee._id,
          date: { $lt: todayDate },
          "checkIn.status": "SUCCESS",
        })
          .sort({ date: -1 })
          .limit(7)
          .lean();

        for (const past of pastPunches) {
          if (!past.checkIn?.time) break;
          const pastIST = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(past.checkIn.time));
          const [pH = 0, pM = 0] = pastIST.split(":").map(Number);
          const pMinutes = pH * 60 + pM;
          if (pMinutes > thresholdMinutes) {
            consecutiveLateDays++;
          } else {
            break; // Streak broken by an on-time day
          }
        }

        // Trigger Late Attendance Email (Advisory policy notice — does NOT mark absent)
        const recipientEmail =
          employee.email ||
          clerkUser?.primaryEmailAddress?.emailAddress ||
          clerkUser?.emailAddresses?.[0]?.emailAddress;

        if (recipientEmail) {
          sendTemplateEmail({
            to: recipientEmail,
            template: "late-attendance",
            data: {
              employeeName: employee.firstName || employee.name || "Team Member",
              employeeId: employee.employeeId || "",
              date: todayDate,
              punchTime: formatTime12h(checkInData.time),
              shiftStartTime: formatTime12h(
                new Date(new Date().setHours(shiftH, shiftM, 0, 0))
              ),
              lateMinutes,
              consecutiveLateDays,
              officeName: officeLocation?.officeName || "Headquarters",
            },
          }).catch((emailErr) => {
            console.error("[CheckInService] Failed to send late attendance email:", emailErr);
          });
        }
      }
    } catch (lateCheckErr) {
      console.error("[CheckInService] Error processing late attendance check:", lateCheckErr);
    }

    return {
      message: isLate
        ? `Check-in successful! Note: Marked late by ${lateMinutes} mins (Streak: ${consecutiveLateDays} day${consecutiveLateDays > 1 ? "s" : ""}).`
        : "Check-in successful! Face verified & office location confirmed.",
      punch,
      distanceMeters: geofenceResult.distanceMeters,
      faceMatchConfidence: faceMatchResult.confidence,
      isLate,
      lateMinutes,
      consecutiveLateDays: isLate ? consecutiveLateDays : 0,
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

    if (date) {
      const todayStr = getTodayDateString();
      if (date <= todayStr) {
        const punchedEmployeeIds = new Set(
          punches
            .filter((p) => p.employeeId && (p.employeeId._id || p.employeeId.id))
            .map((p) => (p.employeeId._id || p.employeeId.id).toString())
        );

        const allEmployees = await Employee.find({
          ...(organizationId ? { organizationId } : {}),
          status: { $nin: ["Terminated", "Inactive"] },
        }).select("name firstName lastName email department designation avatar employeeCode");

        const absentLogs = [];
        for (const emp of allEmployees) {
          if (!punchedEmployeeIds.has(emp._id.toString())) {
            absentLogs.push({
              _id: `absent_${emp._id}_${date}`,
              organizationId: emp.organizationId || organizationId,
              employeeId: emp,
              date,
              status: "ABSENT",
              checkIn: null,
              checkOut: null,
              durationMinutes: 0,
              createdAt: new Date(),
            });
          }
        }

        return [...punches, ...absentLogs];
      }
    }

    return punches;
  }
}
