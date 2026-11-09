import { EmployeeService } from "@/services/backend/employee";
import { getAuthContext, getAuthUser, getUserRoleContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, BadRequestError, ForbiddenError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const employee = await EmployeeService.getEmployeeById(id, orgId);

  // If caller is Team Lead (and not Admin), ensure employee is in their managed team
  if (callerContext?.isTeamLead && !callerContext?.isAdmin && Array.isArray(callerContext?.managedEmployeeIds)) {
    const isManaged = callerContext.managedEmployeeIds.some(
      (mId) => mId.toString() === employee._id.toString()
    );
    if (!isManaged) {
      throw new ForbiddenError("You only have permission to view profiles of your assigned team members.");
    }
  }

  return successResponse(employee, "Employee retrieved successfully");
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);
  if (!callerContext.isAdmin) {
    throw new ForbiddenError("Admin access required to modify employee profiles.");
  }

  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const data = await req.json();
  const updatedEmployee = await EmployeeService.updateEmployee(id, data, orgId);
  return successResponse(updatedEmployee, "Employee updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);
  if (!callerContext.isAdmin) {
    throw new ForbiddenError("Admin access required to delete employees.");
  }

  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const result = await EmployeeService.deleteEmployee(id, orgId);
  return successResponse(result, "Employee deleted successfully");
});
