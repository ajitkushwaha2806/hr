import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function TreeCheckbox({ checked, onChange, indeterminate }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(!checked); }}
      className={cn(
        "flex shrink-0 items-center justify-center w-5 h-5 rounded-[4px] border transition-all duration-200",
        checked || indeterminate
          ? "bg-[#212121] border-[#212121]"
          : "border-slate-300 bg-white hover:border-slate-400"
      )}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      {indeterminate && !checked && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
    </button>
  );
}
