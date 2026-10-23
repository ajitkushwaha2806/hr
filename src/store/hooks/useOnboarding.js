"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import useNotification from "@/store/hooks/useNotification";
import { NOTIFICATION_MESSAGES } from "@/constants/notification";
import { extractErrorMessage } from "@/lib/helpers/notification";
import { OnboardingFrontendService } from "@/services/frontend/onboarding";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useOnboarding() {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const { organization, membership } = useOrganization();
  const { user: clerkUser } = useUser();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["onboarding-status", organization?.id || "personal"],
    queryFn: () => OnboardingFrontendService.getStatus(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => res?.data || res || {},
  });

  const submitMutation = useMutation({
    mutationFn: (payload) => OnboardingFrontendService.submitOnboarding(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee-profile"] });
      notification.success(res?.message || NOTIFICATION_MESSAGES.ONBOARDING.SUBMIT_SUCCESS);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, NOTIFICATION_MESSAGES.ONBOARDING.GENERAL_ERROR);
      notification.error(msg);
    },
  });

  const rawRole =
    membership?.role ||
    data?.user?.role ||
    clerkUser?.publicMetadata?.role ||
    "org:member";

  const roleStr = String(rawRole).toLowerCase();
  const isAdmin =
    Boolean(data?.user?.isAdmin) ||
    roleStr === "org:admin" ||
    roleStr === "admin" ||
    roleStr === "super_admin" ||
    roleStr === "hr_admin" ||
    roleStr.includes("admin");

  return {
    user: data?.user || null,
    companyDetails: data?.companyDetails || null,
    isOnboarded: isAdmin ? true : Boolean(data?.user?.isOnboarded),
    isAdmin,
    role: rawRole,
    isLoading,
    isFetching,
    error,
    refetch,
    submitOnboarding: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}

export default useOnboarding;
