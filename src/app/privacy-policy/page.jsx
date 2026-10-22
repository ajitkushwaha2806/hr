import Link from "next/link";
import Image from "next/image";
import {  ShieldCheck,  Lock,  MapPin,  Camera,  UserCheck,  Database,  Eye,  FileText,  Mail,  ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | trueHR",
  description: "Learn how trueHR collects, uses, protects, and handles your employee personal, biometric, and attendance data.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 21, 2026";

  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "information-collected", title: "2. Information We Collect" },
    { id: "biometric-data", title: "3. Biometric & Camera Data" },
    { id: "location-data", title: "4. Geolocation & Geofencing" },
    { id: "how-we-use", title: "5. How We Use Information" },
    { id: "data-sharing", title: "6. Data Sharing & Disclosure" },
    { id: "data-security", title: "7. Security & Encryption" },
    { id: "retention-deletion", title: "8. Data Retention & Deletion" },
    { id: "employee-rights", title: "9. Your Rights & Choices" },
    { id: "contact-us", title: "10. Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 text-foreground transition-colors selection:bg-[#f65340]/20 selection:text-[#f65340]">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/assets/icons/logo.png"
              alt="trueHR Logo"
              width={28}
              height={28}
              className="size-7 rounded-md object-cover group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center leading-none">
              <span className="font-bold text-lg tracking-tight text-[#f65340]">true</span>
              <span className="font-bold text-lg tracking-tight text-foreground">HR</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/employee/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-border/40 bg-white dark:bg-zinc-900/50 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#f65340]/10 text-[#f65340] border border-[#f65340]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>trueHR Legal & Transparency Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your trust and data privacy are paramount. This policy outlines how <span className="font-semibold text-foreground">trueHR</span> collects, handles, safeguards, and respects your employee records, facial recognition attendance scans, and workplace geolocation data.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#f65340]" />
              Last Updated: {lastUpdated}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Google Play & Enterprise Compliant
            </span>
          </div>
        </div>
      </section>

      {/* Main Body with Sidebar Table of Contents */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Quick Navigation Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block sticky top-24">
            <div className="p-4 rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2 px-2 pb-2 border-b border-border/40 font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                <FileText className="w-3.5 h-3.5 text-[#f65340]" />
                <span>Table of Contents</span>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 sm:p-10 rounded-3xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xs space-y-10 leading-relaxed text-sm text-foreground/90">
              <section id="introduction" className="space-y-3 scroll-mt-24">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">1. Introduction</h2>
                </div>
                <p>
                  Welcome to <strong className="text-foreground">trueHR</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). trueHR is a modern human resource management, attendance verification, leave tracking, and workforce management platform designed for organizations and their employees.
                </p>
                <p>
                  This Privacy Policy applies to our mobile applications (Android/iOS), web platform, API services, and associated products. By installing, accessing, or using trueHR, you and your employer acknowledge the collection and handling of information in accordance with this policy.
                </p>
              </section>

              <section id="information-collected" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <Database className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">2. Information We Collect</h2>
                </div>
                <p>
                  We only collect data necessary to provide seamless HR and verified attendance services to your workplace:
                </p>
                <ul className="space-y-2.5 list-disc list-inside pl-1 text-foreground/80">
                  <li>
                    <strong className="text-foreground">Employee Profile Information:</strong> Full name, corporate email address, employee ID, phone number, job title, department, manager, and enrolled profile headshot.
                  </li>
                  <li>
                    <strong className="text-foreground">Attendance & Shift Records:</strong> Punch-in and punch-out timestamps, shift duration calculations, break times, attendance notes, and daily status (Present, Half Day, Absent).
                  </li>
                  <li>
                    <strong className="text-foreground">Leave & Absence Records:</strong> Leave request dates, leave categories (Casual, Medical, Paid), reason descriptions, medical documentation (if submitted), and manager approvals.
                  </li>
                  <li>
                    <strong className="text-foreground">Device & Technical Diagnostics:</strong> Device model, operating system version, network state, IP address, and anonymized diagnostic crash logs for stability.
                  </li>
                </ul>
              </section>

              <section id="biometric-data" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <Camera className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">3. Biometric & Facial Camera Data</h2>
                </div>
                <div className="p-4 rounded-xl bg-[#f65340]/5 border border-[#f65340]/20 space-y-2">
                  <p className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#f65340]">
                    <Lock className="w-4 h-4" />
                    Strict Biometric Privacy Standards
                  </p>
                  <p className="text-xs text-foreground/85 leading-normal">
                    trueHR utilizes high-precision facial verification strictly to authenticate that the employee punching in is physically present, eliminating &ldquo;buddy punching&rdquo; and payroll fraud.
                  </p>
                </div>
                <ul className="space-y-2 list-disc list-inside pl-1 text-foreground/80">
                  <li>
                    <strong className="text-foreground">Camera Access:</strong> The camera is activated only when you explicitly press &ldquo;Check In&rdquo; or &ldquo;Check Out&rdquo;. It is never accessed in the background or when the app is idle.
                  </li>
                  <li>
                    <strong className="text-foreground">Anti-Spoofing & Liveness:</strong> Our algorithms verify live natural motion (such as natural eye blinks or head tilt) to verify authenticity and prevent static photo spoofing.
                  </li>
                  <li>
                    <strong className="text-foreground">Vector Comparison:</strong> Captured faces are analyzed cryptographically against your enrolled reference profile photo.
                  </li>
                  <li>
                    <strong className="text-foreground">No Advertising or Commercial Use:</strong> We <span className="underline font-semibold text-foreground">never</span> sell, trade, or monetize facial or biometric information. It is strictly accessible to your employer&apos;s verified HR administrators.
                  </li>
                </ul>
              </section>

              <section id="location-data" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">4. Geolocation & Workplace Geofencing</h2>
                </div>
                <p>
                  trueHR uses location services to verify that punch events occur within designated office premises:
                </p>
                <ul className="space-y-2 list-disc list-inside pl-1 text-foreground/80">
                  <li>
                    <strong className="text-foreground">Point-in-Time Geolocation:</strong> Your device&apos;s GPS coordinates are acquired exclusively at the instant you click the punch button.
                  </li>
                  <li>
                    <strong className="text-foreground">Zero Background Tracking:</strong> trueHR does <span className="underline font-semibold text-foreground">not</span> track your location continuously throughout the day, during off-duty hours, weekends, or leaves.
                  </li>
                  <li>
                    <strong className="text-foreground">Geofence Radius Validation:</strong> Coordinates are mathematically checked against your company&apos;s configured office coordinates and allowable radius (e.g., 100 meters).
                  </li>
                </ul>
              </section>

              <section id="how-we-use" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">5. How We Use Information</h2>
                </div>
                <p>We process collected information solely for valid business purposes:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-border/60 bg-slate-50 dark:bg-zinc-800/50 space-y-1">
                    <p className="font-semibold text-xs text-foreground">Shift & Attendance Records</p>
                    <p className="text-xs text-muted-foreground">Calculating working hours, overtime, and monthly attendance summaries for payroll.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-slate-50 dark:bg-zinc-800/50 space-y-1">
                    <p className="font-semibold text-xs text-foreground">Leave Lifecycle Management</p>
                    <p className="text-xs text-muted-foreground">Processing leave submissions, annual allocations, and manager approval workflows.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-slate-50 dark:bg-zinc-800/50 space-y-1">
                    <p className="font-semibold text-xs text-foreground">Security & Audit Logs</p>
                    <p className="text-xs text-muted-foreground">Maintaining tamper-proof audit trails for administrative accountability.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-slate-50 dark:bg-zinc-800/50 space-y-1">
                    <p className="font-semibold text-xs text-foreground">Platform Notifications</p>
                    <p className="text-xs text-muted-foreground">Alerting users regarding shift schedules, punch confirmations, and leave decisions.</p>
                  </div>
                </div>
              </section>

              <section id="data-sharing" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <Eye className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">6. Data Sharing & Disclosure</h2>
                </div>
                <p>
                  Your information is treated with strict confidentiality. We do not sell your personal data. We share information only under the following circumstances:
                </p>
                <ul className="space-y-2 list-disc list-inside pl-1 text-foreground/80">
                  <li>
                    <strong className="text-foreground">With Your Employer:</strong> Authorized HR personnel and managers have access to attendance and leave reports as part of normal workplace administration.
                  </li>
                  <li>
                    <strong className="text-foreground">Trusted Infrastructure Providers:</strong> Highly certified cloud services (such as AWS, MongoDB Atlas, and Clerk Authentication) governed by stringent data processing agreements (DPA).
                  </li>
                  <li>
                    <strong className="text-foreground">Legal Compliance:</strong> When compelled by valid legal processes, court orders, or governmental regulations.
                  </li>
                </ul>
              </section>

              <section id="data-security" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <Lock className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">7. Security & Encryption</h2>
                </div>
                <p>
                  We implement enterprise-grade defensive measures to protect your information:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 text-center space-y-1">
                    <p className="font-bold text-xs text-[#f65340]">TLS 1.3 Encryption</p>
                    <p className="text-[11px] text-muted-foreground">All data in transit is encrypted using modern SSL/TLS protocols.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 text-center space-y-1">
                    <p className="font-bold text-xs text-[#f65340]">AES-256 at Rest</p>
                    <p className="text-[11px] text-muted-foreground">Database records and file stores are encrypted with industry-standard AES-256.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 text-center space-y-1">
                    <p className="font-bold text-xs text-[#f65340]">Role-Based Access</p>
                    <p className="text-[11px] text-muted-foreground">Strict permission gates isolate sensitive workforce credentials.</p>
                  </div>
                </div>
              </section>

              <section id="retention-deletion" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <Database className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">8. Data Retention & Deletion</h2>
                </div>
                <p>
                  We retain personal data for the duration of the employer&apos;s active subscription with trueHR, or as required by applicable statutory labor and employment laws.
                </p>
                <p>
                  When an employee departs the organization, or upon written request from the employer, personal data and facial reference hashes are permanently purged or anonymized from active operational databases in accordance with our data retention schedule.
                </p>
              </section>

              {/* 9. Employee Rights */}
              <section id="employee-rights" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">9. Your Rights & Choices</h2>
                </div>
                <p>Subject to local labor regulations and jurisdiction, you have the right to:</p>
                <ul className="space-y-1.5 list-disc list-inside pl-1 text-foreground/80">
                  <li>Review and request a copy of your attendance records and leave logs.</li>
                  <li>Request correction of inaccurate personal profile data through your organization&apos;s HR portal.</li>
                  <li>Revoke camera or location permissions in device settings (note: camera and location are required to verify biometric attendance punches).</li>
                  <li>Submit inquiries regarding data handling directly to your company administrator or our privacy team.</li>
                </ul>
              </section>

              {/* 10. Contact Us */}
              <section id="contact-us" className="space-y-4 scroll-mt-24 border-t border-border/40 pt-8">
                <div className="flex items-center gap-2.5 text-[#f65340]">
                  <Mail className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">10. Contact Us</h2>
                </div>
                <p>
                  If you have questions, feedback, or concerns regarding this Privacy Policy, or if you wish to exercise your data rights, please contact our Data Protection Officer:
                </p>
                <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1 text-xs">
                  <p className="font-bold text-foreground">trueHR Data Protection & Privacy Team</p>
                  <p className="text-muted-foreground">Email: <a href="mailto:privacy@truehr.app" className="text-[#f65340] hover:underline font-medium">privacy@truehr.app</a></p>
                  <p className="text-muted-foreground">Support: <a href="mailto:support@truehr.app" className="text-[#f65340] hover:underline font-medium">support@truehr.app</a></p>
                  <p className="text-muted-foreground">Website: <a href="https://truehr.magicscale.in" className="text-[#f65340] hover:underline font-medium">https://truehr.magicscale.in</a></p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 bg-white dark:bg-zinc-900/60 py-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#f65340]">true<span className="text-foreground">HR</span></span>
            <span>© {new Date().getFullYear()} trueHR Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors font-semibold text-foreground">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
