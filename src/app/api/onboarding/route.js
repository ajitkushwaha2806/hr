import { currentUser } from "@clerk/nextjs/server";
import { OnboardingService } from "@/services/backend/onboarding";
import { withErrorHandler, successResponse, UnauthorizedError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new UnauthorizedError("Please sign in to access onboarding");
  }

  const result = await OnboardingService.getStatus(clerkUser);
  return successResponse(result, "Onboarding status retrieved successfully");
});

export const POST = withErrorHandler(async (req) => {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new UnauthorizedError("Please sign in to complete onboarding");
  }

  const body = await req.json();
  const result = await OnboardingService.completeOnboarding(clerkUser, body);
  return successResponse(result, "Employee onboarding completed successfully!");
});
