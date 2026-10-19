import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Check, Minus, Layers, X } from "lucide-react";

export const NestedItemSelection = ({ items, categories, selectedItems, onToggleItem, onToggleCategory, addonGroups, onUnmapSingle, onUnmapAll, removingMappings }) => {
    const [expandedCats, setExpandedCats] = useState({});
    const [expandedSubCats, setExpandedSubCats] = useState({});

    const hierarchy = useMemo(() => {
        if (!categories || !items) return [];
        
        const catMap = {};
        categories.forEach(c => {
            const id = String(c._id || c.id);
            if (!c.parentCategory) {
                catMap[id] = { ...c, _id: id, id, subCategories: {}, items: [] };
            }
        });

        categories.forEach(c => {
            if (c.parentCategory) {
                const id = String(c._id || c.id);
                const parentId = String(typeof c.parentCategory === 'object' ? c.parentCategory._id || c.parentCategory.id || c.parentCategory : c.parentCategory);
                if (catMap[parentId]) {
                    catMap[parentId].subCategories[id] = { ...c, _id: id, id, items: [] };
                }
            }
        });

        items.forEach(item => {
            const rawCatId = item.category?._id || item.category?.id || item.category;
            const catId = rawCatId ? String(rawCatId) : null;
            
            const rawSubCatId = item.subCategory?._id || item.subCategory?.id || item.subCategory;
            const subCatId = rawSubCatId ? String(rawSubCatId) : null;

            if (catId && catMap[catId]) {
                if (subCatId && catMap[catId].subCategories[subCatId]) {
                    catMap[catId].subCategories[subCatId].items.push(item);
                } else if (subCatId) {
                    if (!catMap[catId].subCategories[subCatId]) {
                        catMap[catId].subCategories[subCatId] = { _id: subCatId, id: subCatId, name: item.subCategory?.name || "Subcategory", items: [] };
                    }
                    catMap[catId].subCategories[subCatId].items.push(item);
                } else {
                    catMap[catId].items.push(item);
                }
            } else {
                if (!catMap['uncategorized']) {
                    catMap['uncategorized'] = { _id: 'uncategorized', id: 'uncategorized', name: 'Uncategorized Items', subCategories: {}, items: [] };
                }
                catMap['uncategorized'].items.push(item);
            }
        });

        return Object.values(catMap).filter(c => Object.keys(c.subCategories).length > 0 || c.items.length > 0);
    }, [categories, items]);

    const toggleCat = (id) => setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSubCat = (id) => setExpandedSubCats(prev => ({ ...prev, [id]: !prev[id] }));

    const renderCheckbox = (isSelected, isIndeterminate) => (
        <div className={cn(
            "w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer",
            isSelected || isIndeterminate
                ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                : "border-border/70 bg-background hover:border-primary/50 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
        )}>
            {isSelected && !isIndeterminate && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
            {isIndeterminate && <Minus className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
        </div>
    );

    const renderItemNode = (item) => {
        const itemId = item._id || item.id;
        const isSelected = selectedItems.includes(itemId);
        const variants = item.variants?.[0]?.options || [];

        const rawItemAddons = item.addonGroups || [];
        const uniqueItemAddonIds = Array.from(
            new Set(rawItemAddons.map(agId => String(typeof agId === 'object' ? agId._id || agId.id : agId)))
        ).filter(Boolean);

        return (
            <div className="pl-14 pr-4 py-1.5" key={itemId}>
                <div 
                    onClick={() => onToggleItem(itemId)}
                    className={cn(
                        "flex flex-col gap-1.5 py-2 px-3 rounded-lg cursor-pointer transition-colors group",
                        isSelected ? "bg-slate-100 dark:bg-zinc-800" : "hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {renderCheckbox(isSelected, false)}
                        <span className={cn("text-[14px] truncate transition-colors", isSelected ? "text-slate-900 font-medium dark:text-white" : "text-slate-600 font-medium group-hover:text-slate-900 dark:text-gray-300 dark:group-hover:text-white")}>{item.name}</span>
                        {variants.length > 0 && addonGroups && (
                            <span className="text-[10px] text-muted-foreground bg-slate-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-semibold uppercase">
                                {variants.length} Variants
                            </span>
                        )}
                    </div>
                    {addonGroups && uniqueItemAddonIds.length > 0 && (
                        <div className="pl-7 flex flex-wrap items-center gap-1.5">
                            {uniqueItemAddonIds.map(gId => {
                                const agObj = addonGroups.find(ag => String(ag._id || ag.id) === gId);
                                if (!agObj) return null;
                                if (removingMappings?.has(`${itemId}:${gId}`)) return null;
                                return (
                                    <span
                                        key={gId}
                                        className="inline-flex items-center gap-1 text-[10px] bg-primary/5 text-primary/70 border border-primary/10 px-1.5 py-0.5 rounded max-w-[140px]"
                                    >
                                        <span className="truncate">{agObj.name}</span>
                                        {onUnmapSingle && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onUnmapSingle(itemId, gId); }}
                                                className="shrink-0 text-primary/50 hover:text-destructive transition-colors"
                                                title={`Remove ${agObj.name}`}
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        )}
                                    </span>
                                );
                            })}
                            {onUnmapAll && uniqueItemAddonIds.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onUnmapAll(itemId); }}
                                    className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-destructive/80 hover:text-destructive hover:bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded transition-all"
                                    title="Clear all addons from this item"
                                >
                                    Clear all ({uniqueItemAddonIds.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {addonGroups && variants.length > 0 && (
                    <div className="ml-7 mt-1.5 pl-3 border-l-2 border-orange-200 dark:border-orange-950/80 space-y-1">
                        {variants.map(opt => {
                            const optIdentifier = String(opt._id || opt.id || opt.name);
                            const variantKey = `${itemId}:::${optIdentifier}`;
                            const isOptSelected = selectedItems.includes(variantKey);
                            const rawOptAddons = opt.addonGroups || [];
                            const uniqueOptAddonIds = Array.from(
                                new Set(rawOptAddons.map(agId => String(typeof agId === 'object' ? agId._id || agId.id : agId)))
                            ).filter(Boolean);

                            return (
                                <div
                                    key={optIdentifier}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleItem(variantKey);
                                    }}
                                    className={cn(
                                        "flex flex-col gap-1 py-1.5 px-2.5 rounded-md cursor-pointer transition-colors border",
                                        isOptSelected 
                                            ? "bg-orange-50/80 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60" 
                                            : "bg-white dark:bg-zinc-900 border-border/60 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {renderCheckbox(isOptSelected, false)}
                                        <span className="text-[12.5px] font-semibold text-foreground truncate">
                                            {opt.name}
                                        </span>
                                        {opt.price !== undefined && (
                                            <span className="text-[11px] text-muted-foreground font-medium">
                                                (₹{opt.price})
                                            </span>
                                        )}
                                        <span className="text-[9px] font-bold text-orange-600 bg-orange-100/60 dark:bg-orange-950/60 px-1 py-0.2 rounded uppercase">
                                            Variant
                                        </span>
                                    </div>

                                    {uniqueOptAddonIds.length > 0 && (
                                        <div className="pl-6 flex flex-wrap items-center gap-1">
                                            {uniqueOptAddonIds.map(gId => {
                                                const agObj = addonGroups.find(ag => String(ag._id || ag.id) === gId);
                                                if (!agObj) return null;
                                                if (removingMappings?.has(`${variantKey}:${gId}`)) return null;
                                                return (
                                                    <span
                                                        key={gId}
                                                        className="inline-flex items-center gap-1 text-[10px] bg-orange-100/70 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900/60 px-1.5 py-0.5 rounded max-w-[140px]"
                                                    >
                                                        <span className="truncate">{agObj.name}</span>
                                                        {onUnmapSingle && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); onUnmapSingle(variantKey, gId); }}
                                                                className="shrink-0 text-orange-600 hover:text-destructive transition-colors"
                                                                title={`Remove ${agObj.name}`}
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </span>
                                                );
                                            })}
                                            {onUnmapAll && uniqueOptAddonIds.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onUnmapAll(variantKey); }}
                                                    className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-destructive/80 hover:text-destructive hover:bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded transition-all"
                                                    title="Clear all addons from this variant"
                                                >
                                                    Clear all ({uniqueOptAddonIds.length})
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
            {hierarchy.map(cat => {
                const catId = cat._id || cat.id;
                const isCatExpanded = expandedCats[catId];
                const subCats = Object.values(cat.subCategories);
                
                const allItemsUnderCat = [
                    ...cat.items.map(i => i._id || i.id),
                    ...subCats.flatMap(sc => sc.items.map(i => i._id || i.id))
                ];
                const isCatFullySelected = allItemsUnderCat.length > 0 && allItemsUnderCat.every(id => selectedItems.includes(id));
                const isCatPartiallySelected = !isCatFullySelected && allItemsUnderCat.some(id => selectedItems.includes(id));

                return (
                    <div key={catId} className="border-b border-slate-200 dark:border-zinc-800 last:border-0 bg-white dark:bg-zinc-950 transition-all">
                        <div className="flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                            <div onClick={() => onToggleCategory(allItemsUnderCat, isCatFullySelected)}>
                                {renderCheckbox(isCatFullySelected, isCatPartiallySelected)}
                            </div>
                            <button type="button" onClick={() => toggleCat(catId)} className="flex items-center gap-2 flex-1 text-left focus:outline-none group">
                                <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                                    {isCatExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                                <Layers className="w-4 h-4 text-slate-600 dark:text-gray-400" />
                                <span className="text-[15px] font-medium text-slate-900 dark:text-gray-100">{cat.name}</span>
                            </button>
                        </div>

                        {isCatExpanded && (
                            <div className="bg-white dark:bg-zinc-950">
                                {subCats.map(subCat => {
                                    const subCatId = subCat._id || subCat.id;
                                    const isSubCatExpanded = expandedSubCats[subCatId];
                                    const subCatItems = subCat.items.map(i => i._id || i.id);
                                    const isSubCatFullySelected = subCatItems.length > 0 && subCatItems.every(id => selectedItems.includes(id));
                                    const isSubCatPartiallySelected = !isSubCatFullySelected && subCatItems.some(id => selectedItems.includes(id));

                                    return (
                                        <div key={subCatId} className="border-t border-slate-100 dark:border-zinc-800/50">
                                            <div className="flex items-center gap-3 py-3 pl-10 pr-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                                                <div onClick={() => onToggleCategory(subCatItems, isSubCatFullySelected)}>
                                                    {renderCheckbox(isSubCatFullySelected, isSubCatPartiallySelected)}
                                                </div>
                                                <button type="button" onClick={() => toggleSubCat(subCatId)} className="flex items-center gap-2 flex-1 text-left focus:outline-none group">
                                                    <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                                                        {isSubCatExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </div>
                                                    <span className={cn("text-[14px] font-medium", isSubCatFullySelected ? "text-primary" : "text-slate-700 dark:text-gray-200")}>{subCat.name}</span>
                                                </button>
                                            </div>

                                            {isSubCatExpanded && (
                                                <div className="pb-2 pt-1">
                                                    {subCat.items.map(renderItemNode)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {cat.items.length > 0 && (
                                    <div className="pb-2 pt-1 border-t border-slate-100 dark:border-zinc-800/50">
                                        {cat.items.map(renderItemNode)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            
            {hierarchy.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                    No items available to display.
                </div>
            )}
        </div>
    );
};
