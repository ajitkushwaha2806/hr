"use client";

export default function ProfileFieldItem({
  icon: Icon,
  label,
  value,
  badge,
  colSpan = 1,
  isMono = false,
  highlightColor,
}) {
  const isMissing =
    !value ||
    value === "Not provided" ||
    value === "Not specified" ||
    value === "Not assigned";

  return (
    <div
      className={`p-3 rounded-md bg-muted/30 border border-border/50 space-y-0.5 ${
        colSpan === 2 ? "sm:col-span-2" : colSpan === 3 ? "sm:col-span-3" : ""
      }`}
    >
      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-muted-foreground/80 shrink-0" />}
        {label}
      </span>
      <p
        className={`text-xs sm:text-sm truncate ${
          isMono && !isMissing ? "font-mono" : ""
        } ${
          isMissing
            ? "text-muted-foreground/60 font-normal italic"
            : highlightColor || "text-foreground font-semibold"
        }`}
      >
        {value || "Not provided"}
      </p>
      {badge && <div className="pt-0.5">{badge}</div>}
    </div>
  );
}
