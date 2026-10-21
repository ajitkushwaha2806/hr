"use client";

import { TrendingUp, Target, Award, Star, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPerformancePage() {
  const reviews = [
    { name: "Ajit Kushwaha", role: "Lead Architect", dept: "Engineering", score: "4.9 / 5.0", goals: "5/5 Met", status: "Exceptional" },
    { name: "Rohit Sharma", role: "Design Director", dept: "Product Design", score: "4.7 / 5.0", goals: "4/4 Met", status: "Exceeds Expectations" },
    { name: "Priya Patel", role: "VP Operations", dept: "Operations", score: "4.8 / 5.0", goals: "6/6 Met", status: "Exceptional" },
    { name: "Ananya Roy", role: "Head of Growth", dept: "Marketing", score: "4.5 / 5.0", goals: "3/4 Met", status: "Meets Expectations" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Performance & OKR Reviews
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <TrendingUp className="w-3 h-3" /> Q4 2026 Cycle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Quarterly appraisals, KPI evaluations, and key result tracking across divisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Average Rating</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">4.72 / 5</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">▲ +0.3 vs last quarter</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Completed Reviews</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">92%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">34 of 37 appraisals</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">OKRs On Track</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">88%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Milestones achieved</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Top Performers</p>
          <p className="text-2xl font-bold tracking-tight text-primary mt-1">12</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Eligible for promotion</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Quarterly Appraisal Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Employee</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Performance Score</th>
                <th className="p-3.5">Key Goals</th>
                <th className="p-3.5">Appraisal Tier</th>
                <th className="p-3.5 pr-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {reviews.map((rev) => (
                <tr key={rev.name} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 pl-4">
                    <p className="font-semibold text-foreground">{rev.name}</p>
                    <p className="text-[11px] text-muted-foreground">{rev.role}</p>
                  </td>
                  <td className="p-3.5 text-muted-foreground">{rev.dept}</td>
                  <td className="p-3.5 font-bold text-foreground">{rev.score}</td>
                  <td className="p-3.5 text-muted-foreground">{rev.goals}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Star className="w-3 h-3" /> {rev.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:underline">
                      View Appraisal
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
