"use client";
import { useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";
import { showNotification, hideNotification, clearNotification } from "../slice/notificationSlice";
import { NOTIFICATION_TYPES, NOTIFICATION_DEFAULT_DURATIONS, NOTIFICATION_DURATIONS } from "@/constants/notification";

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

  return useMemo(
    () => ({
      show: (payload) => dispatch(showNotification(payload)),
      hide: () => dispatch(hideNotification()),
      clear: () => dispatch(clearNotification()),
      success: (message, options) =>
        notify(NOTIFICATION_TYPES.SUCCESS, message, options),
      error: (message, options) =>
        notify(NOTIFICATION_TYPES.ERROR, message, options),
      warning: (message, options) =>
        notify(NOTIFICATION_TYPES.WARNING, message, options),
      info: (message, options) =>
        notify(NOTIFICATION_TYPES.INFO, message, options),
    }),
    [dispatch, notify]
  );
}
