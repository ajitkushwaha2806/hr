"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import axios from "axios";

export default function FaceCaptureCard({
  value,
  onChange,
  error,
  allowRetake = true,
  label = "Biometric Face Registration",
  description = "Take a clear live selfie facing the camera in good lighting. This photo is used to verify your daily attendance.",
}) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Error stopping stream tracks:", e);
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

  const startCamera = async () => {
    setCameraError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by your browser or requires a secure context (HTTPS / localhost).");
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
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      streamRef.current = stream;
      setIsCameraActive(true);
      attachStream(stream);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera unavailable. Please allow camera permissions to capture your selfie.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current) {
      attachStream(streamRef.current);
    }
  }, [isCameraActive, attachStream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight || video.readyState < 2) {
      setCameraError("Camera feed is not ready. Please wait a moment and try again.");
      return;
    }

    try {
      setIsUploading(true);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) throw new Error("Failed to capture image frame");

      const file = new File([blob], `face-biometric-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "faces");

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        stopCamera();
      }
    } catch (err) {
      console.error("Failed to upload captured face photo:", err);
      setCameraError(err.response?.data?.message || err.message || "Capture upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 shadow-xs space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">{label}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">{description}</p>
        </div>

        {value && !isCameraActive && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0 whitespace-nowrap self-start sm:self-auto">
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            Face Registered
          </div>
        )}
      </div>

      {/* Errors */}
      {cameraError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-500" />
          <p className="leading-relaxed">{cameraError}</p>
        </div>
      )}

      {error && !cameraError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-500" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Viewfinder Card */}
      <div className="relative mx-auto w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 border border-border/80 shadow-inner flex items-center justify-center">
        {/* Permanently mounted video element */}
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

        {/* Face Oval Overlay Guide during camera capture */}
        {isCameraActive && (
          <>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-40 h-52 sm:w-44 sm:h-56 rounded-[50%] border-2 border-dashed border-emerald-400/90 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center">
                <span className="text-[11px] font-semibold text-emerald-300 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-xs">
                  Center face inside oval
                </span>
              </div>
            </div>

            {/* Cancel Button top-right during camera */}
            <button
              type="button"
              onClick={stopCamera}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/20 transition-all shadow-sm"
            >
              Cancel
            </button>

            {/* Capture shutter button at bottom */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center px-4 z-10">
              <button
                type="button"
                onClick={handleCapture}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
              >
                <Camera className="size-4" />
                Capture Selfie
              </button>
            </div>
          </>
        )}

        {/* Enrolled Live Photo Display */}
        {!isCameraActive && value && (
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="Registered Biometric Face"
              className="w-full h-full object-cover"
            />
            {/* Top pill badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white shadow-sm">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Reference Active
            </div>

            {/* Sleek bottom overlay bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 sm:p-4 flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-300 font-medium hidden sm:inline-block truncate">
                Verified for Biometric Check-in
              </span>
              <button
                type="button"
                onClick={startCamera}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-zinc-900 font-semibold text-xs shadow-md active:scale-95 transition-all whitespace-nowrap ml-auto"
              >
                <RefreshCw className="size-3 text-zinc-800" />
                <span>Retake Photo</span>
              </button>
            </div>
          </div>
        )}

        {!isCameraActive && !value && (
          <div className="text-center p-6 space-y-3">
            <div className="size-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 mx-auto flex items-center justify-center text-primary shadow-inner">
              <Camera className="size-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">No Face Photo Enrolled</p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-md shadow-primary/25 active:scale-95 transition-all whitespace-nowrap"
            >
              <Camera className="size-4" />
              Open Camera & Take Selfie
            </button>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 text-white z-20">
            <RefreshCw className="size-7 animate-spin text-primary" />
            <p className="text-xs font-semibold tracking-wide">Enrolling Biometric Reference...</p>
          </div>
        )}
      </div>
    </div>
  );
}
