import api from "@/lib/api/axiosInstance";

export const WebsiteConfigService = {
  getWebsiteConfig: async (restaurantId) => {
    try {
      const response = await api.get(`/api/restaurant/${restaurantId}/website-configuration`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateWebsiteConfig: async (restaurantId, data) => {
    try {
      const response = await api.put(`/api/restaurant/${restaurantId}/website-configuration`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
