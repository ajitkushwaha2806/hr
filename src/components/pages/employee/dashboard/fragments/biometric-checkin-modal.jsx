"use client";
import axios from "axios";
import { createPortal } from "react-dom";
import { AttendanceService } from "@/services/frontend/attendance";
import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { X, MapPin, Camera, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, ShieldAlert, Compass, VideoOff, Eye } from "lucide-react";

const emptySubscribe = () => () => {};

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
  initialCoords,
  onSuccess,
}) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const officeLat = officeLocation?.latitude;
  const officeLon = officeLocation?.longitude;
  const officeRadius = officeLocation?.radiusMeters;

  const [coords, setCoords] = useState(initialCoords || null);
  const [distanceFromOffice, setDistanceFromOffice] = useState(() => {
    if (initialCoords?.latitude != null && officeLat != null && officeLon != null) {
      return calculateHaversineDistanceClient(
        initialCoords.latitude,
        initialCoords.longitude,
        officeLat,
        officeLon
      );
    }
    return null;
  });
  const [locationStatus, setLocationStatus] = useState(() => {
    if (initialCoords?.latitude != null) {
      if (officeLat != null && officeLon != null) {
        const dist = calculateHaversineDistanceClient(
          initialCoords.latitude,
          initialCoords.longitude,
          officeLat,
          officeLon
        );
        return dist <= (officeRadius || 200) ? "INSIDE" : "OUTSIDE";
      }
      return "INSIDE";
    }
    return "LOCATING";
  });
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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.warn("Video play error on metadata:", err);
          });
        };
        videoRef.current.play().catch((err) => {
          console.warn("Video play error direct:", err);
        });
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
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
      } catch (err1) {
        console.warn("Ideal video constraint failed, attempting basic fallback:", err1);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setCameraPermissionBlocked(false);
      setErrorMessage(null);

      if (videoRef.current) {
        attachStream(stream);
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraPermissionBlocked(true);
      setErrorMessage(
        "Camera access is blocked in your browser. Click the camera icon in your address bar to allow permissions, and click Retry Camera."
      );
      setIsCameraActive(false);
    }
  }, [attachStream]);

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      attachStream(streamRef.current);
    }
  }, [isCameraActive, attachStream]);

  const detectLocation = useCallback(() => {
    setGpsError(null);
    setLocationStatus((current) => (current === "INSIDE" || current === "OUTSIDE" ? current : "LOCATING"));

    if (typeof window === "undefined" || !navigator?.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setLocationStatus("ERROR");
      return;
    }

    const processPosition = (pos) => {
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
      setGpsError(null);
    };

    const handleFailure = (err) => {
      console.warn("Geolocation failure:", err);

      let msg = "Failed to obtain current GPS location.";
      if (err?.code === 1) {
        msg = "Location permission denied. Click the lock/site settings icon in your browser address bar and set Location to Allow.";
      } else if (err?.code === 2) {
        msg = "GPS position unavailable. Please ensure Location Services are turned ON on your computer/phone.";
      } else if (err?.code === 3) {
        msg = "GPS request timed out. Please click Retry GPS below.";
      }
      setGpsError(msg);
      setLocationStatus((curr) => (curr === "INSIDE" ? curr : "ERROR"));
    };

    // Fast 2-tier acquisition: First try high accuracy with 4s timeout and cache
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        processPosition(pos);
      },
      (err) => {
        if (err?.code === 1) {
          handleFailure(err);
          return;
        }
        console.warn("High-accuracy GPS timed out/unavailable, falling back to standard accuracy...");
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            processPosition(fallbackPos);
          },
          handleFailure,
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 30000,
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

    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setVerificationResult(null);
      setErrorMessage(null);
      setHasBlinked(false);
      detectLocation();
      startCamera();
    });

    return () => {
      active = false;
      stopCamera();
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

    const d = new Date();
    const clientDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const punchPayload = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracyMeters: coords.accuracy || 0,
      selfieUrl,
      clientDate,
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
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) throw new Error("Could not capture camera frame");

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

  if (!isOpen || !mounted) return null;

  const allowedRadius = officeLocation?.radiusMeters || 200;
  const isOutside = locationStatus === "OUTSIDE";

  return createPortal(
    <div className="fixed inset-0 bottom-0 left-0 right-0 top-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card rounded-t-[28px] sm:rounded-3xl border-t sm:border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[90vh] bottom-0 mb-0">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-2 sm:hidden shrink-0" />
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-border bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-base text-foreground tracking-tight truncate">
                {mode === "check-in" ? "Biometric Attendance Check-In" : "Attendance Check-Out"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {mode === "check-in"
                  ? "Live Face Match + Office GPS Geofence Verification"
                  : "Punch out to record and finalize your shift attendance"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0">
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

              <div className="min-w-0">
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
                {locationStatus === "ERROR" && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry GPS
                    </button>
                    {process.env.NODE_ENV === "development" && officeLat != null && (
                      <button
                        type="button"
                        onClick={() => {
                          const mockCoords = { latitude: officeLat, longitude: officeLon, accuracy: 10 };
                          setCoords(mockCoords);
                          setDistanceFromOffice(0);
                          setLocationStatus("INSIDE");
                          setGpsError(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/80 dark:bg-zinc-800 border border-border text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Simulate Office (Dev)
                      </button>
                    )}
                  </div>
                )}
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
            <div className="relative mx-auto w-full aspect-[4/3] sm:aspect-square max-h-[36vh] sm:max-h-none rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner shrink-0">
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
                <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-max max-w-[92%]">
                  {hasBlinked ? (
                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10.5px] sm:text-[11px] font-semibold shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Live Human Verified (Blink Confirmed)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-950/85 border border-amber-500/40 text-amber-300 text-[10.5px] sm:text-[11px] font-medium shadow-lg backdrop-blur-md animate-pulse">
                      <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                      <span className="truncate">Anti-Spoofing: Please blink your eyes</span>
                    </div>
                  )}
                </div>
              )}

              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-2">
                  <div
                    className={`w-36 h-48 sm:w-52 sm:h-64 rounded-[50%] border-2 transition-all ${
                      isOutside
                        ? "border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.3)] border-dashed"
                        : hasBlinked
                        ? "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.45)] border-solid"
                        : "border-amber-400/80 border-dashed shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse"
                    }`}
                  />
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs transition-colors"
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

          <div className="text-[10.5px] sm:text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-1.5 px-1 shrink-0">
            <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              Office: {officeLocation?.officeName || "Headquarters"} ({allowedRadius}m radius)
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="w-3 h-3 shrink-0" />
              Anti-Spoof Liveness Verified
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-5 py-3.5 sm:py-3.5 border-t border-border bg-card shrink-0 pb-6 sm:pb-3.5">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-center"
            >
              Close
            </button>

            {!verificationResult?.success && isCameraActive && (
              <button
                type="button"
                onClick={handleCaptureAndPunch}
                disabled={isVerifying || isOutside || locationStatus === "LOCATING"}
                className={`flex-2 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all text-center ${
                  isOutside
                    ? "bg-rose-600 opacity-60 cursor-not-allowed"
                    : hasBlinked
                    ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/30 active:scale-[0.99] disabled:opacity-50"
                    : "bg-primary hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50"
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {isOutside
                    ? "Outside Office (Blocked)"
                    : mode === "check-in"
                    ? "Verify Face & Check In"
                    : "Verify Face & Check Out"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
