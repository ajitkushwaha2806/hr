import axios from "axios";
import { API_ENDPOINTS } from "../../api-endpoints";

export const TableService = {
    getAll: async (resId, params = {}) => {
        const response = await axios.get(API_ENDPOINTS.TABLE.GET_ALL(resId), { params });
        return response.data;
    },
    create: async (resId, data) => {
        const response = await axios.post(API_ENDPOINTS.TABLE.CREATE(resId), data);
        return response.data;
    },
    update: async (resId, tableId, data) => {
        const response = await axios.patch(API_ENDPOINTS.TABLE.UPDATE(resId, tableId), data);
        return response.data;
    },
    delete: async (resId, tableId) => {
        const response = await axios.delete(API_ENDPOINTS.TABLE.DELETE(resId, tableId));
        return response.data;
    },
};
