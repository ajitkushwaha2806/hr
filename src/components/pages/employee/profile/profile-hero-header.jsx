"use client";
import { useState } from "react";
import { Camera } from "lucide-react";
import LivePhotoModal from "./live-photo-modal";

export default function ProfileHeroHeader({
  fullName,
  avatarUrl,
  role,
  department,
  employeeId,
  status,
  employmentType,
  hasEnrolledFace = false,
  onUpdatePhoto,
}) {
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  const handleOpenLiveCapture = () => {
    setIsLiveModalOpen(true);
  };

  const handlePhotoSaved = async (newUrl) => {
    if (onUpdatePhoto) {
      await onUpdatePhoto(newUrl);
    }
  };

  const isFaceEnrolled = Boolean(hasEnrolledFace || (avatarUrl && !avatarUrl.includes("placeholder")));

  return (
    <>
      <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div
                onClick={handleOpenLiveCapture}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenLiveCapture();
                  }
                }}
                title="Click to capture live biometric photo"
                className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-slate-900 border border-border shrink-0 flex items-start justify-start cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/50"
              >
                <img
                  src={avatarUrl || "/placeholder.png"}
                  alt={fullName || "Employee"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.png";
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover Overlay with Live Camera Cue */}
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow text-emerald-400" />
                  <span className="text-[9px] font-semibold tracking-wide mt-0.5 drop-shadow">
                    Take Selfie
                  </span>
                </div>

                {/* Live Biometric Pulse Indicator */}
                <div
                  className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-card ${
                    isFaceEnrolled ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  title={isFaceEnrolled ? "Biometric Reference Active" : "Pending Biometric Photo"}
                />
              </div>

              {/* Quick Action Camera Shutter Button */}
              <button
                type="button"
                onClick={handleOpenLiveCapture}
                aria-label="Capture live selfie for attendance verification"
                title="Capture live selfie for attendance verification"
                className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-transform"
              >
                <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {fullName || "-"}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {role || "-"} • {department || "-"}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-mono text-foreground font-semibold bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                {employeeId || "-"}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {status || "-"}
              </span>
              <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700">
                {employmentType || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Biometric Camera Modal */}
      <LivePhotoModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        onPhotoSaved={handlePhotoSaved}
        currentPhoto={avatarUrl}
      />
    </>
  );
}

