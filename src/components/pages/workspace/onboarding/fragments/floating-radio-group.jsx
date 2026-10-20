"use client";

export function FloatingRadioGroup({
  label,
  icon: Icon,
  options = [],
  value,
  onChange,
  error,
  className = "",
}) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10 pointer-events-none">
        <span
          className={`text-xs font-medium transition-colors ${
            error
              ? "text-destructive"
              : "text-slate-500 dark:text-zinc-400 group-hover:text-primary"
          }`}
        >
          {label}
        </span>
      </div>

      <div
        className={`relative flex items-center h-12 border rounded-md transition-all bg-white dark:bg-zinc-900/50 px-2.5 gap-2 ${
          error
            ? "border-destructive ring-1 ring-destructive"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 shadow-xs"
        }`}
      >
        {Icon && (
          <div className="pl-1.5 pr-1 flex items-center pointer-events-none shrink-0">
            <Icon
              className={`h-5 w-5 ${
                error ? "text-destructive" : "text-primary/90"
              }`}
            />
          </div>
        )}

        <div className="flex items-center gap-2 flex-1 h-full py-1.5">
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`flex-1 h-full flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
              >
                <span
                  className={`size-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40 bg-transparent"
                  }`}
                >
                  {isSelected && (
                    <span className="size-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium mt-1.5">{error}</p>
      )}
    </div>
  );
}

export default FloatingRadioGroup;
