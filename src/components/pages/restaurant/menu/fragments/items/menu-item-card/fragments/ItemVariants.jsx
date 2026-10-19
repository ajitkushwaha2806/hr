import { Input } from "@/components/ui/input";
import { SUGGESTED_VARIANTS } from "../helper/constants";
import { Trash2, Plus, X, Layers, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ItemVariants({ 
    variants, 
    addonGroups = [],
    addVariantGroup, 
    updateVariantGroup, 
    deleteVariantGroup, 
    addVariantOption, 
    updateVariantOption, 
    deleteVariantOption, 
    addSuggestedVariant,
    toggleOptionAddonGroup
}) {
    return (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            {variants.length > 0 ? (
                <div className="space-y-6">
                    {variants.map((group, gIdx) => (
                        <div key={gIdx} className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 relative group/variant">
                            <button
                                onClick={() => deleteVariantGroup(gIdx)}
                                className="absolute -top-3 -right-3 bg-white dark:bg-zinc-900 border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full p-1.5 transition-all shadow-sm z-10"
                                title="Delete Variant Group"
                            >
                                <Trash2 size={14} />
                            </button>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                <div className="relative group/input flex-1 max-w-[240px]">
                                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 transition-colors">
                                            Variant Name
                                        </span>
                                    </div>
                                    <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-transparent">
                                        <Input
                                            type="text"
                                            value={group.property_name || ""}
                                            onChange={(e) => updateVariantGroup(gIdx, "property_name", e.target.value)}
                                            placeholder="e.g. Size, Customization"
                                            className="border-0 focus-visible:ring-0 shadow-none h-11 bg-transparent text-sm sm:text-base px-3 w-full font-semibold"
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => addVariantOption(gIdx)}
                                    className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 px-3 py-2 h-11 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Plus size={14} strokeWidth={3} /> Add Option
                                </button>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 pl-1">
                                    Options & Variant Addons
                                </span>
                                <div className="flex flex-col gap-3">
                                    {(group.options || []).map((opt, oIdx) => {
                                        const optAddonIds = (opt.addonGroups || []).map(g => typeof g === 'object' ? g._id || g.id : String(g));

                                        return (
                                            <div 
                                                key={oIdx} 
                                                className="bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-200 dark:border-gray-700/80 rounded-lg p-3 space-y-2.5 transition-all"
                                            >
                                                {/* Top Row: Option Name, Price, and Remove */}
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex-1 min-w-[130px]">
                                                        <input
                                                            type="text"
                                                            value={opt.name || ""}
                                                            onChange={(e) => updateVariantOption(gIdx, oIdx, "name", e.target.value)}
                                                            placeholder="Name (e.g. Regular, Large)"
                                                            className="text-sm font-semibold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 w-full outline-none focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>

                                                    <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1.5 shrink-0">
                                                        <span className="text-gray-400 text-xs font-medium mr-1">₹</span>
                                                        <input
                                                            type="number"
                                                            value={opt.price ?? ""}
                                                            onChange={(e) => updateVariantOption(gIdx, oIdx, "price", Number(e.target.value))}
                                                            placeholder="0"
                                                            className="text-sm font-semibold w-16 bg-transparent outline-none"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => deleteVariantOption(gIdx, oIdx)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                        title="Remove Option"
                                                    >
                                                        <X size={16} strokeWidth={2.2} />
                                                    </button>
                                                </div>

                                                {/* Bottom Row: Variant-Level Addons */}
                                                {addonGroups.length > 0 && (
                                                    <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                                                            <Layers className="w-3 h-3 text-orange-500" />
                                                            Addons for {opt.name || "Option"}:
                                                        </span>

                                                        {/* Currently Assigned Addon Badges */}
                                                        {optAddonIds.map(agId => {
                                                            const ag = addonGroups.find(g => String(g._id || g.id) === String(agId));
                                                            if (!ag) return null;
                                                            return (
                                                                <span
                                                                    key={agId}
                                                                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200/80 px-2 py-0.5 rounded-md"
                                                                >
                                                                    <span>{ag.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleOptionAddonGroup(gIdx, oIdx, agId)}
                                                                        className="hover:text-red-600 transition-colors ml-0.5"
                                                                        title="Unlink Addon"
                                                                    >
                                                                        <X size={11} />
                                                                    </button>
                                                                </span>
                                                            );
                                                        })}

                                                        {/* Addon Selector Popover */}
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/90 bg-primary/5 hover:bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md transition-colors"
                                                                >
                                                                    <Plus size={11} strokeWidth={3} />
                                                                    {optAddonIds.length > 0 ? "Add More" : "Link Addons"}
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent align="start" className="w-64 p-3 bg-white dark:bg-zinc-900 border border-border shadow-lg rounded-xl z-50">
                                                                <div className="font-bold text-xs text-foreground mb-2">
                                                                    Assign Addons for &apos;{opt.name || "Option"}&apos;
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto space-y-1">
                                                                    {addonGroups.map(ag => {
                                                                        const gId = String(ag._id || ag.id);
                                                                        const isAssigned = optAddonIds.includes(gId);
                                                                        return (
                                                                            <button
                                                                                key={gId}
                                                                                type="button"
                                                                                onClick={() => toggleOptionAddonGroup(gIdx, oIdx, gId)}
                                                                                className="flex items-center justify-between w-full p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs text-left transition-colors"
                                                                            >
                                                                                <span className="font-medium text-foreground truncate pr-2">
                                                                                    {ag.name}
                                                                                </span>
                                                                                {isAssigned && (
                                                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded shrink-0 flex items-center gap-0.5">
                                                                                        <Check size={10} strokeWidth={3} /> Linked
                                                                                    </span>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {(!group.options || group.options.length === 0) && (
                                        <div className="h-[42px] flex items-center px-3 text-sm text-gray-400 italic">No options added yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
                        <button
                            onClick={addVariantGroup}
                            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                        >
                            <Plus size={16} strokeWidth={3} /> Add Another Variant
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Plus size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Item Variants</h4>
                            <p className="text-xs text-gray-500">Add size, customization, or add-ons</p>
                        </div>
                    </div>
                    <button
                        onClick={addVariantGroup}
                        className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                    >
                        Add Variants
                    </button>
                </div>
            )}
            
            {variants.length === 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 relative">
                    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar flex-nowrap w-full">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Quick Add:</span>
                        {SUGGESTED_VARIANTS.map(sug => (
                            <button
                                key={sug.property_name}
                                onClick={() => addSuggestedVariant(sug)}
                                className="shrink-0 text-[12px] font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 hover:border-orange-300 hover:bg-orange-50 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5"
                            >
                                <Plus size={14} strokeWidth={2.5} className="text-orange-500" /> {sug.property_name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
