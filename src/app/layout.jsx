import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/provider";
import NextTopLoader from "nextjs-toploader";
import { fontPoppins } from "@/constants/fonts";

export const metadata = {
  title: "trueHr - Track Attendance. Track Employees.",
  description: "Modern HR Management Platform for attendance tracking, leave requests, employee records, and payroll.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "trueHr - Track Attendance. Track Employees.",
    description: "Modern HR Management Platform for attendance, leaves, and workforce tracking.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", fontPoppins.variable)}
    >
      <body className="min-h-screen bg-background text-foreground">
        <NextTopLoader color="#f65340" showSpinner={false} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
