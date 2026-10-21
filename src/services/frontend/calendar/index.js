import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const CalendarFrontendService = {
  getMonthlyDays: async ({ year, month } = {}) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await api.get(API_ENDPOINTS.CALENDAR.GET_DAYS, { params });
    return response.data;
  },

  updateDay: async ({ dateString, type, title, description }) => {
    const response = await api.put(API_ENDPOINTS.CALENDAR.UPDATE_DAY, {
      dateString,
      type,
      title,
      description,
    });
    return response.data;
  },

  clearDay: async ({ dateString }) => {
    const response = await api.put(API_ENDPOINTS.CALENDAR.UPDATE_DAY, {
      dateString,
      action: "clear",
    });
    return response.data;
  },

  seedCalendar: async (force = false) => {
    const response = await api.post(API_ENDPOINTS.CALENDAR.SEED, { force });
    return response.data;
  },
};

export default CalendarFrontendService;
