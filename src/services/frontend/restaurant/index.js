import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "../../api-endpoints";

export const RestaurantService = {
  getAllRestaurants: async () => {
    const response = await api.get(API_ENDPOINTS.RESTAURANT.GET_ALL_RESTAURANT);
    return response.data;
  },

  getRestaurantById: async (id) => {
    const response = await api.get(API_ENDPOINTS.RESTAURANT.GET_RESTAURANT_BY_ID(id));
    return response.data;
  },

  createRestaurant: async (restaurantData) => {
    const response = await api.post(API_ENDPOINTS.RESTAURANT.CREATE_RESTAURANT, restaurantData);
    return response.data;
  },

  updateRestaurant: async (id, restaurantData) => {
    const response = await api.put(
      API_ENDPOINTS.RESTAURANT.UPDATE_RESTAURANT(id),
      restaurantData
    );
    return response.data;
  },

  deleteRestaurant: async (id) => {
    const response = await api.delete(API_ENDPOINTS.RESTAURANT.DELETE_RESTAURANT(id));
    return response.data;
  },
};