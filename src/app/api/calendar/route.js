import { CalendarService } from "@/services/backend/calendar";
import { getAuthContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const { orgId, userId } = await getAuthContext();
  const organizationId = orgId || "default_org";

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : 2026;
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : 10;

  const result = await CalendarService.getMonthlyCalendar({
    organizationId,
    year,
    month,
    userId,
  });

  return successResponse(result, "Calendar days fetched successfully");
});

export const PUT = withErrorHandler(async (req) => {
  const { orgId, userId } = await getAuthContext();
  const organizationId = orgId || "default_org";

  const body = await req.json();
  const { dateString, type, title, description, action } = body;

  if (!dateString) {
    throw new BadRequestError("dateString is required");
  }

  let result;
  if (action === "clear") {
    result = await CalendarService.clearDay({ organizationId, dateString });
    return successResponse(result, `Day ${dateString} cleared back to default`);
  }

  if (!type) {
    throw new BadRequestError("Day type is required (WORKING_DAY, WEEKLY_OFF, HOLIDAY)");
  }

  result = await CalendarService.updateDay({
    organizationId,
    dateString,
    type,
    title,
    description,
    updatedBy: userId,
  });

  return successResponse(result, `Day ${dateString} updated to ${type}`);
});

export const POST = withErrorHandler(async (req) => {
  const { orgId } = await getAuthContext();
  const organizationId = orgId || "default_org";

  const body = await req.json().catch(() => ({}));
  const force = Boolean(body.force);

  const result = await CalendarService.seedOrganizationCalendar({
    organizationId,
    force,
  });

  return successResponse(result, "Calendar seeded from Oct 2026 to Dec 2027");
});
