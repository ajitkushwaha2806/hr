import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const EmployeeService = {
  /**
   * Fetch all employees with optional filter query parameters
   */
  getEmployees: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.EMPLOYEE.GET_ALL, { params });
    return response.data;
  },

  /**
   * Fetch single employee by ID
   */
  getEmployeeById: async (id) => {
    const response = await api.get(API_ENDPOINTS.EMPLOYEE.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create a new employee
   */
  createEmployee: async (data) => {
    const response = await api.post(API_ENDPOINTS.EMPLOYEE.CREATE, data);
    return response.data;
  },

  /**
   * Update an employee
   */
  updateEmployee: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.EMPLOYEE.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete an employee
   */
  deleteEmployee: async (id) => {
    const response = await api.delete(API_ENDPOINTS.EMPLOYEE.DELETE(id));
    return response.data;
  },
};

export default EmployeeService;
