"use client";
import { Button } from "@/components/ui/button";
import { X, ShieldCheck, MapPin, Clock, User, Camera } from "lucide-react";

export default function SelfiePreviewModal({
  isOpen,
  onClose,
  data, 
}) {
  if (!isOpen || !data?.selfieUrl) return null;

  const captureType = data.type || "Check-In";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground border border-border p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Camera className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {captureType} Biometric Capture
              </h3>
              <p className="text-[11px] text-muted-foreground">AWS Rekognition facial audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border bg-black/10 shadow-inner">
          <img
            src={data.selfieUrl}
            alt={`${captureType} Biometric Capture`}
            className="w-full h-full object-cover"
          />
          {data.confidence && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] px-2.5 py-1.5 rounded-lg flex items-center justify-between">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                <ShieldCheck className="size-3.5" /> Face Match Verified
              </span>
              <span className="font-bold">{data.confidence}</span>
            </div>
          )}
        </div>

        <div className="bg-muted/30 border border-border/50 rounded-xl p-3 space-y-2 text-xs">
          {data.empName && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-3 text-muted-foreground" /> Employee
              </span>
              <span className="font-medium text-foreground">{data.empName}</span>
            </div>
          )}
          {data.punchTime && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3 text-muted-foreground" /> {captureType} Time
              </span>
              <span className="font-medium text-foreground">
                {data.punchTime} ({data.date || "Today"})
              </span>
            </div>
          )}
          {data.distance && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3 text-amber-500" /> Geofence Distance
              </span>
              <span className="font-medium text-foreground">{data.distance}</span>
            </div>
          )}
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="w-full h-8.5 rounded-lg text-xs font-semibold cursor-pointer"
        >
          Close Preview
        </Button>
      </div>
    </div>
  );
}
