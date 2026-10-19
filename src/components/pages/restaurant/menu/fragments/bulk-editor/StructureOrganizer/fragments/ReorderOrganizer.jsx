"use client";
import React, { useState, useMemo } from "react";
import { 
    ArrowUp, 
    ArrowDown, 
    ChevronDown, 
    ChevronRight, 
    Search, 
    X, 
    RotateCcw, 
    Check, 
    Loader2, 
    Layers, 
    Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MenuService } from "@/services/frontend/menu";
import { useQueryClient } from "@tanstack/react-query";
import useNotification from "@/store/hooks/useNotification";

export function ReorderOrganizer({ restaurantId, categories = [], items = [] }) {
    const notification = useNotification();
    const queryClient = useQueryClient();

    // Helper functions to build sorted initial states
    const buildInitialCategories = () => {
        return [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    };

    const buildInitialSubCategories = () => {
        const subMap = {};
        categories.forEach(cat => {
            subMap[cat.id] = [...(cat.subcategories || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        });
        return subMap;
    };

    const buildInitialItems = () => {
        const itemsMap = {};
        items.forEach(item => {
            const subId = item.subCategory?._id || item.subCategory?.id || item.subCategory;
            const catId = item.category?._id || item.category?.id || item.category;

            const containerKey = subId ? String(subId) : (catId ? String(catId) : "uncategorized");
            if (!itemsMap[containerKey]) {
                itemsMap[containerKey] = [];
            }
            itemsMap[containerKey].push(item);
        });

        Object.keys(itemsMap).forEach(key => {
            itemsMap[key].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        });

        return itemsMap;
    };

    // In-memory ordered structures
    const [orderedCategories, setOrderedCategories] = useState(buildInitialCategories);
    const [orderedSubCategories, setOrderedSubCategories] = useState(buildInitialSubCategories);
    const [orderedItems, setOrderedItems] = useState(buildInitialItems);

    // UI state
    const [expandedCategories, setExpandedCategories] = useState(() => {
        const initialSorted = buildInitialCategories();
        return initialSorted.length > 0 ? { [initialSorted[0].id]: true } : {};
    });
    const [expandedSubCategories, setExpandedSubCategories] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Reset back to initial server state
    const handleReset = () => {
        setOrderedCategories(buildInitialCategories());
        setOrderedSubCategories(buildInitialSubCategories());
        setOrderedItems(buildInitialItems());
        setHasChanges(false);
    };

    // Move category Up / Down
    const handleMoveCategory = (index, direction) => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= orderedCategories.length) return;

        setOrderedCategories(prev => {
            const updated = [...prev];
            const [movedItem] = updated.splice(index, 1);
            updated.splice(targetIndex, 0, movedItem);
            return updated;
        });
        setHasChanges(true);
    };

    // Move subcategory Up / Down within parent
    const handleMoveSubCategory = (parentCatId, index, direction) => {
        const list = orderedSubCategories[parentCatId] || [];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return;

        setOrderedSubCategories(prev => {
            const updatedList = [...(prev[parentCatId] || [])];
            const [movedSub] = updatedList.splice(index, 1);
            updatedList.splice(targetIndex, 0, movedSub);
            return {
                ...prev,
                [parentCatId]: updatedList
            };
        });
        setHasChanges(true);
    };

    // Move item Up / Down within container (subCategoryId or parentCatId)
    const handleMoveItem = (containerKey, index, direction) => {
        const list = orderedItems[containerKey] || [];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return;

        setOrderedItems(prev => {
            const updatedList = [...(prev[containerKey] || [])];
            const [movedItem] = updatedList.splice(index, 1);
            updatedList.splice(targetIndex, 0, movedItem);
            return {
                ...prev,
                [containerKey]: updatedList
            };
        });
        setHasChanges(true);
    };

    // Expand/Collapse toggles
    const toggleCategoryExpand = (id) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSubCategoryExpand = (id) => {
        setExpandedSubCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleExpandAll = () => {
        const allCats = {};
        const allSubs = {};
        orderedCategories.forEach(c => {
            allCats[c.id] = true;
            (orderedSubCategories[c.id] || []).forEach(s => {
                allSubs[s.id] = true;
            });
        });
        setExpandedCategories(allCats);
        setExpandedSubCategories(allSubs);
    };

    const handleCollapseAll = () => {
        setExpandedCategories({});
        setExpandedSubCategories({});
    };

    // Save changes
    const handleSaveOrder = async () => {
        if (!restaurantId || !hasChanges) return;
        setIsSaving(true);
        try {
            const categoriesPayload = [];
            orderedCategories.forEach((cat, catIdx) => {
                categoriesPayload.push({
                    id: cat.id || cat._id,
                    displayOrder: catIdx
                });

                const subs = orderedSubCategories[cat.id] || [];
                subs.forEach((sub, subIdx) => {
                    categoriesPayload.push({
                        id: sub.id || sub._id,
                        displayOrder: subIdx
                    });
                });
            });

            const itemsPayload = [];
            Object.keys(orderedItems).forEach(containerKey => {
                const containerItems = orderedItems[containerKey] || [];
                containerItems.forEach((item, itemIdx) => {
                    itemsPayload.push({
                        id: item._id || item.id,
                        displayOrder: itemIdx
                    });
                });
            });

            await MenuService.bulkUpdateStructure(restaurantId, {
                action: "reorder",
                payload: {
                    categories: categoriesPayload,
                    items: itemsPayload
                }
            });

            notification.success("Menu order updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            setHasChanges(false);
        } catch (error) {
            console.error("Failed to save menu order:", error);
            notification.error(error?.response?.data?.message || "Failed to update menu order.");
        } finally {
            setIsSaving(false);
        }
    };

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return orderedCategories;
        const q = searchQuery.toLowerCase();

        return orderedCategories.filter(cat => {
            const matchesCat = cat.name?.toLowerCase().includes(q);
            const subs = orderedSubCategories[cat.id] || [];
            const matchesSub = subs.some(s => s.name?.toLowerCase().includes(q));
            const catItems = orderedItems[cat.id] || [];
            const subItems = subs.flatMap(s => orderedItems[s.id] || []);
            const matchesItem = [...catItems, ...subItems].some(i => i.name?.toLowerCase().includes(q));
            return matchesCat || matchesSub || matchesItem;
        });
    }, [orderedCategories, orderedSubCategories, orderedItems, searchQuery]);

    const isFiltered = Boolean(searchQuery.trim());

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden font-poppins">
                {/* Search & Bulk Expand Header */}
                <div className="bg-white border-b border-border/70 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
                    <div className="relative min-w-[260px] max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search categories, subcategories, or items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-border/70 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleExpandAll}
                            className="h-8 text-[12px] font-medium border-border/70 text-slate-700 hover:bg-slate-100"
                        >
                            Expand All
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCollapseAll}
                            className="h-8 text-[12px] font-medium border-border/70 text-slate-700 hover:bg-slate-100"
                        >
                            Collapse All
                        </Button>
                    </div>
                </div>

                {/* Main Unified List Card (Matching Image 1's clean tree style) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {filteredCategories.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-muted-foreground">
                            <p className="font-semibold text-slate-700">No categories found</p>
                            <p className="text-sm mt-1">{searchQuery ? `No matches for "${searchQuery}"` : "Add categories to get started."}</p>
                        </div>
                    ) : (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs divide-y divide-slate-200">
                            {filteredCategories.map((cat, catIdx) => {
                                const isExpanded = isFiltered || expandedCategories[cat.id];
                                const subs = orderedSubCategories[cat.id] || [];
                                const directItems = orderedItems[cat.id] || [];
                                const totalItemsCount = directItems.length + subs.reduce((acc, s) => acc + (orderedItems[s.id]?.length || 0), 0);

                                const isFirstCat = catIdx === 0;
                                const isLastCat = catIdx === filteredCategories.length - 1;

                                return (
                                    <div key={cat.id || cat._id} className="bg-white transition-all">
                                        {/* Main Category Row */}
                                        <div className="flex items-center justify-between gap-3 p-3.5 hover:bg-slate-50/80 transition-colors group">
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                {/* Expand / Collapse Chevron */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategoryExpand(cat.id)}
                                                    className="w-6 h-6 flex items-center justify-center rounded text-slate-400 group-hover:text-slate-600 hover:bg-slate-200/50 transition-colors shrink-0 cursor-pointer"
                                                >
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>

                                                {/* Category Position Index */}
                                                <span className="w-5 text-[12px] font-semibold text-slate-400 text-center shrink-0">
                                                    {catIdx + 1}
                                                </span>

                                                {/* Category Icon */}
                                                <Layers className="w-4 h-4 text-slate-700 shrink-0" />

                                                {/* Category Name */}
                                                <span className="font-semibold text-[14.5px] text-slate-900 truncate">
                                                    {cat.name}
                                                </span>

                                                {/* Meta Badges */}
                                                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                                    {subs.length} subcategories
                                                </span>
                                                <span className="text-[11px] font-medium text-muted-foreground bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-full shrink-0">
                                                    {totalItemsCount} items
                                                </span>
                                            </div>

                                            {/* Category Move Up / Down Buttons */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isFirstCat || isFiltered}
                                                            onClick={() => handleMoveCategory(catIdx, "up")}
                                                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 rounded-md disabled:opacity-20 transition-colors shadow-2xs"
                                                        >
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">Move Category Up</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isLastCat || isFiltered}
                                                            onClick={() => handleMoveCategory(catIdx, "down")}
                                                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 rounded-md disabled:opacity-20 transition-colors shadow-2xs"
                                                        >
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">Move Category Down</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* Expanded Children Rows (Subcategories & Standalone Items) */}
                                        {isExpanded && (
                                            <div className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/30">
                                                {subs.length === 0 && directItems.length === 0 ? (
                                                    <div className="py-3 px-10 text-xs text-muted-foreground italic">
                                                        No subcategories or standalone items in this category.
                                                    </div>
                                                ) : null}

                                                {/* Subcategories list */}
                                                {subs.map((sub, subIdx) => {
                                                    const isSubExpanded = isFiltered || expandedSubCategories[sub.id];
                                                    const subItems = orderedItems[sub.id] || [];
                                                    const isFirstSub = subIdx === 0;
                                                    const isLastSub = subIdx === subs.length - 1;

                                                    return (
                                                        <div key={sub.id || sub._id} className="transition-all">
                                                            {/* Subcategory Row (indented like nested selector) */}
                                                            <div className="flex items-center justify-between gap-3 py-2.5 px-4 pl-9 sm:pl-10 hover:bg-slate-100/70 transition-colors group">
                                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                    {/* Subcategory Expand / Collapse */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleSubCategoryExpand(sub.id)}
                                                                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 group-hover:text-slate-600 hover:bg-slate-200/50 transition-colors shrink-0 cursor-pointer"
                                                                    >
                                                                        {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                                    </button>

                                                                    {/* Subcategory Position Index */}
                                                                    <span className="w-6 text-[11px] font-semibold text-slate-400 text-center shrink-0">
                                                                        {catIdx + 1}.{subIdx + 1}
                                                                    </span>

                                                                    <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                                                                    <span className="font-medium text-[13.5px] text-slate-800 truncate">
                                                                        {sub.name}
                                                                    </span>

                                                                    <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-full shrink-0">
                                                                        {subItems.length} items
                                                                    </span>
                                                                </div>

                                                                {/* Subcategory Move Buttons */}
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                disabled={isFirstSub || isFiltered}
                                                                                onClick={() => handleMoveSubCategory(cat.id, subIdx, "up")}
                                                                                className="h-6.5 w-6.5 p-0 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200/70 rounded disabled:opacity-20 transition-colors"
                                                                            >
                                                                                <ArrowUp className="w-3 h-3" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top">Move Subcategory Up</TooltipContent>
                                                                    </Tooltip>

                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                disabled={isLastSub || isFiltered}
                                                                                onClick={() => handleMoveSubCategory(cat.id, subIdx, "down")}
                                                                                className="h-6.5 w-6.5 p-0 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200/70 rounded disabled:opacity-20 transition-colors"
                                                                            >
                                                                                <ArrowDown className="w-3 h-3" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top">Move Subcategory Down</TooltipContent>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>

                                                            {/* Subcategory Items (Deep Indentation) */}
                                                            {isSubExpanded && (
                                                                <div className="divide-y divide-slate-100/70 bg-white">
                                                                    {subItems.length === 0 ? (
                                                                        <div className="py-2 px-16 text-xs text-muted-foreground italic">
                                                                            No items in this subcategory.
                                                                        </div>
                                                                    ) : (
                                                                        subItems.map((item, itemIdx) => {
                                                                            const isFirstItem = itemIdx === 0;
                                                                            const isLastItem = itemIdx === subItems.length - 1;
                                                                            const isVeg = item.dietaryType === "veg" || item.dietaryType === "vegan";

                                                                            return (
                                                                                <div 
                                                                                    key={item._id || item.id}
                                                                                    className="flex items-center justify-between gap-3 py-2 px-4 pl-16 sm:pl-18 hover:bg-slate-50 transition-colors group"
                                                                                >
                                                                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                                        {/* Dietary Indicator */}
                                                                                        <div className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                                                                            <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                                                                        </div>

                                                                                        {/* Position */}
                                                                                        <span className="text-[11px] font-medium text-slate-400 w-5 shrink-0">
                                                                                            #{itemIdx + 1}
                                                                                        </span>

                                                                                        <span className="text-[13px] font-normal text-slate-700 truncate group-hover:text-slate-900">
                                                                                            {item.name}
                                                                                        </span>

                                                                                        {item.base_price !== undefined && (
                                                                                            <span className="text-[12px] font-medium text-slate-400 shrink-0 ml-1">
                                                                                                ₹{item.base_price}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Item Move Buttons */}
                                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="sm"
                                                                                                    disabled={isFirstItem || isFiltered}
                                                                                                    onClick={() => handleMoveItem(sub.id, itemIdx, "up")}
                                                                                                    className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-20"
                                                                                                >
                                                                                                    <ArrowUp className="w-3 h-3" />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent side="top">Move Item Up</TooltipContent>
                                                                                        </Tooltip>

                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="sm"
                                                                                                    disabled={isLastItem || isFiltered}
                                                                                                    onClick={() => handleMoveItem(sub.id, itemIdx, "down")}
                                                                                                    className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-20"
                                                                                                >
                                                                                                    <ArrowDown className="w-3 h-3" />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent side="top">Move Item Down</TooltipContent>
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Standalone Items directly in Category (if any) */}
                                                {directItems.length > 0 && (
                                                    <div className="divide-y divide-slate-100 bg-white">
                                                        {directItems.map((item, itemIdx) => {
                                                            const isFirstItem = itemIdx === 0;
                                                            const isLastItem = itemIdx === directItems.length - 1;
                                                            const isVeg = item.dietaryType === "veg" || item.dietaryType === "vegan";

                                                            return (
                                                                <div 
                                                                    key={item._id || item.id}
                                                                    className="flex items-center justify-between gap-3 py-2 px-4 pl-10 sm:pl-12 hover:bg-slate-50 transition-colors group"
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                        <div className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                                                        </div>

                                                                        <span className="text-[11px] font-medium text-slate-400 w-5 shrink-0">
                                                                            #{itemIdx + 1}
                                                                        </span>

                                                                        <span className="text-[13px] font-normal text-slate-700 truncate group-hover:text-slate-900">
                                                                            {item.name}
                                                                        </span>

                                                                        {item.base_price !== undefined && (
                                                                            <span className="text-[12px] font-medium text-slate-400 shrink-0 ml-1">
                                                                                ₹{item.base_price}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            disabled={isFirstItem || isFiltered}
                                                                            onClick={() => handleMoveItem(cat.id, itemIdx, "up")}
                                                                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-20"
                                                                        >
                                                                            <ArrowUp className="w-3 h-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            disabled={isLastItem || isFiltered}
                                                                            onClick={() => handleMoveItem(cat.id, itemIdx, "down")}
                                                                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-20"
                                                                        >
                                                                            <ArrowDown className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex items-center justify-between px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex items-center gap-2">
                        {hasChanges ? (
                            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                You have unsaved order changes
                            </span>
                        ) : (
                            <span className="text-[13px] text-slate-500 font-medium">
                                Use the arrow buttons to arrange items, then save your changes.
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={!hasChanges || isSaving}
                            className="font-semibold font-sans px-4 rounded-md border border-gray-300 text-slate-700 hover:bg-gray-100 transition-all shadow-none h-10 gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset Order
                        </Button>

                        <Button
                            onClick={handleSaveOrder}
                            disabled={!hasChanges || isSaving}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold font-sans px-6 rounded-md shadow-md h-10 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving Order...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Save Order Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
