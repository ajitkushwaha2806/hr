"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import axios from "axios";

export default function FaceCaptureCard({
  value,
  onChange,
  error,
  allowRetake = false,
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
    <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">{label}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Live Face ID
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        {value && !isCameraActive && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Face Registered
          </div>
        )}
      </div>

      {cameraError && (
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <p>{cameraError}</p>
        </div>
      )}

      {error && !cameraError && (
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* Main View Area */}
      <div className="relative mx-auto w-full aspect-square sm:aspect-[4/3] rounded-md overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
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
            <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-emerald-400/90 shadow-[0_0_15px_rgba(5,147,72,0.4)] flex items-center justify-center">
              <span className="text-[11px] font-medium text-emerald-300 bg-black/75 px-2.5 py-0.5 rounded-md">
                Align face inside
              </span>
            </div>
          </div>
        )}

        {!isCameraActive && value && (
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="Registered Biometric Face"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/70 p-3 flex items-center justify-between">
              <span className="text-xs text-white font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live Reference Active
              </span>
            </div>
          </div>
        )}

        {!isCameraActive && !value && (
          <div className="text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-md bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-300">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">No Face Photo Enrolled</p>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
                Open camera to capture a live selfie for attendance verification
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white z-20">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <p className="text-xs font-medium">Enrolling Face Biometric...</p>
          </div>
        )}
      </div>
      
      {(isCameraActive || !value || allowRetake) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {isCameraActive ? (
            <>
              <button
                type="button"
                onClick={handleCapture}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3.5 py-2 rounded-md border border-border hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          ) : !value ? (
            <button
              type="button"
              onClick={startCamera}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs transition-colors"
            >
              <Camera className="w-4 h-4" />
              Open Camera & Take Selfie
            </button>
          ) : allowRetake ? (
            <button
              type="button"
              onClick={startCamera}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs transition-colors"
            >
              <Camera className="w-4 h-4" />
              Retake Live Selfie
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
