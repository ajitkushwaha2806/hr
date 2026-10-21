import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import { getTodayDateString } from "@/lib/utils";
import AttendancePunch from "@/models/AttendancePunch";
import { OfficeLocationService } from "@/services/backend/location";
import { getAuthContext, getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, NotFoundError, UnauthorizedError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async () => {
  const clerkUser = await getAuthUser();
  if (!clerkUser?.id) {
    throw new UnauthorizedError("Authentication required");
  }

  const { orgId } = await getAuthContext();
  await dbConnect();

  const userEmail = (
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    ""
  ).toLowerCase().trim();

  const query = {
    $or: [
      { clerkId: clerkUser.id },
      ...(userEmail ? [{ email: { $regex: new RegExp(`^${userEmail}$`, "i") } }] : []),
    ],
  };

  let employee = null;
  if (orgId) {
    employee = await Employee.findOne({ ...query, organizationId: orgId }).lean();
  }
  if (!employee) {
    employee = await Employee.findOne(query).lean();
  }

  if (!employee) {
    throw new NotFoundError("Employee profile not found. Please complete onboarding first.");
  }

  const organizationId = employee.organizationId || orgId || "default_org";
  const officeLocation = await OfficeLocationService.getOfficeLocation(organizationId);

  const todayDate = getTodayDateString();
  const todayPunch = await AttendancePunch.findOne({
    organizationId,
    employeeId: employee._id,
    date: todayDate,
  }).lean();

  const formattedEmployee = {
    ...employee,
    id: employee._id,
    name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name || "Employee",
    hasEnrolledFace: Boolean(employee.avatar || employee.facePhoto),
  };

  return successResponse(
    {
      employee: formattedEmployee,
      officeLocation: officeLocation || null,
      todayPunch: todayPunch || null,
    },
    "Employee profile fetched successfully"
  );
});

export const PATCH = withErrorHandler(async (req) => {
  const clerkUser = await getAuthUser();
  if (!clerkUser?.id) {
    throw new UnauthorizedError("Authentication required");
  }

  const { orgId } = await getAuthContext();
  await dbConnect();

  const body = await req.json();

  const userEmail = (
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    ""
  ).toLowerCase().trim();

  const query = {
    $or: [
      { clerkId: clerkUser.id },
      ...(userEmail ? [{ email: { $regex: new RegExp(`^${userEmail}$`, "i") } }] : []),
    ],
  };

  const allowedUpdates = [
    "avatar",
    "facePhoto",
    "phone",
    "currentAddress",
    "permanentAddress",
    "bankDetails",
    "emergencyContact",
  ];

  const updateFields = {};
  for (const key of allowedUpdates) {
    if (body[key] !== undefined) {
      updateFields[key] = body[key];
    }
  }

  const updatedEmployee = await Employee.findOneAndUpdate(
    orgId ? { ...query, organizationId: orgId } : query,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedEmployee) {
    throw new NotFoundError("Employee profile not found");
  }

  return successResponse(updatedEmployee, "Employee profile updated successfully");
});
