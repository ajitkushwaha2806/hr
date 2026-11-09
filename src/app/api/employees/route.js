import { EmployeeService } from "@/services/backend/employee";
import { getAuthContext, getAuthUser, getUserRoleContext } from "@/lib/api/helpers/auth";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

const EMPLOYEE_REQUIRED_FIELDS = ["firstName", "lastName", "email", "phone", "department", "designation"];

export const GET = withErrorHandler(async (req) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const { searchParams } = new URL(req.url);

  // If requesting list of designated team leads for dropdown assignment
  if (searchParams.get("teamLeads") === "true") {
    const leads = await EmployeeService.getTeamLeads(orgId);
    return successResponse(leads, "Team leads fetched successfully");
  }

  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);

  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "";
  const status = searchParams.get("status") || "";
  const employmentType = searchParams.get("employmentType") || "";
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 50;

  const result = await EmployeeService.getEmployees({
    organizationId: orgId,
    search,
    department,
    status,
    employmentType,
    page,
    limit,
    callerContext,
  });

  return successResponse(result, "Employees fetched successfully");
});

export const POST = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const data = await req.json();

  const { isValid, message } = validateRequiredFields(data, EMPLOYEE_REQUIRED_FIELDS);
  if (!isValid) {
    throw new BadRequestError(message);
  }

  const newEmployee = await EmployeeService.createEmployee({
    ...data,
    organizationId: data.organizationId || orgId,
  });
  return successResponse(newEmployee, "Employee created successfully", 201);
});
