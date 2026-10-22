"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    try {
      router.replace("/");
    } catch {
      window.location.replace("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <meta httpEquiv="refresh" content="0;url=/" />
      <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
