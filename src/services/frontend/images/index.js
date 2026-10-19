import axios from "axios";
import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "../../api-endpoints";

const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({ width: 0, height: 0 });
      return;
    }
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
};

export const ImageUploadService = {
  uploadImage: async (formData, restaurantId) => {
    const file = formData.get("file");
    if (!file) {
      throw new Error("No file provided");
    }

    const path = formData.get("path") || "general";
    
    if (!restaurantId) {
      throw new Error("Active restaurant context is required for uploading images.");
    }

    const { width, height } = await getImageDimensions(file);

    const presignResponse = await api.post(API_ENDPOINTS.UPLOAD.PRESIGN(restaurantId), {
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      width,
      height,
      path,
    });

    const { uploadUrl, key, imageId } = presignResponse.data?.data || {};

    if (!uploadUrl) {
      throw new Error("Failed to get upload URL");
    }

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return {
      success: true,
      key,
      imageId,
      data: {
        key,
        imageId,
      },
    };
  },
};
