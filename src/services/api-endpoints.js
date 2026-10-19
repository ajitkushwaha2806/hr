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
};