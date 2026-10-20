"use client";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
  xl: "size-12",
};

export function Spinner({ size = "md", className, ...props }) {
  const sizeClass = SIZES[size] || size;
  return (
    <svg
      className={cn("animate-spin text-primary shrink-0", sizeClass, className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function Loader({
  fullscreen = false,
  fixed = false,
  size = "lg",
  className,
  spinnerClassName,
  ...props
}) {
  if (fullscreen) {
    return (
      <div
        className={cn(
          "min-h-screen w-full flex items-center justify-center bg-background/60 dark:bg-zinc-950/80 backdrop-blur-xs select-none",
          className
        )}
        {...props}
      >
        <Spinner size={size} className={spinnerClassName} />
      </div>
    );
  }

  if (fixed) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/60 dark:bg-zinc-950/80 backdrop-blur-xs select-none",
          className
        )}
        {...props}
      >
        <Spinner size={size} className={spinnerClassName} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center w-full min-h-[120px] p-4 select-none",
        className
      )}
      {...props}
    >
      <Spinner size={size} className={spinnerClassName} />
    </div>
  );
}
