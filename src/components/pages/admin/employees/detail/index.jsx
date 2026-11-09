"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Asset } from "@/components/common/Asset";
import { EmployeeStatusBadge, DepartmentBadge, EmploymentTypeBadge, TeamLeadBadge } from "../helpers/badges";
import { EmployeeFormSheet } from "../fragments";
import { useEmployeeDetail } from "@/store/hooks/useEmployee";
import {
  AttendanceSummaryCards,
  MonthFilterBar,
  AttendanceCalendar,
  EmployeeProfileTab,
  AttendanceLogTable,
  SendEmailModal,
} from "./fragments";

export default function EmployeeDetailView({ employeeId }) {
  const router = useRouter();

  // Active view tab: "attendance" | "profile"
  const [activeTab, setActiveTab] = useState("attendance");

  // Date selection for attendance
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  // Edit sheet modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Hook fetching both employee profile and monthly attendance
  const {
    employee,
    isLoadingEmployee,
    employeeError,
    refetchEmployee,

    attendance,
    isLoadingAttendance,
    isFetchingAttendance,
    refetchAttendance,

    updateEmployee,
    isUpdatingEmployee,
  } = useEmployeeDetail(employeeId, { year, month });

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleJumpToCurrent = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  const handleSaveEmployee = async (formData) => {
    try {
      await updateEmployee(formData);
      setIsEditOpen(false);
      refetchEmployee();
    } catch {
      // Error handled by hook notifications
    }
  };

  // Loading skeleton
  if (isLoadingEmployee) {
    return (
      <div className="flex flex-col m-2 sm:m-4 space-y-6 min-w-0 pb-24 sm:pb-8 animate-pulse">
        <div className="h-8 w-40 bg-muted/60 rounded-lg" />
        <div className="h-44 bg-card rounded-2xl border border-border/60 p-6" />
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-xl border border-border/60" />
          ))}
        </div>
      </div>
    );
  }

  // Not found
  if (employeeError || !employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 m-4 bg-card rounded-2xl border border-border/60 text-center space-y-4">
        <div className="size-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
          <AlertCircle className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Employee Record Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1">
            The employee ID specified does not exist in your organization.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/employees")}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="size-4" />
          Back to Employee Directory
        </Button>
      </div>
    );
  }

  const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name;

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-4 sm:space-y-5 min-w-0 pb-28 sm:pb-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/admin/employees"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-colors font-medium text-xs shadow-2xs shrink-0"
          >
            <ArrowLeft className="size-3.5" />
            <span>Employees</span>
          </Link>
          <span className="hidden sm:inline text-muted-foreground/40">/</span>
          <span className="hidden sm:inline font-semibold text-foreground truncate max-w-[200px] lg:max-w-none">
            {fullName}
          </span>
          <span className="hidden sm:inline font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
            {employee.employeeId}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-lg shadow-2xs flex-1 sm:flex-initial justify-center"
          >
            <Mail className="size-3.5" />
            <span>Send Email</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-lg shadow-2xs flex-1 sm:flex-initial justify-center"
          >
            <Edit className="size-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Hero Employee Profile Card */}
      <div className="bg-card border border-border/60 rounded-2xl p-3.5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
          {/* Avatar & Key Info */}
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="relative shrink-0">
              <Asset
                src={employee.avatar}
                name={fullName}
                className="size-16 sm:size-20 rounded-2xl border-2 border-border shadow-xs object-cover"
              />
              {employee.avatar && (
                <div
                  className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-card shadow-xs"
                  title="Biometric Face Enrolled"
                >
                  <ShieldCheck className="size-3" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-bold text-foreground tracking-tight truncate">
                  {fullName}
                </h1>
                <span className="font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/50 shrink-0">
                  {employee.employeeId}
                </span>
                <div className="shrink-0">
                  <EmployeeStatusBadge status={employee.status || "Active"} />
                </div>
                {(employee.isTeamLead || employee.role === "TEAM_LEAD") && (
                  <div className="shrink-0">
                    <TeamLeadBadge />
                  </div>
                )}
              </div>

              {/* Designation & Department Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
                <span className="font-semibold text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {employee.designation || "No Designation"}
                </span>
                <DepartmentBadge department={employee.department || "General"} />
                <EmploymentTypeBadge type={employee.employmentType || "Full-Time"} />
              </div>

              {/* Quick Contact & Joining info */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-muted-foreground pt-1">
                {employee.email && (
                  <a
                    href={`mailto:${employee.email}`}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 hover:bg-muted hover:text-foreground transition-colors max-w-full truncate"
                  >
                    <Mail className="size-3 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </a>
                )}
                {employee.phone && (
                  <a
                    href={`tel:${employee.phone}`}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 hover:bg-muted hover:text-foreground transition-colors shrink-0"
                  >
                    <Phone className="size-3 text-muted-foreground/70 shrink-0" />
                    <span>{employee.phone}</span>
                  </a>
                )}
                {employee.joiningDate && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 shrink-0">
                    <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                    <span>
                      Joined{" "}
                      {new Date(employee.joiningDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats on Right side of Hero */}
          <div className="grid grid-cols-2 md:flex items-center gap-2 sm:gap-3 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-5 shrink-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center min-w-[75px]">
              <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                Leaves / Mo
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground">
                {employee.monthlyCasualLeavesQuota || 4}d
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center min-w-[75px]">
              <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                NDA Status
              </span>
              <span
                className={`text-xs font-bold ${
                  employee.nda?.isSigned
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600"
                }`}
              >
                {employee.nda?.isSigned ? "Signed" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs Bar */}
        <div className="grid grid-cols-2 p-1 bg-muted/60 dark:bg-muted/30 rounded-xl border border-border/50">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "attendance"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Clock className="size-3.5 shrink-0" />
            <span className="sm:hidden">Attendance</span>
            <span className="hidden sm:inline">Monthly Attendance & Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <User className="size-3.5 shrink-0" />
            <span className="sm:hidden">Profile (A-Z)</span>
            <span className="hidden sm:inline">Complete Profile (A to Z Details)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === "attendance" ? (
        <div className="space-y-5">
          {/* Month Selector Filter Bar */}
          <MonthFilterBar
            year={year}
            month={month}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onJumpToCurrent={handleJumpToCurrent}
            onRefresh={refetchAttendance}
            isRefreshing={isFetchingAttendance}
          />

          {/* Month Attendance Summary Cards */}
          <AttendanceSummaryCards
            stats={attendance?.stats}
            isLoading={isLoadingAttendance}
          />

          {/* Month Interactive Calendar */}
          <AttendanceCalendar
            year={year}
            month={month}
            dailyBreakdown={attendance?.dailyBreakdown || []}
            isLoading={isLoadingAttendance}
          />

          {/* Detailed Attendance Punch Logs Table */}
          <AttendanceLogTable
            dailyBreakdown={attendance?.dailyBreakdown || []}
            isLoading={isLoadingAttendance}
          />
        </div>
      ) : (
        /* Complete Profile A to Z Tab */
        <EmployeeProfileTab employee={employee} />
      )}

      {/* Edit Employee Form Sheet */}
      <EmployeeFormSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        employee={employee}
        onSave={handleSaveEmployee}
        isLoading={isUpdatingEmployee}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        employee={employee}
      />
    </div>
  );
}
