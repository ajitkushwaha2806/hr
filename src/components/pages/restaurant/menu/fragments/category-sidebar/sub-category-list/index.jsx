"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ActionMenu from "../action-menu";
import { FolderTree } from "lucide-react";
import { Asset } from "@/components/common/Asset";
import InlineInput from "@/components/ui/inline-input";

export default function SubCategoryList({
    categoryId,
    subcategories = [],
    activeSubCategory,
    setActiveSubCategory,
    setActiveCategory,
    updateSubCategory,
    deleteSubCategory,
}) {
    const [editingId, setEditingId] = useState(null);
    const [isSavingId, setIsSavingId] = useState(null);

    if (subcategories.length === 0) return null;

    return (
        <div className="space-y-2">
            {subcategories.map((sub) => {
                const isActive = activeSubCategory === sub.id;
                const isEditing = editingId === sub.id;
                const itemCount = sub?.raw?.items?.length ?? 0;

                return (
                    <div
                        key={sub.id}
                        className={cn(
                            "group relative overflow-hidden rounded-xl border transition-all duration-200",
                            isActive ? "border-border/80 bg-white shadow-sm ring-1 ring-border/50" : "border-transparent hover:border-border hover:bg-muted/50"
                        )}
                    >
                        <div className={cn("absolute inset-y-2 left-1 w-1 rounded-full transition-all", isActive ? "bg-foreground opacity-100" : "bg-foreground opacity-0 group-hover:opacity-40")} />

                        {isEditing ? (
                            <div className="px-4 py-3">
                                <InlineInput
                                    autoFocus
                                    defaultValue={sub.name}
                                    disabled={isSavingId === sub.id}
                                    onSubmit={(name) => {
                                        const trimmed = name.trim();
                                        if (trimmed && updateSubCategory) {
                                            setIsSavingId(sub.id);
                                            updateSubCategory(
                                                { categoryId: sub.id, data: { name: trimmed } },
                                                {
                                                    onSuccess: () => {
                                                        setEditingId(null);
                                                        setIsSavingId(null);
                                                    },
                                                    onError: () => {
                                                        setIsSavingId(null);
                                                    }
                                                }
                                            );
                                        } else {
                                            setEditingId(null);
                                        }
                                    }}
                                    onCancel={() => isSavingId !== sub.id && setEditingId(null)}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory?.(categoryId);
                                        setActiveSubCategory?.(sub.id);
                                    }}
                                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                >
                                    <div className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors overflow-hidden border", 
                                        isActive ? "bg-white border-border text-foreground shadow-sm" : "bg-muted/50 border-border/50 text-muted-foreground group-hover:bg-white group-hover:border-border group-hover:shadow-sm"
                                    )}>
                                        {sub.image ? (
                                            <Asset 
                                                src={sub.image} 
                                                variant="thumbnail"
                                                alt={sub.name} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        ) : (
                                            <FolderTree className="h-4 w-4" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className={cn("truncate text-sm font-medium flex items-center gap-2", isActive ? "text-foreground" : "text-foreground/80")}>
                                            <span className="truncate">{sub.name}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">Subcategory</p>
                                    </div>

                                    {itemCount > 0 && (
                                        <div className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", isActive ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground")}>
                                            {itemCount}
                                        </div>
                                    )}
                                </button>

                                <ActionMenu
                                    triggerClassName={cn(
                                        "h-7 w-7 opacity-0 transition-opacity",
                                        isActive ? "opacity-100" : "group-hover:opacity-100 data-[state=open]:opacity-100"
                                    )}
                                    onRename={() => setEditingId(sub.id)}
                                    onDelete={() => deleteSubCategory?.(sub.id)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}