"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/store/hooks/useEmployee";
import { AttendanceService } from "@/services/frontend/attendance";
import OfficeLocationModal from "@/components/pages/admin/modals/office-location-modal";
import {
  Users,
  Clock,
  ShieldCheck,
  MapPin,
  CalendarDays,
  ArrowRight,
  Sparkles,
  Building2,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { employees, isLoading: isEmpLoading, refetch: refetchEmployees } = useEmployees({ status: "all" });
  const [logs, setLogs] = useState([]);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingLogs(true);
      const [logsRes, locRes] = await Promise.all([
        AttendanceService.getAdminAttendanceLogs({ limit: 10 }),
        AttendanceService.getOfficeLocation(),
      ]);
      if (logsRes?.success) {
        setLogs(logsRes.data || []);
      }
      if (locRes?.success) {
        setOfficeLocation(locRes.data || null);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter((e) => e.status === "ACTIVE")?.length || totalEmployees;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPunches = logs.filter((l) => l.date === todayStr);
  const presentCount = new Set(
    todayPunches.map((l) => (typeof l.employeeId === "object" ? l.employeeId?._id : l.employeeId))
  ).size;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 m-2 sm:m-3 rounded-2xl border border-border/40 shadow-xs">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Admin Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live workforce & biometric overview
          </p>
        </div>

        {/* Action Buttons: 2-col on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchDashboardData();
              refetchEmployees?.();
            }}
            className="h-9 px-3 rounded-xl border-border text-xs font-semibold cursor-pointer shadow-2xs hover:bg-accent active:scale-95 transition-transform flex items-center justify-center"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoadingLogs ? "animate-spin text-primary" : ""}`} />
            <span>Sync</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="h-9 px-3 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95 transition-transform flex items-center justify-center"
          >
            <Sliders className="size-3.5 mr-1.5" />
            <span>Geofence</span>
          </Button>
        </div>
      </div>

      {/* 4 Quick Stat Cards: perfectly responsive on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Employees */}
        <Link
          href="/admin/employees"
          className="p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Employees</span>
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isEmpLoading ? "..." : totalEmployees}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
            <span>{activeEmployees} active</span>
            <span className="text-primary font-semibold flex items-center gap-0.5 text-[11px]">
              View <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Card 2: Present Today */}
        <Link
          href="/admin/attendance"
          className="p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Present</span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {isLoadingLogs ? "..." : presentCount}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
            <span>Verified</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 text-[11px]">
              Logs <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Card 3: Biometric Engine */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Biometrics</span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              100%
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
            <span className="truncate">Rekognition</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Active</span>
          </div>
        </div>

        {/* Card 4: Office Geofence */}
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Geofence</span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <MapPin className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {officeLocation?.radiusMeters || 200}m
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
            <span className="truncate max-w-[80px]">{officeLocation?.officeName || "Office"}</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5 text-[11px]">
              Edit <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </button>
      </div>

      {/* Main Content Grid: Biometric Punches + Quick App Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Punches Feed */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border/70 rounded-xl shadow-2xs p-3.5 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <h2 className="font-bold text-xs sm:text-sm text-foreground">
                  Recent Biometric Punches
                </h2>
              </div>
              <Link
                href="/admin/attendance"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {isLoadingLogs ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                <RefreshCw className="size-5 mx-auto mb-2 animate-spin text-primary" />
                Loading biometric punches...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No attendance punches recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border/50 mt-1">
                {logs.slice(0, 6).map((punch) => {
                  const emp = punch.employeeId || {};
                  const empName =
                    emp.name ||
                    `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                    emp.email ||
                    "Employee";
                  const punchTime = punch.checkIn?.time
                    ? new Date(punch.checkIn.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--";
                  const confidence = punch.checkIn?.faceMatchConfidence
                    ? Math.round(punch.checkIn.faceMatchConfidence)
                    : 100;
                  const distance =
                    punch.checkIn?.distanceMeters != null
                      ? Math.round(punch.checkIn.distanceMeters)
                      : 0;

                  return (
                    <div
                      key={punch._id}
                      className="py-2.5 sm:py-3 flex items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {punch.checkIn?.selfieUrl ? (
                          <img
                            src={punch.checkIn.selfieUrl}
                            alt={empName}
                            className="size-8 sm:size-9 rounded-full object-cover border border-border shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="size-8 sm:size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {empName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate text-xs sm:text-sm">
                            {empName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {emp.department || "Staff"} • {distance}m
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          {punchTime}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                          <ShieldCheck className="size-3" />
                          <span>{confidence}%</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Administrative Quick Action Tiles (App style) */}
        <div>
          <div className="bg-card border border-border/70 rounded-xl shadow-2xs p-3.5 sm:p-5">
            <h2 className="font-bold text-xs sm:text-sm text-foreground mb-3 flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              Quick Navigation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              <Link
                href="/admin/employees"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border/60 hover:bg-muted/40 active:bg-muted/70 active:scale-[0.99] transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">Employees</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">Directory & onboard</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/admin/attendance"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border/60 hover:bg-muted/40 active:bg-muted/70 active:scale-[0.99] transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">Attendance</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">Audit punch logs</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/admin/leaves"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border/60 hover:bg-muted/40 active:bg-muted/70 active:scale-[0.99] transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <CalendarDays className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">Leaves</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">Requests & approvals</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/admin/departments"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border/60 hover:bg-muted/40 active:bg-muted/70 active:scale-[0.99] transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">Departments</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">Teams & roles</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Geofence Configuration Modal */}
      <OfficeLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={officeLocation}
        onSaved={(newLoc) => setOfficeLocation(newLoc)}
      />
    </div>
  );
}
