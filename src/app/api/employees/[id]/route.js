import { EmployeeService } from "@/services/backend/employee";
import { getAuthContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { orgId } = await getAuthContext();
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const employee = await EmployeeService.getEmployeeById(id, orgId);
  return successResponse(employee, "Employee retrieved successfully");
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { orgId } = await getAuthContext();
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const data = await req.json();
  const updatedEmployee = await EmployeeService.updateEmployee(id, data, orgId);
  return successResponse(updatedEmployee, "Employee updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { orgId } = await getAuthContext();
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const result = await EmployeeService.deleteEmployee(id, orgId);
  return successResponse(result, "Employee deleted successfully");
});
