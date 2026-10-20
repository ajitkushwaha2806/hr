"use client";
import { useOrganization } from "@clerk/nextjs";
import useNotification from "@/store/hooks/useNotification";
import { NOTIFICATION_MESSAGES } from "@/constants/notification";
import { extractErrorMessage } from "@/lib/helpers/notification";
import { OnboardingFrontendService } from "@/services/frontend/onboarding";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useOnboarding() {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const { organization } = useOrganization();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["onboarding-status", organization?.id || "personal"],
    queryFn: () => OnboardingFrontendService.getStatus(),
    select: (res) => res?.data || res || {},
  });

  const submitMutation = useMutation({
    mutationFn: (payload) => OnboardingFrontendService.submitOnboarding(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success(res?.message || NOTIFICATION_MESSAGES.ONBOARDING.SUBMIT_SUCCESS);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, NOTIFICATION_MESSAGES.ONBOARDING.GENERAL_ERROR);
      notification.error(msg);
    },
  });

  return {
    user: data?.user || null,
    employee: data?.employee || null,
    isOnboarded: Boolean(data?.user?.isOnboarded),
    isLoading,
    isFetching,
    error,
    refetch,
    submitOnboarding: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}

export default useOnboarding;
