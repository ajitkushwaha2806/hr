import { auth, currentUser } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/lib/api/response-handler";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import User from "@/models/User";

export async function getAuthContext({ requireOrg = false } = {}) {
  const session = await auth();

  if (!session?.userId) {
    throw new UnauthorizedError("Authentication required. Please sign in.");
  }

  if (requireOrg && !session.orgId) {
    throw new UnauthorizedError("Active organization required. Please select or create an organization.");
  }

  return {
    userId: session.userId,
    orgId: session.orgId || null,
    orgRole: session.orgRole || "org:member",
    session,
  };
}

export async function getAuthUser() {
  return await currentUser();
}

/**
 * Resolves role & scoping context for the authenticated caller.
 * Distinguishes between full organization Admins and scoped Team Leads.
 */
export async function getUserRoleContext(clerkUser = null, orgId = null, orgRole = "org:member") {
  const user = clerkUser || (await getAuthUser().catch(() => null));
  if (!user?.id) {
    return {
      isAdmin: false,
      isTeamLead: false,
      employee: null,
      managedEmployeeIds: [],
    };
  }

  await dbConnect();

  const userEmail = (
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    ""
  ).toLowerCase().trim();

  // 1. Locate Employee record for this user
  const empQuery = {
    $or: [{ clerkId: user.id }, ...(userEmail ? [{ email: userEmail }] : [])],
  };
  if (orgId) {
    empQuery.organizationId = { $in: [orgId, "default_org", null] };
  }
  const employee = await Employee.findOne(empQuery).lean();

  // 2. Locate DB User record
  const dbUser = await User.findOne({
    $or: [{ clerkId: user.id }, ...(userEmail ? [{ email: userEmail }] : [])],
  }).lean();

  // 3. Determine if caller is a full Admin
  const adminRoles = ["SUPER_ADMIN", "HR_ADMIN", "HR_MANAGER", "org:admin"];
  const isAdmin =
    orgRole === "org:admin" ||
    adminRoles.includes(dbUser?.role) ||
    adminRoles.includes(employee?.role);

  if (isAdmin) {
    return {
      isAdmin: true,
      isTeamLead: false,
      employee,
      managedEmployeeIds: null, // null = unrestricted access across all organization members
    };
  }

  // 4. Determine if caller is a Team Lead
  const isTeamLead =
    Boolean(employee?.isTeamLead) ||
    employee?.role === "TEAM_LEAD" ||
    dbUser?.role === "TEAM_LEAD";

  if (isTeamLead && employee?._id) {
    // Find all team members reporting to this Team Lead (supports both teamLeads array & legacy teamLead)
    const directReports = await Employee.find({
      $or: [
        { teamLeads: employee._id },
        { teamLead: employee._id },
      ],
    })
      .select("_id")
      .lean();

    const managedEmployeeIds = [
      employee._id,
      ...directReports.map((r) => r._id),
    ];

    return {
      isAdmin: false,
      isTeamLead: true,
      employee,
      managedEmployeeIds,
    };
  }

  return {
    isAdmin: false,
    isTeamLead: false,
    employee,
    managedEmployeeIds: employee?._id ? [employee._id] : [],
  };
}

export default getAuthContext;
