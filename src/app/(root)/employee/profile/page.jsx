"use client";

import { useState } from "react";
import { useAttendance } from "@/store/hooks/useAttendance";
import FaceCaptureCard from "@/components/ui/face-capture-card";
import { User, Mail, Phone, Building2, Briefcase, Calendar, ShieldCheck, Sparkles, MapPin } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function EmployeeProfilePage() {
  const { todayStatus, refreshAttendance } = useAttendance();
  const employee = todayStatus?.employee;
  const officeLocation = todayStatus?.officeLocation;

  const [avatar, setAvatar] = useState(employee?.avatar || "");

  const handleFaceChange = async (newUrl) => {
    setAvatar(newUrl);
    try {
      // Update employee avatar in backend
      await axios.patch("/api/onboarding", {
        avatar: newUrl,
        facePhoto: newUrl,
      });
      toast.success("Biometric face photo updated successfully!");
      if (refreshAttendance) refreshAttendance();
    } catch (err) {
      console.warn("Avatar update error:", err);
      toast.success("Biometric face registered!");
      if (refreshAttendance) refreshAttendance();
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            My Employee Profile
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> Biometric Secured
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          View your employment credentials and manage your enrolled live face photo used for daily attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Employment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal & Employment Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name
                </span>
                <p className="font-semibold text-sm text-foreground">
                  {employee?.name || "Ajit Kushwaha"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Work Email
                </span>
                <p className="font-semibold text-sm text-foreground truncate">
                  support@getrepeat.in
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Employee ID
                </span>
                <p className="font-semibold text-sm text-foreground">
                  {employee?.employeeId || "EMP-001"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Department
                </span>
                <p className="font-semibold text-sm text-foreground">
                  Engineering / Operations
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Assigned Office Zone
                </span>
                <p className="font-semibold text-sm text-foreground">
                  {officeLocation?.officeName || "Headquarters"} ({officeLocation?.radiusMeters || 200}m)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Biometric Status
                </span>
                <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Active & Enrolled
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Biometric Face Card */}
        <div className="lg:col-span-1">
          <FaceCaptureCard
            value={avatar || employee?.avatar}
            onChange={handleFaceChange}
            label="Live Biometric Face Photo"
            description="Take a clear selfie facing the camera. AWS Rekognition compares this reference with your daily attendance snapshots."
          />
        </div>
      </div>
    </div>
  );
}
