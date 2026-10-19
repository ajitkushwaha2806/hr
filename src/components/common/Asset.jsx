"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Asset({
    src,
    asset,
    assetKey,
    alt = "",
    name = "",
    type = "avatar",
    className = "",
    imgClassName = "",
    loading = "lazy",
    ...props
}) {
    const rawInput = src !== undefined ? src : (asset !== undefined ? asset : assetKey);
    const [hasError, setHasError] = useState(false);

    const imageUrl = typeof rawInput === "string" ? rawInput : (rawInput?.url || rawInput?.src || "");

    if (!imageUrl || hasError) {
        return (
            <div
                className={cn(
                    "relative flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-muted-foreground font-semibold text-xs select-none overflow-hidden",
                    className
                )}
            >
                {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden bg-slate-50 dark:bg-zinc-900 flex items-center justify-center select-none", className)}>
            <img
                src={imageUrl}
                alt={alt || name || "Asset"}
                onError={() => setHasError(true)}
                loading={loading}
                decoding="async"
                className={cn("h-full w-full object-cover", imgClassName)}
                {...props}
            />
        </div>
    );
}

export default Asset;
