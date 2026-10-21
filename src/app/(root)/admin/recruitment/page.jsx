"use client";

import { UserPlus, Briefcase, Users, CheckCircle2, Clock, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminRecruitmentPage() {
  const jobs = [
    { title: "Senior Backend Engineer", dept: "Engineering", type: "Full-Time", applicants: 42, interviews: 8, status: "Active" },
    { title: "Product Designer (UI/UX)", dept: "Design", type: "Full-Time", applicants: 28, interviews: 5, status: "Active" },
    { title: "DevOps & Cloud Engineer", dept: "Engineering", type: "Full-Time", applicants: 19, interviews: 4, status: "Active" },
    { title: "Growth Marketing Specialist", dept: "Marketing", type: "Full-Time", applicants: 35, interviews: 6, status: "Interviewing" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Recruitment & Candidate Pipeline
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <UserPlus className="w-3 h-3" /> 4 Active Openings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage open requisitions, review incoming applicants, and schedule interview stages.
          </p>
        </div>

        <Button size="sm" className="h-8.5 px-3 rounded-lg text-xs font-semibold shadow-2xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Active Openings</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">4</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Across 3 departments</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Candidates</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">124</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Applications received</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">In Interview Stages</p>
          <p className="text-2xl font-bold tracking-tight text-primary mt-1">23</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Technical & culture rounds</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Offers Extended</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">2</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Pending acceptance</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Active Job Postings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Position</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Applicants</th>
                <th className="p-3.5">Shortlisted</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {jobs.map((job) => (
                <tr key={job.title} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 pl-4 font-semibold text-foreground">{job.title}</td>
                  <td className="p-3.5 text-muted-foreground">{job.dept}</td>
                  <td className="p-3.5 text-muted-foreground">{job.type}</td>
                  <td className="p-3.5 font-bold text-foreground">{job.applicants}</td>
                  <td className="p-3.5 font-medium text-primary">{job.interviews}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {job.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:underline">
                      View Pipeline
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
