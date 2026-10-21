import { OfficeLocationService } from "@/services/backend/location";
import { getAuthContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async () => {
  const { orgId } = await getAuthContext();
  const organizationId = orgId || "default_org";

  const location = await OfficeLocationService.getOfficeLocation(organizationId);

  return successResponse(location, "Office location fetched successfully");
});

export const POST = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const organizationId = orgId || "default_org";
  const body = await req.json();

  const updatedLocation = await OfficeLocationService.setOfficeLocation(organizationId, body);

  return successResponse(updatedLocation, "Office location calibrated successfully");
});
