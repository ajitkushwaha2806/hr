import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const EmployeeService = {
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.EMPLOYEE.PROFILE);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch(API_ENDPOINTS.EMPLOYEE.PROFILE, data);
    return response.data;
  },

  getEmployees: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.EMPLOYEE.GET_ALL, { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(API_ENDPOINTS.EMPLOYEE.GET_BY_ID(id));
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await api.post(API_ENDPOINTS.EMPLOYEE.CREATE, data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.EMPLOYEE.UPDATE(id), data);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(API_ENDPOINTS.EMPLOYEE.DELETE(id));
    return response.data;
  },
};

export default EmployeeService;
