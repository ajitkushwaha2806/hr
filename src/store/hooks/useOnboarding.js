"use client";
import useNotification from "@/store/hooks/useNotification";
import { OnboardingFrontendService } from "@/services/frontend/onboarding";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useOnboarding() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => OnboardingFrontendService.getStatus(),
    select: (res) => res?.data || res || {},
  });

  const submitMutation = useMutation({
    mutationFn: (payload) => OnboardingFrontendService.submitOnboarding(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success(res?.message || "Onboarding profile saved successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit onboarding";
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
