"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Loader({ fullscreen = false, className }) {
  const content = (
    <div className={cn(
      "relative flex items-center justify-center p-3 select-none",
      !fullscreen && "w-full min-h-[80px]"
    )}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200/20 dark:border-neutral-800/40" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 border-r-orange-500"
          style={{
            filter: "drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {(
        fullscreen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[3px]",
              className
            )}
          >
            {content}
          </motion.div>
        ) : (
          <div className={className}>
            {content}
          </div>
        )
      )}
    </AnimatePresence>
  );
}
