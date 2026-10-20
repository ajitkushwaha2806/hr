export function extractErrorMessage(error, fallback = "An unexpected error occurred. Please try again.") {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (error?.response?.data?.message && typeof error.response.data.message === "string") {
    return error.response.data.message;
  }

  if (error?.response?.data?.error && typeof error.response.data.error === "string") {
    return error.response.data.error;
  }

  if (error?.message && typeof error.message === "string") {
    if (error.message.includes("Network Error")) {
      return "Network connection issue. Please check your internet connectivity.";
    }
    return error.message;
  }

  return fallback;
}

export { NOTIFICATION_TYPES, NOTIFICATION_DURATIONS, NOTIFICATION_DEFAULT_DURATIONS, NOTIFICATION_MESSAGES } from "@/constants/notification";
