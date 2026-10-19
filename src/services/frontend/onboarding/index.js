import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const OnboardingFrontendService = {
  getStatus: async () => {
    const response = await api.get(API_ENDPOINTS.ONBOARDING.GET_STATUS);
    return response.data;
  },

  submitOnboarding: async (data) => {
    const response = await api.post(API_ENDPOINTS.ONBOARDING.SUBMIT, data);
    return response.data;
  },
};

export default OnboardingFrontendService;
