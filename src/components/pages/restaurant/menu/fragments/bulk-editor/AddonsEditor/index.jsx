import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import Loader from "@/components/global/loader";
import { useCategory } from "@/store/hooks/useCategory";
import { ManageGroups } from "./fragments/ManageGroups";
import { AssignAddons } from "./fragments/AssignAddons";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { useAddonGroup } from "@/store/hooks/useAddonGroup";
import { useItemAddons } from "@/store/hooks/useItemAddons";

export function AddonsEditor() {
    const { restaurantId } = useRestaurant();
    const { rawCategories: categories = [], isLoading: isLoadingCats } = useCategory(restaurantId);
    const { items = [], isLoading: isLoadingItems } = useItem(restaurantId, {});
    const { addonGroups, addGroup, updateGroup, deleteGroup, isLoading: isLoadingAddons } = useAddonGroup(restaurantId);
    const { 
        mapAddons, 
        removeAddons, 
        clearAddons, 
        unmapSingleAddon, 
        isUpdating, 
        removingMappings 
    } = useItemAddons(restaurantId);
    
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [targetItems, setTargetItems] = useState([]);
    const [keepItemsSelected, setKeepItemsSelected] = useState(true);
    
    const notification = useNotification();

    const handleClearSelection = () => {
        setSelectedGroups([]);
        setTargetItems([]);
    };

    const handleConfirmAssign = async (action) => {
        if (!restaurantId) return;
        
        if (targetItems.length === 0) {
            return notification.error("Please select at least one target item or variant.");
        }

        if (action === 'add') {
            if (selectedGroups.length === 0) {
                return notification.error("Please select at least one addon group to map.");
            }
            const success = await mapAddons(targetItems, selectedGroups);
            if (success) {
                setSelectedGroups([]);
                if (!keepItemsSelected) {
                    setTargetItems([]);
                }
            }
        } else if (action === 'remove') {
            let success = false;
            if (selectedGroups.length > 0) {
                success = await removeAddons(targetItems, selectedGroups);
                if (success) {
                    setSelectedGroups([]);
                }
            } else {
                success = await clearAddons(targetItems);
            }
            if (success && !keepItemsSelected) {
                setTargetItems([]);
            }
        }
    };

    const handleUnmapSingle = (itemId, groupId) => {
        return unmapSingleAddon(itemId, groupId);
    };

    const handleUnmapAll = (itemId) => {
        return clearAddons([itemId]);
    };

    if (isLoadingCats || isLoadingItems || isLoadingAddons) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-50/40 overflow-hidden font-sans">
            <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
                <ManageGroups
                    addonGroups={addonGroups}
                    items={items}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={setSelectedGroups}
                    addGroup={addGroup}
                    updateGroup={updateGroup}
                    deleteGroup={deleteGroup}
                />

                <div className="w-full h-px lg:w-px lg:h-auto bg-border/60 shrink-0 z-10" />

                <AssignAddons
                    categories={categories}
                    items={items}
                    targetItems={targetItems}
                    setTargetItems={setTargetItems}
                    addonGroups={addonGroups}
                    onUnmapSingle={handleUnmapSingle}
                    onUnmapAll={handleUnmapAll}
                    removingMappings={removingMappings}
                />
            </div>

            <div className="bg-white border-t border-border/60 px-6 py-3 shrink-0 flex items-center justify-between shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.06)] z-20">
                <div className="text-[13px] text-muted-foreground flex items-center gap-2">
                    {selectedGroups.length > 0 && targetItems.length > 0 && (
                        <span>
                            Map <span className="font-bold text-foreground">{selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""}</span>
                            {" "}→{" "}
                            <span className="font-bold text-foreground">{targetItems.length} item{targetItems.length !== 1 ? "s" : ""}</span>
                        </span>
                    )}
                    {selectedGroups.length === 0 && targetItems.length > 0 && (
                        <span>
                            <span className="font-bold text-foreground">{targetItems.length} item{targetItems.length !== 1 ? "s" : ""} selected</span>
                            <span className="text-muted-foreground ml-1.5">(select groups on left to map, or click Remove/Clear)</span>
                        </span>
                    )}
                    {selectedGroups.length > 0 && targetItems.length === 0 && (
                        <span>
                            <span className="font-bold text-foreground">{selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""} selected</span>
                            <span className="text-muted-foreground ml-1.5">(select target items on right)</span>
                        </span>
                    )}
                    {selectedGroups.length === 0 && targetItems.length === 0 && (
                        <span className="text-muted-foreground">Select addon groups on left and items on right</span>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                    <label className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors mr-1">
                        <input
                            type="checkbox"
                            checked={keepItemsSelected}
                            onChange={(e) => setKeepItemsSelected(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary/20 w-3.5 h-3.5 cursor-pointer accent-primary"
                        />
                        <span>Keep items selected</span>
                    </label>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelection}
                        disabled={isUpdating || (selectedGroups.length === 0 && targetItems.length === 0)}
                        className="h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-md"
                    >
                        Clear
                    </Button>

                    {selectedGroups.length > 0 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmAssign('remove')}
                            disabled={isUpdating || targetItems.length === 0}
                            className="h-8 px-3 text-xs font-semibold rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 transition-all"
                        >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Remove {selectedGroups.length} Group{selectedGroups.length > 1 ? "s" : ""} from Items
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmAssign('remove')}
                            disabled={isUpdating || targetItems.length === 0}
                            className="h-8 px-3 text-xs font-semibold rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 transition-all"
                        >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Clear All Addons {targetItems.length > 0 ? `(${targetItems.length})` : ''}
                        </Button>
                    )}

                    <Button
                        size="sm"
                        onClick={() => handleConfirmAssign('add')}
                        disabled={isUpdating || selectedGroups.length === 0 || targetItems.length === 0}
                        className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm flex items-center gap-1.5 transition-all"
                    >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Map to Items {selectedGroups.length > 0 && targetItems.length > 0 ? `(${targetItems.length})` : ''}
                    </Button>
                </div>
            </div>
        </div>
    );
}
