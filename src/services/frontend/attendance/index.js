import axios from "axios";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const AttendanceService = {
  async getTodayStatus() {
    const res = await axios.get(API_ENDPOINTS.ATTENDANCE.TODAY_STATUS);
    return res.data;
  },

  async checkIn({ latitude, longitude, accuracyMeters, selfieUrl }) {
    const res = await axios.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, {
      latitude,
      longitude,
      accuracyMeters,
      selfieUrl,
    });
    return res.data;
  },

  async checkOut({ latitude, longitude, accuracyMeters, selfieUrl }) {
    const res = await axios.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, {
      latitude,
      longitude,
      accuracyMeters,
      selfieUrl,
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
