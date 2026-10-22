import api from "@/lib/api/axiosInstance";

export const DepartmentFrontendService = {
  getDepartments: async (orgId) => {
    const url = orgId ? `/api/departments?orgId=${encodeURIComponent(orgId)}` : "/api/departments";
    const response = await api.get(url);
    return response.data?.data || response.data || [];
  },

  createDepartment: async (data) => {
    const response = await api.post("/api/admin/departments", data);
    return response.data?.data || response.data;
  },

  updateDepartment: async (data) => {
    const response = await api.patch("/api/admin/departments", data);
    return response.data?.data || response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/api/admin/departments?id=${encodeURIComponent(id)}`);
    return response.data?.data || response.data;
  },
};

export default DepartmentFrontendService;
