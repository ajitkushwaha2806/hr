export const API_ENDPOINTS = {
  EMPLOYEE: {
    GET_ALL: "/api/employees",
    CREATE: "/api/employees",
    GET_BY_ID: (id) => `/api/employees/${id}`,
    UPDATE: (id) => `/api/employees/${id}`,
    DELETE: (id) => `/api/employees/${id}`,
  },
  ONBOARDING: {
    GET_STATUS: "/api/onboarding",
    SUBMIT: "/api/onboarding",
  },
  CALENDAR: {
    GET_DAYS: "/api/calendar",
    UPDATE_DAY: "/api/calendar",
    SEED: "/api/calendar",
  },
  ATTENDANCE: {
    TODAY_STATUS: "/api/attendance/today-status",
    CHECK_IN: "/api/attendance/check-in",
    CHECK_OUT: "/api/attendance/check-out",
    ADMIN_LOGS: "/api/admin/attendance",
  },
  OFFICE_LOCATION: {
    GET: "/api/office-location",
    SET: "/api/office-location",
  },
};