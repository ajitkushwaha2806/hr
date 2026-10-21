import { LeaveService } from "@/services/backend/leave";
import { getAuthContext, getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const organizationId = orgId || "default_org";

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const month = searchParams.get("month") || null;
  const search = searchParams.get("search") || "";

  const data = await LeaveService.adminGetLeaves(organizationId, { status, month, search });
  return successResponse(data, "Admin leaves fetched successfully");
});

export const PATCH = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const organizationId = orgId || "default_org";

  const body = await req.json();
  const { leaveId, action, adminRemarks } = body || {};

  const leave = await LeaveService.adminReviewLeave(clerkUser, organizationId, leaveId, {
    action,
    adminRemarks,
  });

  return successResponse(leave, `Leave request has been ${action === "APPROVE" ? "approved" : "rejected"} successfully`);
});
