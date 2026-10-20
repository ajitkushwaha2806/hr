import { auth, currentUser } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/lib/api/response-handler";

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

export default getAuthContext;