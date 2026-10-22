import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/provider";
import NextTopLoader from "nextjs-toploader";
import { fontPoppins } from "@/constants/fonts";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#db543e" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
};

export const metadata = {
  title: "trueHR - Track Attendance. Track Employees.",
  description: "Modern HR Management Platform for attendance tracking, leave requests, employee records, and payroll.",
  icons: {
    icon: "/assets/icons/logo.png",
    apple: "/assets/icons/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "trueHR - Track Attendance. Track Employees.",
    description: "Modern HR Management Platform for attendance, leaves, and workforce tracking.",
    images: ["/assets/icons/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", fontPoppins.variable)}
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
        <NextTopLoader color="#db543e" showSpinner={false} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
