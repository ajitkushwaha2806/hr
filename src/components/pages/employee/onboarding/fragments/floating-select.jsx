"use client";

import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FloatingSelect({
  label,
  icon: Icon,
  error,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  children,
  className = "",
}) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10 pointer-events-none">
        <span
          className={`text-xs font-medium transition-colors ${
            error
              ? "text-destructive"
              : "text-slate-500 dark:text-zinc-400 group-focus-within:text-primary"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        className={`relative flex items-center h-12 border rounded-md transition-all bg-white dark:bg-zinc-900/50 ${
          error
            ? "border-destructive focus-within:ring-1 focus-within:ring-destructive"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-xs"
        } ${disabled ? "opacity-75 cursor-not-allowed bg-muted/40" : ""}`}
      >
        {Icon && (
          <div className="pl-3.5 flex items-center pointer-events-none shrink-0">
            <Icon
              className={`h-5 w-5 ${
                error ? "text-destructive" : "text-primary/90"
              }`}
            />
          </div>
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            size="lg"
            className={`border-0 focus:ring-0 shadow-none !h-full py-0 bg-transparent text-sm sm:text-base px-3 w-full rounded-md flex items-center ${
              disabled ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"
            }`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            side="bottom"
            sideOffset={6}
            align="start"
            className="rounded-md border border-border/80 bg-white dark:bg-zinc-900 shadow-xl p-1.5 min-w-[var(--anchor-width)]"
          >
            {children}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium mt-1.5">{error}</p>
      )}
    </div>
  );
}

export default FloatingSelect;
