import dbConnect from "@/lib/db";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { invalidateItemCache } from "@/lib/api/helpers/cacheKeys";
import { autoApplyImagesToItems } from "@/services/backend/images/snapSearch";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { itemIds = [], overwrite = false } = body;

  const result = await autoApplyImagesToItems({
    restaurantId: id,
    itemIds,
    overwrite,
  });

  if (result.matchedCount > 0) {
    await invalidateItemCache(id);
  }

  return successResponse(
    result,
    `Auto-applied ${result.matchedCount} images from photo library successfully.`
  );
});
