import axios from "axios";
import { API_ENDPOINTS } from "../../api-endpoints";

export const RoleService = {
    getAll: async (resId) => {
        const response = await axios.get(API_ENDPOINTS.ROLE.GET_ALL(resId));
        return response.data;
    }
};
