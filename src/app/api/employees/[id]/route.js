import { EmployeeService } from "@/services/backend/employee";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const employee = await EmployeeService.getEmployeeById(id);
  return successResponse(employee, "Employee retrieved successfully");
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const data = await req.json();
  const updatedEmployee = await EmployeeService.updateEmployee(id, data);
  return successResponse(updatedEmployee, "Employee updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const result = await EmployeeService.deleteEmployee(id);
  return successResponse(result, "Employee deleted successfully");
});
