"use client";

import { BarChart3, Download, TrendingUp, Users, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const reportsList = [
    { title: "Monthly Attendance & Punctuality Report", type: "PDF / CSV", size: "2.4 MB", generatedAt: "Oct 20, 2026", desc: "Detailed breakdown of employee punch times, late arrivals, and total working hours." },
    { title: "Biometric Identity & AWS Verification Log", type: "CSV", size: "1.8 MB", generatedAt: "Oct 20, 2026", desc: "Audit logs of face match confidence scores, camera live selfies, and geofence GPS flags." },
    { title: "Department Headcount & Attrition Overview", type: "PDF", size: "1.1 MB", generatedAt: "Oct 15, 2026", desc: "Organizational structure, new joiners onboarding status, and department rosters." },
    { title: "Quarterly Payroll & Compensation Summary", type: "XLSX", size: "3.2 MB", generatedAt: "Oct 01, 2026", desc: "Gross salaries, statutory tax deductions, reimbursement claims, and net disbursements." },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Executive Reports & Workforce Analytics
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <BarChart3 className="w-3 h-3" /> Live Exports
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Download organizational compliance records, biometric security audits, and financial summaries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rpt) => (
          <div key={rpt.title} className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm text-foreground">{rpt.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                  {rpt.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{rpt.desc}</p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">Generated {rpt.generatedAt} • {rpt.size}</span>
              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
