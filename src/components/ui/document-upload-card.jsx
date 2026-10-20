"use client";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadFrontendService } from "@/services/frontend/upload";
import { UploadCloud, FileText, CheckCircle2, Trash2, ExternalLink, Loader2, Image as ImageIcon } from "lucide-react";

export function DocumentUploadCard({
  label,
  description,
  category = "documents",
  value,
  onChange,
  disabled = false,
  error,
  required = false,
  className = "",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setLocalError("File size exceeds 10MB limit");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setLocalError("Only PDF, JPEG, PNG, or WebP files are allowed");
      return;
    }

    setLocalError("");
    setIsUploading(true);
    setProgress(0);

    try {
      const res = await UploadFrontendService.uploadDocument(file, category, (percent) => {
        setProgress(percent);
      });

      if (res?.url) {
        onChange(res.url);
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (disabled || isUploading) return;
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPdf = typeof value === "string" && value.toLowerCase().endsWith(".pdf");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
        <label className="text-xs font-semibold text-foreground inline-flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </label>
        {description && (
          <span className="text-[11px] text-muted-foreground">{description}</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value ? (
        <div className="relative flex items-center justify-between p-3 sm:p-3.5 rounded-md border border-primary/30 bg-primary/5 dark:bg-primary/10 transition-all shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2 sm:mr-3">
            <div className="size-9 sm:size-10 rounded-md bg-primary/15 flex items-center justify-center shrink-0 text-primary">
              {isPdf ? <FileText className="size-4.5 sm:size-5" /> : <ImageIcon className="size-4.5 sm:size-5" />}
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground truncate min-w-0">
                {value.split("/").pop() || "Document Attached"}
              </span>
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 h-8 px-2 sm:px-2.5 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              title="Open document in new tab"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </a>

            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 px-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove file"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isUploading && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={cn(
            "relative flex flex-col items-center justify-center p-4 rounded-md border-2 border-dashed transition-all cursor-pointer select-none text-center min-h-[110px]",
            isDragging
              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
              : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/60 dark:bg-zinc-900/40",
            (error || localError) && "border-destructive/80 bg-destructive/5",
            disabled && "cursor-not-allowed opacity-60 bg-muted/30"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <Loader2 className="size-6 text-primary animate-spin" />
              <span className="text-xs font-semibold text-foreground">
                Uploading document... {progress > 0 && `${progress}%`}
              </span>
              <div className="w-36 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="size-4.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground">
                  Click or drag file to upload
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  PDF, PNG, JPG or WebP (max 10MB)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {(error || localError) && (
        <p className="text-xs text-destructive font-medium mt-0.5">
          {error || localError}
        </p>
      )}
    </div>
  );
}

export default DocumentUploadCard;
