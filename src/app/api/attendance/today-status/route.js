import { CheckInService } from "@/services/backend/checkin";
import { getAuthContext, getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const organizationId = orgId || "default_org";

  const { searchParams } = new URL(req.url);
  const clientDate = searchParams.get("date") || null;

  const status = await CheckInService.getTodayStatus(clerkUser, organizationId, clientDate);

  return successResponse(status, "Today attendance status fetched successfully");
});
