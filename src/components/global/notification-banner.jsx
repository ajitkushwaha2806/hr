"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import useNotification from "@/store/hooks/useNotification";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";

const variants = {
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    progress: "bg-emerald-500",
  },

  error: {
    icon: CircleAlert,
    className:
      "border-red-300 dark:border-red-800/60 bg-red-50/95 dark:bg-red-950/90 text-red-950 dark:text-red-100",
    iconClass: "text-red-600 dark:text-red-400",
    progress: "bg-red-500",
  },

  warning: {
    icon: TriangleAlert,
    className:
      "border-amber-300 dark:border-amber-800/60 bg-amber-50/95 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100",
    iconClass: "text-amber-600 dark:text-amber-400",
    progress: "bg-amber-500",
  },

  info: {
    icon: Info,
    className:
      "border-sky-300 dark:border-sky-800/60 bg-sky-50/95 dark:bg-sky-950/90 text-sky-950 dark:text-sky-100",
    iconClass: "text-sky-600 dark:text-sky-400",
    progress: "bg-sky-500",
  },
};

export default function NotificationBanner() {
  const notification = useSelector((state) => state.notification);
  const notify = useNotification();

  useEffect(() => {
    if (!notification.visible) return;
    if (notification.duration == null) return;

    const timer = setTimeout(() => {
      notify.hide();
    }, notification.duration);

    return () => clearTimeout(timer);
  }, [notification.visible, notification.duration, notify]);

  if (!notification.visible) return null;

  const config = variants[notification.type] || variants.info;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        key="notification-banner"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-[9999] border-b backdrop-blur-md shadow-md ${config.className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="relative mx-auto flex h-14 max-w-screen-2xl items-center gap-3.5 px-4 sm:px-8">
          <Icon className={`size-5 shrink-0 ${config.iconClass}`} />

          <div className="min-w-0 flex-1">
            {notification.title && (
              <p className="font-semibold text-xs leading-none mb-1">
                {notification.title}
              </p>
            )}
            <p className="truncate text-xs sm:text-sm font-medium leading-tight">
              {notification.message}
            </p>
          </div>

          <button
            onClick={notify.hide}
            aria-label="Dismiss notification"
            className="rounded-lg p-1.5 transition hover:bg-black/5 dark:hover:bg-white/10 shrink-0 text-current"
          >
            <X className="size-4" />
          </button>

          {notification.duration != null && (
            <motion.div
              key={`progress-${notification.duration}`}
              initial={{ width: "100%" }}
              animate={{ width: 0 }}
              transition={{
                duration: notification.duration / 1000,
                ease: "linear",
              }}
              className={`absolute bottom-0 left-0 h-[2.5px] ${config.progress}`}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}