import { CheckInService } from "@/services/backend/checkin";
import { getAuthContext, getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const POST = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const organizationId = orgId || "default_org";

  const body = await req.json();
  const { latitude, longitude, accuracyMeters, selfieUrl } = body;

  if (latitude === undefined || longitude === undefined) {
    throw new BadRequestError("Latitude and longitude are required for check-out verification");
  }

  if (!selfieUrl) {
    throw new BadRequestError("Live camera selfie is required for check-out verification");
  }

  const result = await CheckInService.checkOut(clerkUser, organizationId, {
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracyMeters: Number(accuracyMeters) || 0,
    selfieUrl,
  });

  return successResponse(result, "Check-out verified and recorded successfully");
});
