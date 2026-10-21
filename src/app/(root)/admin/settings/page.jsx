"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  MapPin,
  ShieldCheck,
  Clock,
  Building,
  Save,
  Navigation,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AttendanceService } from "@/services/frontend/attendance";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [officeName, setOfficeName] = useState("Headquarters");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(200);

  // Biometric & Shift Settings
  const [matchThreshold, setMatchThreshold] = useState(75);
  const [shiftStart, setShiftStart] = useState("09:30");
  const [shiftEnd, setShiftEnd] = useState("18:30");
  const [gracePeriod, setGracePeriod] = useState(15);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await AttendanceService.getOfficeLocation();
        if (res?.success && res.data) {
          setOfficeName(res.data.officeName || "Headquarters");
          setLatitude(res.data.latitude ?? "");
          setLongitude(res.data.longitude ?? "");
          setRadiusMeters(res.data.radiusMeters || 200);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setIsDetectingLocation(false);
        toast.success(`Current GPS detected: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setIsDetectingLocation(false);
        toast.error(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await AttendanceService.setOfficeLocation({
        officeName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: parseInt(radiusMeters, 10),
      });
      toast.success("Company & Geofence settings saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Company Configuration & Rules
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <Settings className="w-3 h-3" /> System Controls
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Calibrate office geofencing coordinates, biometric security levels, and company shifts.
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving || isLoading}
          className="h-8.5 px-4 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Office Geofence Calibration */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">Office Geofencing Perimeter</h2>
              <p className="text-[11px] text-muted-foreground">Punches outside this zone will be rejected</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">Office Name</label>
              <Input
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="e.g. Headquarters, Bangalore Branch"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground block mb-1">Latitude</label>
                <Input
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 28.5355"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground block mb-1">Longitude</label>
                <Input
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.3910"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDetectGPS}
              disabled={isDetectingLocation}
              className="w-full h-8 text-xs font-medium cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 mr-1.5 text-primary ${isDetectingLocation ? "animate-spin" : ""}`} />
              {isDetectingLocation ? "Querying device GPS..." : "Detect Current Device Location"}
            </Button>

            <div>
              <label className="font-semibold text-foreground block mb-1">
                Allowed Radius (Meters): <span className="text-primary font-bold">{radiusMeters}m</span>
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>50m (Strict)</span>
                <span>200m (Standard)</span>
                <span>1000m (Campus)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: AWS Rekognition Biometric Engine */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">AWS Rekognition Biometrics</h2>
              <p className="text-[11px] text-muted-foreground">AI Face match & anti-spoofing criteria</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">
                Minimum Match Confidence: <span className="text-primary font-bold">{matchThreshold}%</span>
              </label>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(e.target.value)}
                className="w-full accent-primary cursor-pointer"
              />
              <p className="text-[10.5px] text-muted-foreground mt-1">
                Faces with similarity score below {matchThreshold}% will be immediately blocked from check-in.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Liveness Eye-Blink Detector</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Employees must naturally blink on camera before face recognition capture activates. Prevents static photo spoofs.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Live Camera Enforcement</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                File upload options are permanently disabled. Only real-time webcam/mobile cameras are accepted.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Shift Timing & Grace Period */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">Work Shift & Late Mark Policy</h2>
              <p className="text-[11px] text-muted-foreground">Define office hours and punctuality thresholds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">Shift Start Time</label>
              <Input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Shift End Time</label>
              <Input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Grace Period (Minutes)</label>
              <Input
                type="number"
                min="0"
                max="60"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
