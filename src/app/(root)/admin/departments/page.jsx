"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Plus,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployees } from "@/store/hooks/useEmployee";
import Link from "next/link";

export default function AdminDepartmentsPage() {
  const { employees, isLoading } = useEmployees({ status: "all" });
  const [searchQuery, setSearchQuery] = useState("");

  const departmentsList = [
    {
      name: "Engineering",
      code: "ENG",
      lead: "Ajit Kushwaha",
      leadRole: "Lead Architect",
      budget: "$120,000",
      description: "Software engineering, core infrastructure, and biometric AI security.",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      name: "Product Design",
      code: "PRD",
      lead: "Rohit Sharma",
      leadRole: "Design Director",
      budget: "$85,000",
      description: "UI/UX design, customer research, and brand design guidelines.",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      name: "Operations",
      code: "OPS",
      lead: "Priya Patel",
      leadRole: "VP Operations",
      budget: "$95,000",
      description: "Daily office operations, vendor management, and internal workflows.",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      name: "Marketing & Growth",
      code: "MKT",
      lead: "Ananya Roy",
      leadRole: "Head of Growth",
      budget: "$70,000",
      description: "Brand campaigns, search engine optimization, and enterprise acquisition.",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      name: "Human Resources",
      code: "HR",
      lead: "Sneha Verma",
      leadRole: "People & Culture Lead",
      budget: "$55,000",
      description: "Talent acquisition, payroll management, and employee experience.",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      name: "Finance & Accounts",
      code: "FIN",
      lead: "Vikram Malhotra",
      leadRole: "Finance Controller",
      budget: "$60,000",
      description: "Company taxation, fiscal audits, and accounting reconciliations.",
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    },
  ];

  const filteredDepts = departmentsList.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Department Structure & Units
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <Layers className="w-3 h-3" /> {departmentsList.length} Departments
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage company departments, organizational reporting lines, and division rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/employees">
            <Button size="sm" className="h-8.5 px-3 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs">
              <Users className="w-3.5 h-3.5 mr-1.5" /> View All Employees
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border p-3 rounded-xl shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search departments or leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          // Count employees in this department
          const empCount =
            employees?.filter((e) =>
              e.department?.toLowerCase()?.includes(dept.name.toLowerCase().split(" ")[0])
            )?.length || 0;

          return (
            <div
              key={dept.code}
              className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{dept.name}</h3>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-0.5 ${dept.color}`}>
                        {dept.code}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-foreground">
                    {empCount} {empCount === 1 ? "Member" : "Members"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {dept.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground">Department Lead</p>
                  <p className="font-semibold text-foreground">{dept.lead}</p>
                </div>
                <Link
                  href={`/admin/employees?department=${dept.name}`}
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1 text-[11px]"
                >
                  View Team <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
