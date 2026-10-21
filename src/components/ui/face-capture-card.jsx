"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import axios from "axios";

export default function FaceCaptureCard({
  value,
  onChange,
  error,
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
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-foreground tracking-tight">{label}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> 100% Live Camera Verification
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        {value && !isCameraActive && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Face Registered
          </div>
        )}
      </div>

      {cameraError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <p>{cameraError}</p>
        </div>
      )}

      {error && !cameraError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* Main View Area */}
      <div className="relative mx-auto w-full max-w-sm aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
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

        {/* Face Oval Overlay Guide */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center animate-pulse">
              <span className="text-[11px] font-medium text-emerald-300 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Align face here
              </span>
            </div>
          </div>
        )}

        {/* If Photo is enrolled and camera not active */}
        {!isCameraActive && value && (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Registered Biometric Face"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs text-white/90 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Biometric Reference Active
              </span>
            </div>
          </div>
        )}

        {/* Placeholder state when no photo and camera inactive */}
        {!isCameraActive && !value && (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/60 mx-auto flex items-center justify-center text-slate-400">
              <Camera className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">No Face Photo Enrolled</p>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
                Open camera to take a live frontal selfie for attendance verification
              </p>
            </div>
          </div>
        )}

        {/* Uploading Spinner Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-white z-20">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
            <p className="text-xs font-medium">Processing & Enrolling Face Biometric...</p>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {isCameraActive ? (
          <>
            <button
              type="button"
              onClick={handleCapture}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Capture Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-sm transition-colors"
          >
            <Camera className="w-4 h-4" />
            {value ? "Retake Live Selfie" : "Open Camera & Take Selfie"}
          </button>
        )}
      </div>
    </div>
  );
}
