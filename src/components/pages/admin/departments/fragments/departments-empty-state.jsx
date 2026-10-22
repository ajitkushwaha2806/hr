"use client";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DepartmentsEmptyState({ onOpenCreateModal }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto">
      <div className="size-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner">
        <Building2 className="size-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          No departments added yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Create your first company department and add designations to organize your team rosters.
        </p>
      </div>
      <Button
        onClick={onOpenCreateModal}
        size="sm"
        className="h-9 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer"
      >
        <Plus className="size-4 mr-1.5" /> Create First Department
      </Button>
    </div>
  );
}
