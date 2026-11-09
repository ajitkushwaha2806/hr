import { CheckInService } from "@/services/backend/checkin";
import { getAuthContext, getAuthUser, getUserRoleContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, ForbiddenError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);

  if (!callerContext.isTeamLead && !callerContext.isAdmin) {
    throw new ForbiddenError("Team Lead privileges required to view team attendance logs");
  }

  const organizationId = orgId || "default_org";

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  const logs = await CheckInService.getAdminAttendanceLogs(organizationId, {
    date: date || undefined,
    limit,
    callerContext,
  });

  return successResponse(logs, "Team attendance logs retrieved successfully");
});

