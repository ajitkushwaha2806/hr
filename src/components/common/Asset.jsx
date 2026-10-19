"use client";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/media";
import { useState, useEffect } from "react";
import { useRestaurant } from "@/store/hooks/useRestaurant";

const IMAGE_PLACEHOLDER = "/images/dish-placeholder.png";

export function Asset({
    src,
    asset,
    assetKey,
    alt = "",
    name = "",
    type = "dish",
    variant,
    className = "",
    imgClassName = "",
    restaurantLogo = null,
    restaurant = null,
    loading = "lazy",
    ...props
}) {
    const rawInput = src !== undefined ? src : (asset !== undefined ? asset : assetKey);

    const defaultVariant = type === "avatar" || type === "logo" 
        ? "thumbnail" 
        : (type === "banner" ? "detail" : "card");
    const activeVariant = variant || defaultVariant;

    let contextRestaurant = null;
    try {
        const restHook = useRestaurant();
        contextRestaurant = restHook?.restaurants?.find(r => r._id === restHook.restaurantId);
    } catch {
    }

    const effectiveLogo = restaurantLogo || restaurant?.logo || contextRestaurant?.logo;
    const canUseLogoFallback = type !== "logo" && Boolean(effectiveLogo);

    const primaryUrl = rawInput ? getImageUrl(rawInput, activeVariant) : "";
    const primaryOriginalUrl = rawInput ? getImageUrl(rawInput, "original") : "";

    const logoUrl = canUseLogoFallback ? getImageUrl(effectiveLogo, "thumbnail") : "";
    const logoOriginalUrl = canUseLogoFallback ? getImageUrl(effectiveLogo, "original") : "";

    const getInitialStage = () => {
        if (primaryUrl) return "primary";
        if (primaryOriginalUrl) return "primary-original";
        if (logoUrl) return "logo";
        if (logoOriginalUrl) return "logo-original";
        return "placeholder";
    };

    const [stage, setStage] = useState(getInitialStage);
    const [isLoading, setIsLoading] = useState(Boolean(primaryUrl || primaryOriginalUrl));

    useEffect(() => {
        setIsLoading(Boolean(primaryUrl || primaryOriginalUrl));
        setStage(getInitialStage());
    }, [primaryUrl, primaryOriginalUrl, logoUrl, logoOriginalUrl]);

    const handleError = () => {
        setIsLoading(false);
        if (stage === "primary") {
            if (primaryOriginalUrl && primaryOriginalUrl !== primaryUrl) {
                setStage("primary-original");
            } else if (logoUrl) {
                setStage("logo");
            } else if (logoOriginalUrl) {
                setStage("logo-original");
            } else {
                setStage("placeholder");
            }
        } else if (stage === "primary-original") {
            if (logoUrl) {
                setStage("logo");
            } else if (logoOriginalUrl) {
                setStage("logo-original");
            } else {
                setStage("placeholder");
            }
        } else if (stage === "logo") {
            if (logoOriginalUrl && logoOriginalUrl !== logoUrl) {
                setStage("logo-original");
            } else {
                setStage("placeholder");
            }
        } else {
            setStage("placeholder");
        }
    };

    if (stage === "placeholder") {
        return (
            <div className={cn("relative flex items-center justify-center bg-slate-100/70 dark:bg-zinc-800/40 select-none overflow-hidden", className)}>
                <img
                    src={IMAGE_PLACEHOLDER}
                    alt={alt || name || "Image Placeholder"}
                    className={cn("w-full h-full object-cover opacity-80 dark:opacity-60 pointer-events-none select-none", imgClassName)}
                    {...props}
                />
            </div>
        );
    }

    if (stage === "logo" || stage === "logo-original") {
        const currentLogoUrl = stage === "logo" ? (logoUrl || logoOriginalUrl) : logoOriginalUrl;
        return (
            <div className={cn("relative flex items-center justify-center bg-slate-50/80 dark:bg-zinc-900/60 p-2 sm:p-2.5 select-none overflow-hidden", className)}>
                <img
                    src={currentLogoUrl}
                    alt={restaurant?.name || contextRestaurant?.name || "Placeholder"}
                    onError={handleError}
                    loading={loading}
                    decoding="async"
                    className={cn(
                        "w-full h-full object-contain filter grayscale opacity-30 dark:opacity-20 contrast-75 transition-all duration-300 pointer-events-none select-none",
                        imgClassName
                    )}
                    {...props}
                />
            </div>
        );
    }

    const currentPrimaryUrl = stage === "primary" ? primaryUrl : primaryOriginalUrl;

    return (
        <div className={cn("relative overflow-hidden bg-slate-50 dark:bg-zinc-900 flex items-center justify-center select-none", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-neutral-200/70 dark:bg-zinc-800 animate-pulse z-10" />
            )}
            <img
                src={currentPrimaryUrl}
                alt={alt || name || ""}
                onLoad={() => setIsLoading(false)}
                onError={handleError}
                loading={loading}
                decoding="async"
                className={cn(
                    "h-full w-full object-cover transition-all duration-300 ease-in-out",
                    isLoading ? "scale-105 blur-xs" : "scale-100 blur-none",
                    imgClassName
                )}
                {...props}
            />
        </div>
    );
}

export default Asset;
