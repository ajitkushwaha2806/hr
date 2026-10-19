import { ImageUploadService } from "../images";

export const UploadService = {
  uploadFile: async (formData, restaurantId) => {
    return ImageUploadService.uploadImage(formData, restaurantId);
  },
};
