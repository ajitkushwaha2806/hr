import useNotification from "@/store/hooks/useNotification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useFormMutation = ({
  mutationFn,
  queryKey,
  invalidateKeys = [],
  successMessage = "Information updated successfully!",
  errorMessage = "Failed to update information.",
  
  extractUpdatedData = (response) => response?.data,
}) => {
  const queryClient = useQueryClient();
  const notification = useNotification();

  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      const updatedData = extractUpdatedData(response);
      
      if (updatedData && queryKey) {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              ...updatedData
            }
          };
        });
      }

      notification.success(successMessage);
      
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries(key);
      });
    },
    onError: (error) => {
      notification.error(error?.response?.data?.message || errorMessage);
    }
  });
};
