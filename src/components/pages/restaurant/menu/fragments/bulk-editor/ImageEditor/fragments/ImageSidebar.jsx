"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Asset } from "@/components/common/Asset";
import useNotification from "@/store/hooks/useNotification";
import { useEffect, useState, useRef, useCallback } from "react";
import { useImageSearch } from "@/store/hooks/useImageSearch";
import { Search, X, Loader2, Check, Image as ImageIcon, Sparkles } from "lucide-react";

export function ImageSidebar({ item, isOpen, onClose, onUploadComplete }) {
    const [searchQuery, setSearchQuery] = useState(item?.name || "");
    const [prevItemName, setPrevItemName] = useState(item?.name);
    const [debouncedQuery, setDebouncedQuery] = useState(item?.name || "");
    const [uploadingId, setUploadingId] = useState(null);
    const [selectedFoodType, setSelectedFoodType] = useState(() => {
        if (item?.dietaryType === "veg") return "veg";
        if (item?.dietaryType === "non-veg") return "non-veg";
        return "all";
    });

    const notification = useNotification();
    const observer = useRef();

    // When a new item is opened, reset search and dietary type
    if (item?.name && item.name !== prevItemName) {
        setPrevItemName(item.name);
        setSearchQuery(item.name);
        setDebouncedQuery(item.name);
        if (item.dietaryType === "veg") {
            setSelectedFoodType("veg");
        } else if (item.dietaryType === "non-veg") {
            setSelectedFoodType("non-veg");
        } else {
            setSelectedFoodType("all");
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const activeFoodType = selectedFoodType === "all" ? null : selectedFoodType;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useImageSearch(debouncedQuery, {
        enabled: isOpen,
        limit: 15,
        foodType: activeFoodType,
    });

    const images = data?.pages.flatMap(page => page.data) || [];

    const lastImageElementRef = useCallback(node => {
        if (isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        }, { rootMargin: "250px" });
        
        if (node) observer.current.observe(node);
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const currentItemRef = useRef(item);
    useEffect(() => {
        currentItemRef.current = item;
    }, [item]);

    const handleSelectImage = async (image) => {
        if (uploadingId) return;
        const targetItem = item;
        if (!targetItem?._id) return;
        
        try {
            setUploadingId(image._id || image.id);
            const imageKey = image.key || image.imageUrl || image.image_url;
            if (!imageKey) throw new Error("Image key is missing");

            await onUploadComplete(targetItem._id, imageKey);
            notification.success(`Image applied to "${targetItem.name}"!`);

            if (currentItemRef.current?._id === targetItem._id) {
                onClose();
            }
        } catch (error) {
            notification.error("Failed to apply image. Please try again.");
            console.error(error);
        } finally {
            setUploadingId(null);
        }
    };

    if (!item && !isOpen) return null;

    return (
        <>
            <div 
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />
            
            <div 
                className={cn(
                    "fixed z-[110] flex flex-col bg-white dark:bg-zinc-900 shadow-2xl transition-all duration-300 ease-out",
                    "max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:h-[88vh] max-sm:max-h-[92vh] max-sm:rounded-t-[24px] max-sm:border-t max-sm:border-border/60",
                    "sm:top-0 sm:bottom-0 sm:right-0 sm:left-auto sm:h-screen sm:w-[540px] md:w-[600px] lg:w-[680px] sm:border-l sm:border-border/60 sm:rounded-none",
                    isOpen 
                        ? "max-sm:translate-y-0 sm:translate-x-0 opacity-100 visible" 
                        : "max-sm:translate-y-full sm:translate-x-full opacity-0 invisible pointer-events-none"
                )}
            >
                <div 
                    onClick={onClose}
                    className="sm:hidden mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-zinc-700 shrink-0 cursor-pointer" 
                    title="Swipe down to close"
                />

                <div className="px-5 sm:px-6 pt-3 sm:pt-5 pb-3.5 shrink-0 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
                                    Photo Library
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                    <Sparkles className="size-3" /> Snap
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                                Choose matching photo for{" "}
                                <span className="font-bold text-primary dark:text-orange-400">
                                    {item?.name}
                                </span>
                            </p>
                        </div>

                        <button 
                            onClick={onClose}
                            className="p-2 -mr-1 -mt-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full mt-3">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search dishes (e.g. Butter Chicken, Paneer Tikka, Biryani)..."
                            className="pl-9.5 pr-8 h-10 w-full bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm shadow-2xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")} 
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-full"
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Dietary Type Filter Chips */}
                    <div className="flex items-center gap-2 mt-2.5">
                        <button
                            type="button"
                            onClick={() => setSelectedFoodType("all")}
                            className={cn(
                                "px-3 py-1 rounded-lg text-xs font-semibold transition-all border",
                                selectedFoodType === "all"
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                            )}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedFoodType("veg")}
                            className={cn(
                                "px-3 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5",
                                selectedFoodType === "veg"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : "bg-muted/40 hover:bg-muted text-emerald-600 border-border/60"
                            )}
                        >
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Veg
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedFoodType("non-veg")}
                            className={cn(
                                "px-3 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5",
                                selectedFoodType === "non-veg"
                                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                    : "bg-muted/40 hover:bg-muted text-rose-600 border-border/60"
                            )}
                        >
                            <span className="size-2 rounded-full bg-rose-500" />
                            Non-Veg
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-slate-50/50 dark:bg-zinc-950/50 min-h-0 overscroll-contain">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500 space-y-3">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="font-semibold text-xs sm:text-sm">Finding matching dishes in library...</p>
                        </div>
                    )}

                    {!isLoading && images.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500 space-y-2 text-center px-4">
                            <ImageIcon className="size-10 stroke-[1.5] text-gray-300 dark:text-zinc-600 mb-1" />
                            <p className="font-bold text-sm text-gray-700 dark:text-zinc-300">No photos found</p>
                            <p className="text-xs text-gray-400 max-w-xs">
                                Try searching with different keywords like &quot;{item?.name?.split(" ")[0]}&quot; or clear filters to browse.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {images.map((img, index) => {
                            const isLast = images.length === index + 1;
                            const isUploadingThis = uploadingId === (img._id || img.id);
                            const isVeg = img.food_type === "veg";
                            const isNonVeg = img.food_type === "non-veg";
                            
                            return (
                                <div 
                                    ref={isLast ? lastImageElementRef : null}
                                    key={img._id || img.id || index} 
                                    onClick={() => handleSelectImage(img)}
                                    className={cn(
                                        "group relative flex flex-col bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer",
                                        "shadow-2xs hover:shadow-md transition-all duration-200 active:scale-[0.98]",
                                        isUploadingThis && "opacity-80 pointer-events-none ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <div className="relative w-full aspect-[4/3] bg-muted/30 overflow-hidden">
                                        <Asset 
                                            src={img.imageUrl || img.key || img.image_url} 
                                            variant="detail"
                                            alt={img.title || img.name || "Dish photo"} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {/* Dietary dot badge */}
                                        {(isVeg || isNonVeg) && (
                                            <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-black/80 backdrop-blur-xs p-1 rounded-sm shadow-xs border border-black/10">
                                                <span className={cn(
                                                    "block size-2 rounded-full",
                                                    isVeg ? "bg-emerald-600" : "bg-rose-600"
                                                )} />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <div className="px-3 py-1.5 rounded-lg bg-white/95 text-gray-900 text-xs font-bold shadow-md flex items-center gap-1.5">
                                                <Check className="size-3.5 text-primary" />
                                                <span>Apply</span>
                                            </div>
                                        </div>

                                        {isUploadingThis && (
                                            <div className="absolute inset-0 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xs flex flex-col items-center justify-center z-30 text-primary">
                                                <Loader2 className="size-7 animate-spin mb-1 text-primary" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Applying...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2.5 flex flex-col bg-white dark:bg-zinc-900">
                                        <h3 className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate group-hover:text-primary transition-colors" title={img.title || img.name}>
                                            {img.title || img.name}
                                        </h3>
                                        {(img.category || img.cuisine) && (
                                            <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                {img.category || img.cuisine}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isFetchingNextPage && (
                        <div className="py-6 flex items-center justify-center text-primary gap-2">
                            <Loader2 className="size-5 animate-spin" />
                            <span className="text-xs font-medium text-muted-foreground">Loading more images...</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
