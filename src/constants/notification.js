export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export const NOTIFICATION_DURATIONS = {
  SHORT: 2500,
  DEFAULT: 4000,
  LONG: 6000,
  STICKY: null,
};

export const NOTIFICATION_DEFAULT_DURATIONS = {
  [NOTIFICATION_TYPES.SUCCESS]: 3500,
  [NOTIFICATION_TYPES.INFO]: 3500,
  [NOTIFICATION_TYPES.WARNING]: 4500,
  [NOTIFICATION_TYPES.ERROR]: 5500,
};

export const NOTIFICATION_MESSAGES = {
  ONBOARDING: {
    SUBMIT_SUCCESS: "Employee onboarding profile submitted successfully!",
    UPDATE_SUCCESS: "Employee profile updated successfully!",
    VALIDATION_ERROR: "Please fill in all required fields marked with an asterisk (*).",
    STEP_VALIDATION_ERROR: "Please complete the required fields in this step before proceeding.",
    GENERAL_ERROR: "Failed to submit onboarding profile. Please check your network and try again.",
  },
  EMPLOYEE: {
    CREATE_SUCCESS: "Employee added successfully!",
    UPDATE_SUCCESS: "Employee details updated successfully!",
    DELETE_SUCCESS: "Employee record removed successfully!",
    CREATE_ERROR: "Failed to add employee.",
    UPDATE_ERROR: "Failed to update employee details.",
    DELETE_ERROR: "Failed to remove employee record.",
    VALIDATION_ERROR: "Please fill in all required employee fields.",
  },
  AUTH: {
    SESSION_EXPIRED: "Your session has expired. Please sign in again.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
  },
};
