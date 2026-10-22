"use client";
import { ClerkProvider } from "@clerk/nextjs";

export function AppClerkProvider({ children }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoImageUrl: "/assets/icons/logo.png",
          logoPlacement: "inside",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
