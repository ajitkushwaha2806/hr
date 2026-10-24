"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import FaceCaptureCard from "@/components/ui/face-capture-card";

const emptySubscribe = () => () => {};

export default function LivePhotoModal({ isOpen, onClose, onPhotoSaved, currentPhoto }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const initialPhoto =
    currentPhoto && !currentPhoto.includes("placeholder") ? currentPhoto : "";
  const [photoUrl, setPhotoUrl] = useState(initialPhoto);

  if (!mounted || !isOpen) return null;

  const handleFaceCaptured = async (uploadedUrl) => {
    setPhotoUrl(uploadedUrl);
    if (onPhotoSaved) {
      await onPhotoSaved(uploadedUrl);
    }
    // Small delay so user sees "Face Registered" confirmation before closing
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div
        className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/70 bg-muted/30">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Biometric Live Photo
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live selfie for facial recognition & attendance verification
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Reusing FaceCaptureCard seamlessly without nested borders/headers */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <FaceCaptureCard
            value={photoUrl}
            onChange={handleFaceCaptured}
            onCancel={onClose}
            hideHeader={true}
            className="border-0 p-0 shadow-none bg-transparent space-y-0"
            autoStart={!photoUrl}
            allowRetake={true}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
