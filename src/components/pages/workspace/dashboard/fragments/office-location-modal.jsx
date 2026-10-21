"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Navigation, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { AttendanceService } from "@/services/frontend/attendance";

export default function OfficeLocationModal({
  isOpen,
  onClose,
  currentLocation,
  onUpdated,
}) {
  const [officeName, setOfficeName] = useState("Headquarters");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(200);
  const [address, setAddress] = useState("");

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setStatusMessage(null);
      setErrorMessage(null);
      if (currentLocation) {
        setOfficeName(currentLocation.officeName || "Headquarters");
        setLatitude(currentLocation.latitude != null ? String(currentLocation.latitude) : "");
        setLongitude(currentLocation.longitude != null ? String(currentLocation.longitude) : "");
        setRadiusMeters(currentLocation.radiusMeters || 200);
        setAddress(currentLocation.address || "");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, currentLocation]);

  const handleUseCurrentGps = () => {
    setIsDetectingGps(true);
    setErrorMessage(null);
    setStatusMessage(null);

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser");
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLatitude(String(lat));
        setLongitude(String(lng));
        setStatusMessage(`Captured GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setIsDetectingGps(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setErrorMessage("Failed to detect GPS location. Ensure location permissions are allowed.");
        setIsDetectingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      setErrorMessage("Latitude and Longitude are required");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const res = await AttendanceService.setOfficeLocation({
        officeName: officeName.trim() || "Headquarters",
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMeters: Number(radiusMeters) || 200,
        address: address.trim(),
      });

      setStatusMessage("Office location calibrated successfully!");
      if (onUpdated) onUpdated(res.data || res);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Save office location error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save office location");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                Calibrate Office Location
              </h2>
              <p className="text-xs text-muted-foreground">
                Set geofence perimeter coordinates for attendance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {statusMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Calibration Action */}
          <button
            type="button"
            onClick={handleUseCurrentGps}
            disabled={isDetectingGps}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold shadow-sm transition-colors"
          >
            {isDetectingGps ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            Set My Current GPS as Office Location
          </button>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Office / Branch Name
              </label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="e.g. Headquarters"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 28.6139"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.2090"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Allowed Geofence Radius (Meters)
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                placeholder="200"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Default: 200m. Attendance cannot be marked if employee is outside this distance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Address / Location Notes
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Floor 4, Cyber City Tower B"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
