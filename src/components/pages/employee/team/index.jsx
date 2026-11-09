"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  X,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  CalendarDays,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Asset } from "@/components/common/Asset";
import {
  EmployeeStatusBadge,
  DepartmentBadge,
  TeamLeadBadge,
} from "@/components/pages/admin/employees/helpers/badges";
import { useEmployees } from "@/store/hooks/useEmployee";

const STATUS_FILTERS = [
  { label: "All Team", value: "all" },
  { label: "Active", value: "Active" },
  { label: "On Leave", value: "On Leave" },
  { label: "Probation", value: "Probation" },
];

export default function TeamDirectoryView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { employees, isLoading } = useEmployees({
    status: statusFilter,
    search: searchQuery,
  });

  // Client-side quick filter for instant responsive feedback
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase().trim();
    return employees.filter((emp) => {
      const name = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
      const email = (emp.email || "").toLowerCase();
      const code = (emp.employeeId || "").toLowerCase();
      const designation = (emp.designation || "").toLowerCase();
      const dept = (emp.department || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        code.includes(q) ||
        designation.includes(q) ||
        dept.includes(q)
      );
    });
  }, [employees, searchQuery]);

  // Metric counts
  const totalCount = employees?.length || 0;
  const activeCount = employees?.filter((e) => e.status === "Active")?.length || 0;
  const onLeaveCount = employees?.filter((e) => e.status === "On Leave")?.length || 0;

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-4 sm:space-y-5 min-w-0 pb-28 sm:pb-8">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-6 text-primary" />
              <span>My Team Members</span>
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {totalCount} {totalCount === 1 ? "Member" : "Members"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            View profiles, monthly attendance calendar, and verification logs for your assigned team members.
          </p>
        </div>

        {/* Shortcut to Team Attendance Logs */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/employee/attendance")}
            className="h-9 text-xs font-semibold gap-1.5 rounded-lg border-border/60 hover:bg-muted shadow-2xs w-full sm:w-auto justify-center"
          >
            <Clock className="size-3.5 text-primary" />
            <span>View Attendance Logs</span>
            <ArrowRight className="size-3 text-muted-foreground ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border/60 rounded-xl p-3 sm:p-4 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
          <div className="size-9 sm:size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="size-4.5 sm:size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate block">
              Total Team
            </span>
            <span className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
              {totalCount}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3 sm:p-4 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
          <div className="size-9 sm:size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <UserCheck className="size-4.5 sm:size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate block">
              Active
            </span>
            <span className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
              {activeCount}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3 sm:p-4 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
          <div className="size-9 sm:size-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
            <CalendarDays className="size-4.5 sm:size-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate block">
              On Leave
            </span>
            <span className="text-lg sm:text-2xl font-bold text-sky-600 dark:text-sky-400 leading-tight">
              {onLeaveCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Chips */}
      <div className="bg-card border border-border/60 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search team member by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9.5 pl-9 pr-9 text-xs sm:text-sm bg-muted/30 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 touch-pan-x">
          {STATUS_FILTERS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-4 shadow-2xs animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-muted/60 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-muted/60 rounded w-3/4" />
                  <div className="h-3 bg-muted/40 rounded w-1/2" />
                </div>
              </div>
              <div className="h-6 bg-muted/30 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEmployees.length === 0 && (
        <div className="bg-card border border-border/60 rounded-2xl p-8 sm:p-12 text-center shadow-2xs space-y-3">
          <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
            <Users className="size-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">
            {searchQuery ? "No matching team members found" : "No team members assigned"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No team members match "${searchQuery}". Try searching with a different name or ID.`
              : "You do not currently have any direct reports assigned under your leadership."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs"
            >
              Clear Search Query
            </Button>
          )}
        </div>
      )}

      {/* Team Member Cards Grid (Mobile App Style) */}
      {!isLoading && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEmployees.map((emp) => {
            const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name;
            const empId = emp._id || emp.id;

            return (
              <div
                key={empId}
                onClick={() => router.push(`/employee/team/${empId}`)}
                className="group relative bg-card hover:bg-muted/10 border border-border/60 hover:border-primary/40 rounded-2xl p-4 shadow-2xs transition-all duration-200 cursor-pointer active:scale-[0.985] flex flex-col justify-between space-y-3"
              >
                {/* Header: Avatar, Name, Role */}
                <div className="flex items-start gap-3 min-w-0">
                  <Asset
                    src={emp.avatar}
                    name={fullName}
                    className="size-13 rounded-full border-2 border-border/60 shrink-0 shadow-xs group-hover:border-primary/40 transition-colors"
                  />

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {fullName}
                      </h4>
                      {(emp.isTeamLead || emp.role === "TEAM_LEAD") && (
                        <TeamLeadBadge className="shrink-0 scale-90 origin-left" />
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                      {emp.designation || "Team Member"}
                    </span>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted/60 text-foreground border border-border/50">
                        {emp.employeeId}
                      </span>
                      <EmployeeStatusBadge status={emp.status || "Active"} />
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <ChevronRight className="size-5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>

                {/* Details Footer */}
                <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground gap-2">
                  <div className="flex items-center gap-1 truncate">
                    <DepartmentBadge department={emp.department || "General"} />
                  </div>

                  {/* Quick Contact & Action */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {emp.email && (
                      <a
                        href={`mailto:${emp.email}`}
                        title={`Email ${fullName}`}
                        className="size-7 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                      >
                        <Mail className="size-3.5" />
                      </a>
                    )}
                    {emp.phone && (
                      <a
                        href={`tel:${emp.phone}`}
                        title={`Call ${fullName}`}
                        className="size-7 rounded-lg bg-muted/40 hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center justify-center transition-colors"
                      >
                        <Phone className="size-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => router.push(`/employee/team/${empId}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold transition-colors ml-1"
                    >
                      <Calendar className="size-3" />
                      <span>Attendance</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
