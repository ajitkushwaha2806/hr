import { LeaveService } from "@/services/backend/leave";
import { getAuthContext, getAuthUser, getUserRoleContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, ForbiddenError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);

  if (!callerContext.isAdmin) {
    throw new ForbiddenError("Admin access required");
  }

  const organizationId = orgId || "default_org";

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const month = searchParams.get("month") || null;
  const search = searchParams.get("search") || "";

  const data = await LeaveService.adminGetLeaves(organizationId, {
    status,
    month,
    search,
    callerContext,
  });
  return successResponse(data, "Admin leaves fetched successfully");
});

export const PATCH = withErrorHandler(async (req) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);

  if (!callerContext.isAdmin) {
    throw new ForbiddenError("Admin access required");
  }

  const organizationId = orgId || "default_org";

  const body = await req.json();
  const { leaveId, action, adminRemarks } = body || {};

  const leave = await LeaveService.adminReviewLeave(clerkUser, organizationId, leaveId, {
    action,
    adminRemarks,
    callerContext,
  });

  return successResponse(leave, `Leave request has been ${action === "APPROVE" ? "approved" : "rejected"} successfully`);
});
