"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default function DepartmentsHeader({
  totalCount = 0,
  onOpenCreateModal,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/40">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        Departments
      </h1>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <Link href="/admin/employees" className="flex-1 sm:flex-initial">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto h-9 px-3 rounded-lg text-xs font-semibold cursor-pointer border-border hover:bg-accent shadow-2xs"
          >
            <Users className="size-3.5 mr-1.5 text-muted-foreground" /> View Employees
          </Button>
        </Link>

        <Button
          onClick={onOpenCreateModal}
          size="sm"
          className="flex-1 sm:flex-initial h-9 px-3.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="size-4 mr-1.5" /> Add Department
        </Button>
      </div>
    </div>
  );
}
