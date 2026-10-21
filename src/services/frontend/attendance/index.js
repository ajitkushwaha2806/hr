import axios from "axios";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const AttendanceService = {
  async getTodayStatus(clientDate) {
    const params = clientDate ? { date: clientDate } : {};
    const res = await axios.get(API_ENDPOINTS.ATTENDANCE.TODAY_STATUS, { params });
    return res.data;
  },

  async checkIn({ latitude, longitude, accuracyMeters, selfieUrl, clientDate }) {
    const res = await axios.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, {
      latitude,
      longitude,
      accuracyMeters,
      selfieUrl,
      clientDate,
    });
    return res.data;
  },

  async checkOut({ latitude, longitude, accuracyMeters, selfieUrl, clientDate }) {
    const res = await axios.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, {
      latitude,
      longitude,
      accuracyMeters,
      selfieUrl,
      clientDate,
    });
    return res.data;
  },

  async getOfficeLocation() {
    const res = await axios.get(API_ENDPOINTS.OFFICE_LOCATION.GET);
    return res.data;
  },

  async setOfficeLocation(payload) {
    const res = await axios.post(API_ENDPOINTS.OFFICE_LOCATION.SET, payload);
    return res.data;
  },

  async getAdminAttendanceLogs(params = {}) {
    const res = await axios.get(API_ENDPOINTS.ATTENDANCE.ADMIN_LOGS, { params });
    return res.data;
  },
};
