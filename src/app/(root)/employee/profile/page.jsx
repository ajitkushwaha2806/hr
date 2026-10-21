"use client";
import Link from "next/link";
import { useState } from "react";
import useNotification from "@/store/hooks/useNotification";
import { useEmployeeProfile } from "@/store/hooks/useEmployee";
import { RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import EmployeeProfileView from "@/components/pages/workspace/employee/profile";

export default function EmployeeProfilePage() {
  const notify = useNotification();
  const { employee, officeLocation, todayPunch, isLoading, error, refetch, updateProfile } = useEmployeeProfile();

  const [avatarOverride, setAvatarOverride] = useState("");
  const handleFaceChange = async (newUrl) => {
    setAvatarOverride(newUrl);
    try {
      await updateProfile({
        avatar: newUrl,
        facePhoto: newUrl,
      });
      notify.success("Biometric face photo updated successfully!");
    } catch (err) {
      console.warn("Profile face update fallback:", err);
      notify.error("Failed to update face biometric photo.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/60 dark:bg-zinc-950 p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        <div className="rounded-md border border-border bg-card p-5 animate-pulse space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-md bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-muted rounded w-48" />
              <div className="h-3.5 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-64" />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5 animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-40" />
          <div className="h-32 bg-muted/40 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-card p-4 animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-36" />
            <div className="h-10 bg-muted/50 rounded" />
            <div className="h-10 bg-muted/50 rounded" />
          </div>
          <div className="rounded-md border border-border bg-card p-4 animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-36" />
            <div className="h-10 bg-muted/50 rounded" />
            <div className="h-10 bg-muted/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-foreground mb-1">
          {error ? "Unable to Load Profile" : "Profile Not Completed"}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {error?.response?.data?.message ||
            error?.message ||
            "We could not find an active employee profile for your account. Please complete employee onboarding to setup your profile."}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
          <Link
            href="/employee/onboarding"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Onboarding <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <EmployeeProfileView
      employee={employee}
      officeLocation={officeLocation}
      todayPunch={todayPunch}
      avatar={avatarOverride || employee?.avatar}
      onFaceChange={handleFaceChange}
    />
  );
}
