"use client";
import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[99999] flex items-center justify-center gap-2 px-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 bg-red-600 text-white text-xs sm:text-sm font-medium shadow-md"
        >
          <WifiOff className="w-4 h-4 animate-pulse flex-shrink-0" />
          <span>You are offline. Please check your internet connection.</span>
        </motion.div>
      )}

      {!isOffline && showReconnected && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[99999] flex items-center justify-center gap-2 px-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-medium shadow-md"
        >
          <Wifi className="w-4 h-4 flex-shrink-0" />
          <span>Back online! Reconnected to trueHR.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
