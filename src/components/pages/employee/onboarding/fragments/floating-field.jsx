"use client";

import { Input } from "@/components/ui/input";

export function FloatingField({
  label,
  icon: Icon,
  error,
  disabled = false,
  helperText,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  children,
  ...props
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
        className={`relative flex items-center border rounded-md transition-all bg-white dark:bg-zinc-900/50 ${
          error
            ? "border-destructive focus-within:ring-1 focus-within:ring-destructive"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-xs"
        } ${disabled ? "opacity-75 cursor-not-allowed bg-muted/40" : ""}`}
      >
        {Icon && (
          <div className="pl-3.5 flex items-center pointer-events-none">
            <Icon
              className={`h-5 w-5 ${
                error ? "text-destructive" : "text-primary/90"
              }`}
            />
          </div>
        )}
        {children || (
          <Input
            id={id}
            name={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-sm sm:text-base px-3 w-full rounded-md ${
              disabled ? "cursor-not-allowed text-muted-foreground" : ""
            }`}
            {...props}
          />
        )}
      </div>
      {error ? (
        <p className="text-xs text-destructive font-medium mt-1.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export default FloatingField;
