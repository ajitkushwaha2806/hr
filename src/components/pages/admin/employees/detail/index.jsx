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
  ChevronDown,
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

export default function EmployeeDetailView({
  employeeId,
  backUrl = "/admin/employees",
  backLabel = "Employees",
  allowEdit = true,
  isTeamLead = false,
}) {
  const router = useRouter();

  // Active view tab: "attendance" | "profile"
  const [activeTab, setActiveTab] = useState("attendance");
  const [showMoreDetails, setShowMoreDetails] = useState(false);

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

  // Date calculation for past month and current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const pastDate = new Date(currentYear, currentMonth - 2, 1);
  const pastYear = pastDate.getFullYear();
  const pastMonth = pastDate.getMonth() + 1;

  // Month navigation handlers strictly restricted to past month and current month
  const handlePrevMonth = () => {
    setYear(pastYear);
    setMonth(pastMonth);
  };

  const handleNextMonth = () => {
    setYear(currentYear);
    setMonth(currentMonth);
  };

  const handleJumpToCurrent = () => {
    setYear(currentYear);
    setMonth(currentMonth);
  };

  const handleYearChange = (newYear) => {
    if (newYear === pastYear) {
      setYear(pastYear);
      setMonth(pastMonth);
    } else {
      setYear(currentYear);
      setMonth(currentMonth);
    }
  };

  const handleMonthChange = (newMonth) => {
    if (newMonth === pastMonth) {
      setYear(pastYear);
      setMonth(pastMonth);
    } else {
      setYear(currentYear);
      setMonth(currentMonth);
    }
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
        <div className="h-8 w-40 bg-muted/60 rounded-md" />
        <div className="h-44 bg-card rounded-md border border-border/60 p-6" />
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-md border border-border/60" />
          ))}
        </div>
      </div>
    );
  }

  // Not found
  if (employeeError || !employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 m-4 bg-card rounded-md border border-border/60 text-center space-y-4">
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
          onClick={() => router.push(backUrl)}
          className="gap-2 text-xs rounded-md"
        >
          <ArrowLeft className="size-4" />
          Back to {backLabel}
        </Button>
      </div>
    );
  }

  const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name;

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-3 sm:space-y-4 min-w-0 pb-28 sm:pb-8">
      {/* Top Navigation & Action Buttons: Compact single line on mobile */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors font-medium text-xs shadow-2xs shrink-0"
          >
            <ArrowLeft className="size-3.5" />
            <span>{backLabel}</span>
          </Link>
          <span className="hidden sm:inline text-muted-foreground/40">/</span>
          <span className="hidden sm:inline font-semibold text-foreground truncate max-w-[200px] lg:max-w-none">
            {fullName}
          </span>
          <span className="hidden sm:inline font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
            {employee.employeeId}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-md shadow-2xs px-2.5"
            title="Send Email to Employee"
          >
            <Mail className="size-3.5" />
            <span className="hidden sm:inline">Send Email</span>
          </Button>

          {allowEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="h-8 text-xs gap-1.5 rounded-md shadow-2xs px-2.5"
              title="Edit Profile"
            >
              <Edit className="size-3.5" />
              <span className="hidden sm:inline">Edit Profile</span>
            </Button>
          )}
        </div>
      </div>

      {/* Hero Employee Profile Card */}
      <div className="bg-card border border-border/60 rounded-md p-3 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-5">
          {/* Avatar & Key Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Asset
                src={employee.avatar}
                name={fullName}
                className="size-14 sm:size-16 rounded-md border-2 border-border shadow-xs object-cover"
              />
              {employee.avatar && (
                <div
                  className="absolute -bottom-1 -right-1 size-4 sm:size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-card shadow-xs"
                  title="Biometric Face Enrolled"
                >
                  <ShieldCheck className="size-2.5 sm:size-3" />
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              {/* Row 1: Name, ID, Status & TL Badge */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                  {fullName}
                </h1>
                <span className="font-mono text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground border border-border/50 shrink-0">
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

              {/* Row 2: Designation & Department */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="font-semibold text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded-md truncate max-w-[170px] sm:max-w-none">
                  {employee.designation || "No Designation"}
                </span>
                <DepartmentBadge department={employee.department || "General"} />
              </div>

              {/* Row 3: Compact Contact Strip & View More Toggle */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-0.5">
                {employee.email && (
                  <span className="inline-flex items-center gap-1 text-[11px] truncate max-w-[180px] sm:max-w-none text-muted-foreground">
                    <Mail className="size-3 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </span>
                )}
                {/* View more toggle */}
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer select-none"
                >
                  <span>{showMoreDetails ? "view less" : "view more..."}</span>
                  <ChevronDown className={`size-3 transition-transform duration-200 ${showMoreDetails ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats on Right side (Desktop view) */}
          {!isTeamLead && (
            <div className="hidden md:flex items-center gap-2.5 sm:gap-3 border-l border-border/60 pl-4 shrink-0">
              <div className="p-2 sm:p-2.5 rounded-md bg-muted/30 border border-border/40 text-center min-w-[75px]">
                <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                  Leaves / Mo
                </span>
                <span className="text-sm sm:text-base font-bold text-foreground">
                  {employee.monthlyCasualLeavesQuota || 4}d
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-md bg-muted/30 border border-border/40 text-center min-w-[75px]">
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
          )}
        </div>

        {/* Expandable View More Details (Phone, Joining Date, Employment Type, and Mobile Quick Stats) */}
        {showMoreDetails && (
          <div className="pt-2.5 border-t border-border/50 space-y-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {employee.phone && (
                <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30 border border-border/40 min-w-0">
                  <Phone className="size-3 text-muted-foreground/70 shrink-0" />
                  <span className="text-muted-foreground text-[11px] shrink-0">Phone:</span>
                  <a href={`tel:${employee.phone}`} className="font-medium text-foreground hover:underline truncate">
                    {employee.phone}
                  </a>
                </div>
              )}
              {employee.joiningDate && (
                <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30 border border-border/40 min-w-0">
                  <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                  <span className="text-muted-foreground text-[11px] shrink-0">Joined:</span>
                  <span className="font-medium text-foreground truncate">
                    {new Date(employee.joiningDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30 border border-border/40 min-w-0">
                <span className="text-muted-foreground text-[11px] shrink-0">Type:</span>
                <EmploymentTypeBadge type={employee.employmentType || "Full-Time"} />
              </div>
            </div>

            {/* Mobile-only Quick Stats (Leaves / NDA) revealed inside View More on small screens */}
            {!isTeamLead && (
              <div className="grid grid-cols-2 gap-2 md:hidden">
                <div className="p-2 rounded-md bg-muted/30 border border-border/40 text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                    Leaves / Mo
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {employee.monthlyCasualLeavesQuota || 4}d
                  </span>
                </div>
                <div className="p-2 rounded-md bg-muted/30 border border-border/40 text-center">
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
            )}
          </div>
        )}

        {/* View Switcher Tabs Bar (Hidden for Team Leads - only attendance is shown) */}
        {!isTeamLead && (
          <div className="grid grid-cols-2 p-1 bg-muted/60 dark:bg-muted/30 rounded-md border border-border/50">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`py-2 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
              className={`py-2 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
        )}
      </div>

      {/* Main Content Area based on Tab */}
      {isTeamLead || activeTab === "attendance" ? (
        <div className="space-y-5">
          {/* Month Selector Filter Bar */}
          <MonthFilterBar
            year={year}
            month={month}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
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
            employeeId={employeeId}
            isTeamLead={isTeamLead}
            onStatusUpdated={refetchAttendance}
          />

          {/* Detailed Attendance Punch Logs Table */}
          <AttendanceLogTable
            dailyBreakdown={attendance?.dailyBreakdown || []}
            isLoading={isLoadingAttendance}
            employeeId={employeeId}
            isTeamLead={isTeamLead}
            onStatusUpdated={refetchAttendance}
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
