import { LeaveService } from "@/services/backend/leave";
import { getAuthContext, getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { orgId } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const organizationId = orgId || "default_org";

  const { id } = await params;
  const leave = await LeaveService.cancelLeave(clerkUser, organizationId, id);

  return successResponse(leave, "Leave request cancelled successfully");
});
