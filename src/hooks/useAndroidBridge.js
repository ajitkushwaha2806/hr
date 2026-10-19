"use client";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

export function useAndroidBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || typeof window === "undefined") {
      return;
    }

    SplashScreen.hide().catch(console.error);
    const handleNativeDownload = (href, filename) => {
      if (!window.AndroidDownloader?.downloadBase64) return false;

      if (href.startsWith("data:")) {
        const parts = href.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
        const base64 = parts[1];
        window.AndroidDownloader.downloadBase64(base64, filename, mime);
        return true;
      } else if (href.startsWith("blob:")) {
        fetch(href)
          .then((r) => r.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result;
              if (typeof result === "string") {
                const base64 = result.split(",")[1];
                window.AndroidDownloader.downloadBase64(
                  base64,
                  filename,
                  blob.type || "application/octet-stream"
                );
              }
            };
            reader.readAsDataURL(blob);
          })
          .catch(console.error);
        return true;
      }
      return false;
    };

    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.hasAttribute("download") && this.href) {
        const filename = this.getAttribute("download") || "download";
        if (handleNativeDownload(this.href, filename)) {
          return;
        }
      }
      return originalClick.apply(this, arguments);
    };

    const clickListener = (e) => {
      const anchor = e.target.closest?.("a[download]");
      if (anchor && anchor.href) {
        const filename = anchor.getAttribute("download") || "download";
        if (handleNativeDownload(anchor.href, filename)) {
          e.preventDefault();
        }
      }
    };
    document.addEventListener("click", clickListener, true);

    return () => {
      HTMLAnchorElement.prototype.click = originalClick;
      document.removeEventListener("click", clickListener, true);
    };
  }, []);
}
