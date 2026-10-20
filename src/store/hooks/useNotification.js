"use client";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  showNotification,
  hideNotification,
  clearNotification,
} from "../slice/notificationSlice";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_DEFAULT_DURATIONS,
  NOTIFICATION_DURATIONS,
} from "@/constants/notification";

export default function useNotification() {
  const dispatch = useDispatch();

  const notify = useCallback(
    (type, message, options = {}) => {
      if (!message) return;
      const defaultDuration =
        NOTIFICATION_DEFAULT_DURATIONS[type] ?? NOTIFICATION_DURATIONS.DEFAULT;
      const duration =
        options.duration !== undefined ? options.duration : defaultDuration;

      dispatch(
        showNotification({
          type,
          message,
          duration,
          title: options.title,
          ...options,
        })
      );
    },
    [dispatch]
  );

  return {
    show: (payload) => dispatch(showNotification(payload)),
    hide: useCallback(() => dispatch(hideNotification()), [dispatch]),
    clear: useCallback(() => dispatch(clearNotification()), [dispatch]),
    success: useCallback(
      (message, options) => notify(NOTIFICATION_TYPES.SUCCESS, message, options),
      [notify]
    ),
    error: useCallback(
      (message, options) => notify(NOTIFICATION_TYPES.ERROR, message, options),
      [notify]
    ),
    warning: useCallback(
      (message, options) => notify(NOTIFICATION_TYPES.WARNING, message, options),
      [notify]
    ),
    info: useCallback(
      (message, options) => notify(NOTIFICATION_TYPES.INFO, message, options),
      [notify]
    ),
  };
}
