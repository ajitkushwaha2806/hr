import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { NestedItemSelection } from "@/components/global/nested-item-selector";

export function AssignAddons({ categories, items, targetItems, setTargetItems, addonGroups, onUnmapSingle, onUnmapAll, removingMappings }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState("all"); 

    const itemsWithAddons = useMemo(() => {
        return items.filter(item => {
            const hasItemAddons = Array.isArray(item.addonGroups) && item.addonGroups.length > 0;
            const hasVariantAddons = Array.isArray(item.variants) && item.variants.some(v => 
                Array.isArray(v.options) && v.options.some(opt => Array.isArray(opt.addonGroups) && opt.addonGroups.length > 0)
            );
            return hasItemAddons || hasVariantAddons;
        });
    }, [items]);

    const itemsWithAddonsIds = useMemo(() => itemsWithAddons.map(i => String(i._id || i.id)), [itemsWithAddons]);

    const filteredItems = useMemo(() => {
        const baseList = filterMode === "withAddons" ? itemsWithAddons : items;
        if (!searchQuery.trim()) return baseList;
        const q = searchQuery.toLowerCase();
        return baseList.filter(i => i.name?.toLowerCase().includes(q));
    }, [items, itemsWithAddons, filterMode, searchQuery]);

    const handleToggleItem = (itemId) => {
        setTargetItems(prev =>
            prev.includes(itemId) ? prev.filter(x => x !== itemId) : [...prev, itemId]
        );
    };

    const handleToggleCategory = (itemIds, isFullySelected) => {
        setTargetItems(prev => {
            const next = new Set(prev);
            if (isFullySelected) {
                itemIds.forEach(id => next.delete(id));
            } else {
                itemIds.forEach(id => next.add(id));
            }
            return Array.from(next);
        });
    };

    const handleSelectCurrent = () => {
        const idsToSelect = filteredItems.map(i => String(i._id || i.id));
        setTargetItems(Array.from(new Set([...targetItems, ...idsToSelect])));
    };

    const handleSelectAllWithAddons = () => {
        setTargetItems(itemsWithAddonsIds);
    };

    const handleClearAll = () => setTargetItems([]);

    return (
        <div className="w-full lg:w-1/2 min-h-[500px] lg:min-h-0 h-auto lg:h-full flex flex-col bg-slate-50/60 border-t lg:border-t-0 lg:border-l border-border/60 shrink-0 lg:shrink">
            <div className="flex flex-col border-b border-border/60 bg-white">
                <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
                    <div>
                        <h3 className="font-bold text-[15px] text-foreground">2. Select Target Items</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Select items to map or bulk remove addons</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {targetItems.length} selected
                        </span>
                        {targetItems.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="px-5 pb-2.5 flex items-center justify-between gap-2 border-b border-border/40">
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[12px] font-medium">
                        <button
                            type="button"
                            onClick={() => setFilterMode("all")}
                            className={cn(
                                "px-3 py-1 rounded-md transition-all",
                                filterMode === "all" ? "bg-white text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All Items ({items.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterMode("withAddons")}
                            className={cn(
                                "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                                filterMode === "withAddons" ? "bg-white text-primary shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span>Has Addons</span>
                            <span className={cn(
                                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                filterMode === "withAddons" ? "bg-primary/10 text-primary" : "bg-slate-200/80 text-muted-foreground"
                            )}>
                                {itemsWithAddons.length}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {filterMode === "all" && itemsWithAddons.length > 0 && (
                            <button
                                type="button"
                                onClick={handleSelectAllWithAddons}
                                className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                Select with addons
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSelectCurrent}
                            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                        >
                            Select all shown
                        </button>
                    </div>
                </div>

                <div className="px-4 py-2.5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={filterMode === "withAddons" ? "Search items with addons..." : "Search items..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-border/70 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
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
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 select-none">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        {searchQuery ? `No items match "${searchQuery}"` : filterMode === "withAddons" ? "No items currently have addons assigned." : "No menu items found."}
                    </div>
                ) : (
                    <NestedItemSelection
                        items={filteredItems}
                        categories={categories}
                        selectedItems={targetItems}
                        onToggleItem={handleToggleItem}
                        onToggleCategory={handleToggleCategory}
                        addonGroups={addonGroups}
                        onUnmapSingle={onUnmapSingle}
                        onUnmapAll={onUnmapAll}
                        removingMappings={removingMappings}
                    />
                )}
            </div>
        </div>
    );
}
