"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Building2, LogOut, Edit3 } from "lucide-react";

export default function OnboardingHeader({
  organization,
  user,
  isOnboarded = false,
  isEditing = false,
  onEdit,
  onSignOut,
}) {
  return (
    <header className="h-16 w-full border-b border-border/40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 sm:size-10 rounded-md overflow-hidden shadow-xs shrink-0 border border-border/40">
          <Image
            src="/assets/icons/logo.png"
            alt="trueHR"
            width={40}
            height={40}
            className="size-full object-cover"
            priority
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-sm text-foreground tracking-tight whitespace-nowrap">
              trueHR Portal
            </span>
            {isOnboarded && !isEditing ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                Active
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                Onboarding
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate max-w-[140px] sm:max-w-[240px] md:max-w-xs">
            <Building2 className="size-3 text-primary shrink-0" />
            <span className="truncate">{organization?.name || "Workspace"}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/40 text-xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground max-w-[150px] truncate">{user?.email}</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            ({user?.role === "org:admin" ? "Admin" : "Employee"})
          </span>
        </div>

        {isOnboarded && !isEditing && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs rounded-xl h-9 px-3 gap-1.5 border-border/60 hover:border-primary shrink-0 cursor-pointer"
          >
            <Edit3 className="size-3.5" />
            <span className="hidden sm:inline">Update Profile</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="text-xs rounded-xl h-9 px-2.5 sm:px-3 gap-1.5 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
