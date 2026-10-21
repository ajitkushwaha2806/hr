import { LeaveService } from "@/services/backend/leave";
import { getAuthContext, getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const organizationId = orgId || "default_org";

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || null;

  const data = await LeaveService.getMyLeaves(clerkUser, organizationId, month);
  return successResponse(data, "My leaves fetched successfully");
});

export const POST = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const organizationId = orgId || "default_org";

  const body = await req.json();
  const leave = await LeaveService.applyLeave(clerkUser, organizationId, body);

  return successResponse(leave, "Leave request submitted successfully for admin approval", 201);
});
