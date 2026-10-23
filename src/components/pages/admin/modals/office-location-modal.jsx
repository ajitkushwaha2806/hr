"use client";
import { useState, useEffect } from "react";
import { AttendanceService } from "@/services/frontend/attendance";
import { X, MapPin, Navigation, Save, RefreshCw, CheckCircle2, AlertCircle, Clock, ShieldCheck, Building2 } from "lucide-react";

export default function OfficeLocationModal({
  isOpen,
  onClose,
  currentLocation,
  onUpdated,
  onSaved,
}) {
  const [officeName, setOfficeName] = useState("Headquarters");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(200);
  const [address, setAddress] = useState("");
  const [shiftStart, setShiftStart] = useState("10:00");
  const [shiftEnd, setShiftEnd] = useState("19:00");
  const [gracePeriod, setGracePeriod] = useState(15);
  const [matchThreshold, setMatchThreshold] = useState(75);

  // Company Profile for NDA & Agreements
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyRepresentative, setCompanyRepresentative] = useState("");
  const [companyDesignation, setCompanyDesignation] = useState("Authorized Signatory");

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
        setShiftStart(currentLocation.shiftStart || "10:00");
        setShiftEnd(currentLocation.shiftEnd || "19:00");
        setGracePeriod(currentLocation.gracePeriod ?? 15);
        setMatchThreshold(currentLocation.matchThreshold ?? 75);

        // Populate company legal details
        setCompanyName(currentLocation.companyName || "");
        setCompanyAddress(currentLocation.companyAddress || currentLocation.address || "");
        setCompanyPhone(currentLocation.companyPhone || "");
        setCompanyWebsite(currentLocation.companyWebsite || "");
        setCompanyRepresentative(currentLocation.companyRepresentative || "");
        setCompanyDesignation(currentLocation.companyDesignation || "Authorized Signatory");
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
      setErrorMessage("Latitude and Longitude are required to calibrate the office zone.");
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
        shiftStart: shiftStart || "10:00",
        shiftEnd: shiftEnd || "19:00",
        gracePeriod: Number(gracePeriod) || 15,
        matchThreshold: Number(matchThreshold) || 75,
        companyName: companyName.trim(),
        companyAddress: companyAddress.trim(),
        companyPhone: companyPhone.trim(),
        companyWebsite: companyWebsite.trim(),
        companyRepresentative: companyRepresentative.trim(),
        companyDesignation: companyDesignation.trim() || "Authorized Signatory",
      });

      setStatusMessage("Office location & company rules saved successfully!");
      if (onUpdated) onUpdated(res.data || res);
      if (onSaved) onSaved(res.data || res);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Save office location error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer on mobile, Center modal on desktop */}
      <div className="relative w-full sm:max-w-lg bg-card rounded-t-[28px] sm:rounded-2xl border-t sm:border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[88vh] animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95 ease-out z-10">
        {/* Mobile Drawer Pull Indicator */}
        <div className="flex sm:hidden justify-center pt-2.5 pb-1 bg-muted/40 cursor-grab">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-3.5 border-b border-border/60 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
              <MapPin className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate">
                Calibrate Office & Shift Rules
              </h2>
              <p className="text-[11px] text-muted-foreground truncate hidden xs:block sm:block">
                Geofence perimeter, shifts, and biometric rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 text-xs">
            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" /> Geofence Perimeter
              </span>

              <button
                type="button"
                onClick={handleUseCurrentGps}
                disabled={isDetectingGps}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                {isDetectingGps ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Navigation className="size-3.5" />
                )}
                {isDetectingGps ? "Detecting GPS coordinates..." : "Set My Current GPS as Office Location"}
              </button>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Office / Branch Name
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder="e.g. Headquarters"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
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
                    placeholder="e.g. 28.5355"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
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
                    placeholder="e.g. 77.3910"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Allowed Geofence Radius
                  </label>
                  <span className="font-bold text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{radiusMeters}m</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <div className="flex gap-2 pt-1.5">
                  {[50, 100, 200, 500].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadiusMeters(r)}
                      className={`text-[11px] flex-1 py-1 rounded-lg border cursor-pointer font-semibold transition-colors ${
                        radiusMeters === r
                          ? "bg-primary text-white border-primary shadow-2xs"
                          : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {r}m
                    </button>
                  ))}
                </div>
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
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3.5 border-t border-border/60">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5 text-amber-500" /> Work Shift & Grace Period
              </span>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Grace (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3.5 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Face Match Threshold
                </span>
                <span className="font-bold text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{matchThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
              <p className="text-[11px] text-muted-foreground">
                Face match scores below {matchThreshold}% will be blocked to prevent photo spoofs.
              </p>
            </div>

            {/* COMPANY & LEGAL PROFILE (FOR NDA & AGREEMENTS) */}
            <div className="space-y-3 pt-3.5 border-t border-border/60">
              <div>
                <span className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" /> Company Profile & NDA Details
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  These legal details will be dynamically injected into employee Non-Disclosure Agreements and contracts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Company Legal Entity Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Technologies Pvt. Ltd."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Registered Office Address
                </label>
                <textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="e.g. 4th Floor, Tech Hub, Cyber City, Sector 63..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Official Website
                  </label>
                  <input
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="e.g. www.acme.com"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Authorized Signatory / Representative
                  </label>
                  <input
                    type="text"
                    value={companyRepresentative}
                    onChange={(e) => setCompanyRepresentative(e.target.value)}
                    placeholder="e.g. John Doe (Director)"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Signatory Designation
                  </label>
                  <input
                    type="text"
                    value={companyDesignation}
                    onChange={(e) => setCompanyDesignation(e.target.value)}
                    placeholder="e.g. Authorized Signatory"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 border-t border-border/70 bg-card/95 backdrop-blur-md shrink-0 flex items-center gap-2.5 pb-safe pb-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              {isSaving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
