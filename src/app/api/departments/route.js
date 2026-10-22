import dbConnect from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Department from "@/models/Department";
import { DepartmentBackendService } from "@/services/backend/department";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  let orgId = searchParams.get("orgId") || req.headers.get("x-organization-id");

  if (!orgId) {
    try {
      const session = await auth();
      if (session?.orgId) {
        orgId = session.orgId;
      }
    } catch {
    }
  }

  if (!orgId) {
    const existing = await Department.findOne({}).lean();
    orgId = existing?.organizationId || "default_org";
  }

  const departments = await DepartmentBackendService.getDepartments(orgId, { autoSeed: true });
  return successResponse(departments, "Departments fetched successfully");
});
