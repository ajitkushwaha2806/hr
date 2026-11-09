import { CheckInService } from "@/services/backend/checkin";
import { getAuthContext, getAuthUser, getUserRoleContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, ForbiddenError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);

  if (!callerContext.isAdmin) {
    throw new ForbiddenError("Admin access required. Team Leads must view team attendance via Employee Portal.");
  }

  const organizationId = orgId || "default_org";

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const logs = await CheckInService.getAdminAttendanceLogs(organizationId, {
    date: date || undefined,
    limit,
    callerContext,
  });

  return successResponse(logs, "Admin attendance logs retrieved successfully");
});
