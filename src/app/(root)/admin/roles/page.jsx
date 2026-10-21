"use client";

import { ShieldCheck, Users, Lock, Plus, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminRolesPage() {
  const roles = [
    { name: "Super Administrator", usersCount: 2, access: "Full Access", desc: "Unrestricted access across all company divisions, biometric overrides, payroll, and geofence calibration." },
    { name: "HR Manager", usersCount: 4, access: "HR & Attendance", desc: "Manage employee onboarding, leave approval queues, shifts, and attendance logs." },
    { name: "Department Lead", usersCount: 6, access: "Team Level", desc: "View team performance, review direct reports' leaves, and monitor shift punctuality." },
    { name: "Employee (Default)", usersCount: 35, access: "Self-Service", desc: "Access personal dashboard, live camera biometric check-in/out, leave requests, and personal profile." },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Roles & Access Permissions
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <ShieldCheck className="w-3 h-3" /> RBAC Security
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure role-based access control, division privileges, and administrative security rights.
          </p>
        </div>

        <Button size="sm" className="h-8.5 px-3 rounded-lg text-xs font-semibold shadow-2xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Custom Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.name} className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{role.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{role.access}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                  {role.usersCount} Assigned
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">{role.desc}</p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs mt-4">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> System Policy Active
              </span>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:underline">
                Edit Permissions
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
