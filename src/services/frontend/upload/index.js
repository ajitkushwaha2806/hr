import axios from "axios";

export const UploadFrontendService = {
  async uploadDocument(file, category = "documents", onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const response = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data?.data || response.data;
  },
};

export default UploadFrontendService;
