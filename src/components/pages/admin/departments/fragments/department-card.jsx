"use client";

import Link from "next/link";
import { Building2, Briefcase, ArrowRight, Edit2, Trash2, Users } from "lucide-react";

export default function DepartmentCard({
  department,
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const memberCount = department.memberCount || 0;
  const designations = department.designations || [];

  return (
    <div className="relative rounded-2xl border border-border/70 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/40" />

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-10 sm:size-11 rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-transparent text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug line-clamp-2" title={department.name}>
                {department.name}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 transition-colors ${
              memberCount > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted/70 text-muted-foreground border-border/50"
            }`}
          >
            <Users className="size-3" />
            <span>{memberCount} {memberCount === 1 ? "Member" : "Members"}</span>
          </span>
        </div>

        <div className="flex-1 bg-slate-50/60 dark:bg-zinc-950/40 border border-border/50 rounded-xl p-3 my-1 flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5">
              <Briefcase className="size-3 text-primary" /> Designations
            </span>
            <span className="text-[10px] text-muted-foreground">
              {designations.length}
            </span>
          </div>

          {designations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {designations.map((desig) => (
                <span
                  key={desig}
                  className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-foreground border border-border/70 shadow-2xs hover:border-primary/40 transition-colors"
                >
                  {desig}
                </span>
              ))}
            </div>
          ) : (
            <div className="py-3 text-center">
              <p className="text-xs text-muted-foreground italic">
                No designations configured
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 py-2.5 border-t border-border/50 bg-slate-50/40 dark:bg-zinc-950/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(department)}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-medium transition-colors cursor-pointer text-xs"
            title="Edit Department"
          >
            <Edit2 className="size-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(department)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors cursor-pointer disabled:opacity-50 text-xs"
            title="Delete Department"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </button>
        </div>

        <Link
          href={`/admin/employees?department=${encodeURIComponent(department.name)}`}
          className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-xs"
        >
          <span>View Team</span>
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
