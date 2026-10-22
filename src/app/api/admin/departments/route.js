import { DepartmentBackendService } from "@/services/backend/department";
import { getAuthContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, errorResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const departments = await DepartmentBackendService.getDepartments(orgId);
  return successResponse(departments, "Departments fetched successfully");
});

export const POST = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const body = await req.json();
  const department = await DepartmentBackendService.createDepartment(orgId, body || {});
  return successResponse(department, "Department created successfully", 201);
});

export const PATCH = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const body = await req.json();
  const { departmentId, name, designations } = body || {};
  const department = await DepartmentBackendService.updateDepartment(orgId, departmentId, { name, designations });
  return successResponse(department, "Department updated successfully");
});

export const DELETE = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("id");
  await DepartmentBackendService.deleteDepartment(orgId, departmentId);
  return successResponse(null, "Department deleted successfully");
});
