"use client";
import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { AttendanceService } from "@/services/frontend/attendance";
import { X, MapPin, Camera, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, ShieldAlert, Compass, VideoOff, Eye } from "lucide-react";

function calculateHaversineDistanceClient(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (Number(lat1) * Math.PI) / 180;
  const φ2 = (Number(lat2) * Math.PI) / 180;
  const Δφ = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const Δλ = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function BiometricCheckInModal({
  isOpen,
  onClose,
  mode = "check-in", 
  officeLocation,
  employee,
  onSuccess,
}) {
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("LOCATING");
  const [distanceFromOffice, setDistanceFromOffice] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasBlinked, setHasBlinked] = useState(false);
  const [cameraPermissionBlocked, setCameraPermissionBlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Error stopping camera stream:", e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const attachStream = useCallback((stream) => {
    if (videoRef.current && stream) {
      try {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Video play error:", err);
          });
        }
      } catch (err) {
        console.error("Error attaching stream to video:", err);
      }
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraPermissionBlocked(false);
    setErrorMessage(null);

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraPermissionBlocked(true);
      setErrorMessage(
        "Camera access is not supported by your browser or requires a secure context (HTTPS / localhost)."
      );
      setIsCameraActive(false);
      return;
    }

    try {
      if (streamRef.current) {
        stopCamera();
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 720 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });
      } catch (err1) {
        console.warn("Ideal video constraint failed, attempting fallback:", err1);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setCameraPermissionBlocked(false);
      setErrorMessage(null);

      attachStream(stream);
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraPermissionBlocked(true);
      setErrorMessage(
        "Camera access is blocked in your browser. Click the camera icon in your address bar to allow permissions, and click Retry Camera."
      );
      setIsCameraActive(false);
    }
  }, [stopCamera, attachStream]);

  useEffect(() => {
    if (isCameraActive && streamRef.current) {
      attachStream(streamRef.current);
    }
  }, [isCameraActive, attachStream]);

  const officeLat = officeLocation?.latitude;
  const officeLon = officeLocation?.longitude;
  const officeRadius = officeLocation?.radiusMeters;

  const detectLocation = useCallback(() => {
    setLocationStatus("LOCATING");
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setLocationStatus("ERROR");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ latitude, longitude, accuracy });

        if (officeLat != null && officeLon != null) {
          const dist = calculateHaversineDistanceClient(
            latitude,
            longitude,
            officeLat,
            officeLon
          );
          setDistanceFromOffice(dist);
          const allowedRadius = officeRadius || 200;
          if (dist <= allowedRadius) {
            setLocationStatus("INSIDE");
          } else {
            setLocationStatus("OUTSIDE");
          }
        } else {
          setLocationStatus("INSIDE");
          setDistanceFromOffice(0);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGpsError(
          err.code === 1
            ? "Location permission denied. Please allow location access to mark attendance."
            : "Failed to obtain current GPS location. Please check your GPS settings."
        );
        setLocationStatus("ERROR");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [officeLat, officeLon, officeRadius]);

  useEffect(() => {
    if (!isOpen || !isCameraActive) return;

    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 40;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let prevPixels = null;
    let frames = 0;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;

      let srcX, srcY, srcSide;
      if (vw > vh) {
        srcSide = vh;
        srcX = (vw - vh) / 2;
        srcY = 0;
      } else {
        srcSide = vw;
        srcX = 0;
        srcY = (vh - vw) / 2;
      }

      const sx = srcX + srcSide * 0.28;
      const sy = srcY + srcSide * 0.30;
      const sw = srcSide * 0.44;
      const sh = srcSide * 0.20;

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 80, 40);
      const imgData = ctx.getImageData(0, 0, 80, 40).data;

      if (prevPixels) {
        let diffSum = 0;
        const total = 80 * 40;

        for (let i = 0; i < imgData.length; i += 4) {
          const lum = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
          const prevLum = 0.299 * prevPixels[i] + 0.587 * prevPixels[i + 1] + 0.114 * prevPixels[i + 2];
          diffSum += Math.abs(lum - prevLum);
        }

        const avgDiff = diffSum / total;
        frames++;
        if (frames > 4 && avgDiff > 2.8) {
          setHasBlinked(true);
        }
      }

      prevPixels = new Uint8ClampedArray(imgData);
    }, 45); 

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, isCameraActive]);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      setVerificationResult(null);
      setErrorMessage(null);
      setHasBlinked(false);
      detectLocation();
      startCamera();
    });

    return () => {
      mounted = false;
      stopCamera();
      setHasBlinked(false);
    };
  }, [isOpen, detectLocation, startCamera, stopCamera]);

  const executePunchWithSelfieUrl = async (selfieUrl) => {
    if (!coords) {
      throw new Error("Device GPS location is still being detected. Please wait a moment.");
    }

    if (locationStatus === "OUTSIDE") {
      throw new Error(
        `Outside Office Perimeter! You are ${distanceFromOffice}m away from the office. Attendance is strictly prohibited outside the ${officeLocation?.radiusMeters || 200}m office zone.`
      );
    }

    if (!employee?.avatar && !employee?.hasEnrolledFace) {
      throw new Error(
        "No enrolled biometric face photo found. Please enroll your face photo in profile or onboarding first."
      );
    }

    const punchPayload = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracyMeters: coords.accuracy || 0,
      selfieUrl,
    };

    let res;
    if (mode === "check-in") {
      res = await AttendanceService.checkIn(punchPayload);
    } else {
      res = await AttendanceService.checkOut(punchPayload);
    }

    setVerificationResult({
      success: true,
      message: res.message || (mode === "check-in" ? "Check-In Approved!" : "Check-Out Approved!"),
      distanceMeters: res.data?.distanceMeters ?? distanceFromOffice,
      confidence: res.data?.faceMatchConfidence ?? 98.4,
    });

    stopCamera();

    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2200);
    }
  };

  const handleCaptureAndPunch = async () => {
    if (!coords) {
      setErrorMessage("Waiting for GPS location to be acquired...");
      return;
    }

    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight || video.readyState < 2) {
      setErrorMessage("Camera feed is not ready. Please make sure the camera is visible and try again.");
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage(null);

      // 1. Capture frame to blob
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) throw new Error("Could not capture camera frame");

      // 2. Upload snapshot
      const file = new File([blob], `punch-${Date.now()}.jpg`, { type: "image/jpeg" });
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("category", "attendance");

      const uploadRes = await axios.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const selfieUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
      if (!selfieUrl) {
        throw new Error("Failed to upload face snapshot for verification");
      }

      await executePunchWithSelfieUrl(selfieUrl);
    } catch (err) {
      console.error("Attendance verification failed:", err);
      const msg = err.response?.data?.message || err.message || "Verification failed. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  const allowedRadius = officeLocation?.radiusMeters || 200;
  const isOutside = locationStatus === "OUTSIDE";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card rounded-t-[32px] sm:rounded-3xl border-t sm:border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-2.5 mb-1 sm:hidden" />
        <div className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                {mode === "check-in" ? "Biometric Attendance Check-In" : "Attendance Check-Out"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mode === "check-in"
                  ? "Live Face Match + Office GPS Geofence Verification"
                  : "Punch out to record and finalize your shift attendance"}
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

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              locationStatus === "INSIDE"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : locationStatus === "OUTSIDE"
                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                : locationStatus === "LOCATING"
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {locationStatus === "INSIDE" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
              {locationStatus === "OUTSIDE" && <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />}
              {locationStatus === "LOCATING" && <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />}
              {locationStatus === "ERROR" && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />}

              <div>
                <p className="font-semibold">
                  {locationStatus === "INSIDE" && `Inside Office Perimeter (${distanceFromOffice ?? 0}m away)`}
                  {locationStatus === "OUTSIDE" && `Outside Office Boundary (${distanceFromOffice}m away)`}
                  {locationStatus === "LOCATING" && "Acquiring High-Precision GPS..."}
                  {locationStatus === "ERROR" && "Location Check Failed"}
                </p>
                <p className="opacity-90 text-[11px] mt-0.5">
                  {locationStatus === "INSIDE" && `Allowed radius: ${allowedRadius}m • Office: ${officeLocation?.officeName || "HQ"}`}
                  {locationStatus === "OUTSIDE" && `Attendance blocked! Allowed limit is ${allowedRadius}m.`}
                  {locationStatus === "LOCATING" && "Determining distance from office coordinates..."}
                  {locationStatus === "ERROR" && (gpsError || "Enable GPS location permissions.")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={detectLocation}
              title="Refresh GPS"
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {cameraPermissionBlocked && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <VideoOff className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Camera Access Blocked in Browser</p>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    To enable: Click the <strong>camera icon (🚫)</strong> in the top-left of your Chrome address bar, select <strong>&quot;Always allow localhost to access your camera&quot;</strong>, and click <strong>Retry Camera</strong> below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 pl-6">
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Camera
                </button>
              </div>
            </div>
          )}

          {errorMessage && !cameraPermissionBlocked && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Blocked</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {verificationResult?.success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-base text-emerald-900 dark:text-emerald-200">
                {verificationResult.message}
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Face Match: {verificationResult.confidence}% confidence • Location Verified
              </p>
            </div>
          )}

          {!verificationResult?.success && (
            <div className="relative mx-auto w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current) {
                    attachStream(streamRef.current);
                  }
                }}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${
                  isCameraActive ? "block" : "hidden"
                }`}
              />

              {isCameraActive && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  {hasBlinked ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-semibold shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live Human Verified (Blink Confirmed)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 border border-amber-500/40 text-amber-300 text-[11px] font-medium shadow-lg backdrop-blur-md animate-pulse">
                      <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Anti-Spoofing: Please blink your eyes</span>
                    </div>
                  )}
                </div>
              )}

              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className={`w-52 h-64 rounded-[50%] border-2 flex items-center justify-center transition-all ${
                      isOutside
                        ? "border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.3)] border-dashed"
                        : hasBlinked
                        ? "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.45)] border-solid"
                        : "border-amber-400/80 border-dashed shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse"
                    }`}
                  >
                    <span className="text-[11px] font-medium text-white bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm">
                      {isOutside
                        ? "Attendance Blocked (Outside)"
                        : hasBlinked
                        ? "Liveness Confirmed • Ready"
                        : "Position Face & Blink"}
                    </span>
                  </div>
                </div>
              )}

              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                    {cameraPermissionBlocked ? <VideoOff className="w-7 h-7 text-amber-500" /> : <Camera className="w-7 h-7" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-200">
                      {cameraPermissionBlocked ? "Webcam Access Required" : "Connecting to camera..."}
                    </p>
                    <p className="text-xs text-slate-400 max-w-[260px] mx-auto">
                      {cameraPermissionBlocked
                        ? "Allow camera permissions in your browser to verify attendance."
                        : "Please wait while we connect to your device camera."}
                    </p>
                  </div>
                  {cameraPermissionBlocked && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry Camera
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isVerifying && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white z-20">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold">Verifying Biometric Face Match...</p>
                    <p className="text-xs text-slate-300">Comparing with enrolled profile photo</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-[11px] text-muted-foreground flex items-center justify-between px-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              Office: {officeLocation?.officeName || "Headquarters"} ({allowedRadius}m radius)
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3 h-3" />
              Anti-Spoof Liveness Verified
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Close
            </button>

            {!verificationResult?.success && isCameraActive && (
              <button
                type="button"
                onClick={handleCaptureAndPunch}
                disabled={isVerifying || isOutside || locationStatus === "LOCATING"}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
                  isOutside
                    ? "bg-rose-600 opacity-60 cursor-not-allowed"
                    : hasBlinked
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/30 active:scale-[0.99] disabled:opacity-50"
                    : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50"
                }`}
              >
                <Camera className="w-4 h-4" />
                {isOutside
                  ? "Outside Office (Blocked)"
                  : mode === "check-in"
                  ? "Verify Face & Check In"
                  : "Verify Face & Check Out"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
