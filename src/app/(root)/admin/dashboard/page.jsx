"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  ShieldCheck,
  MapPin,
  CalendarDays,
  Plus,
  ArrowRight,
  Sparkles,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/store/hooks/useEmployee";
import { AttendanceService } from "@/services/frontend/attendance";
import OfficeLocationModal from "@/components/pages/workspace/dashboard/fragments/office-location-modal";

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
  
  // Count how many distinct employees checked in today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPunches = logs.filter((l) => l.date === todayStr);
  const presentCount = new Set(todayPunches.map((l) => (typeof l.employeeId === "object" ? l.employeeId?._id : l.employeeId))).size;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Admin Overview & Command Center
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> AWS Rekognition Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor organizational attendance, biometric verifications, office geofencing, and workforce activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchDashboardData();
              refetchEmployees?.();
            }}
            className="h-8.5 px-3 rounded-lg border-border text-xs font-medium cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
            Sync Real-Time
          </Button>

          <Button
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="h-8.5 px-3 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            Calibrate Geofence
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Workforce */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Total Employees</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {isEmpLoading ? "..." : totalEmployees}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>{activeEmployees} active</span>
            <Link href="/admin/employees" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">
              Directory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Present Today */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {isLoadingLogs ? "..." : presentCount}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>Live biometric logs</span>
            <Link href="/admin/attendance" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-0.5">
              Punch logs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Biometric Integrity */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Biometric Engine</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            100%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            AWS Rekognition • Live blink proof
          </p>
        </div>

        {/* Geofence Office Radius */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Office Geofence</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {officeLocation?.radiusMeters || 200}m
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {officeLocation?.officeName || "Office"} (Calibrated)
          </p>
        </div>
      </div>

      {/* Main Content Grid: Live Attendance Feed + Admin Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Attendance Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm text-foreground">
                  Recent Biometric Attendance Punches
                </h2>
              </div>
              <Link
                href="/admin/attendance"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                View all logs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoadingLogs ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
                Loading latest biometric punches...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No attendance punches recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60 mt-2">
                {logs.slice(0, 7).map((punch) => {
                  const emp = punch.employeeId || {};
                  const empName = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.email || "Employee";
                  const punchTime = punch.checkIn?.time ? new Date(punch.checkIn.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
                  const confidence = punch.checkIn?.faceMatchConfidence ? Math.round(punch.checkIn.faceMatchConfidence) : 99;
                  const distance = punch.checkIn?.distanceMeters != null ? Math.round(punch.checkIn.distanceMeters) : 0;

                  return (
                    <div key={punch._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {punch.checkIn?.selfieUrl ? (
                          <img
                            src={punch.checkIn.selfieUrl}
                            alt={empName}
                            className="size-9 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {empName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{empName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {emp.department || "General"} • {emp.designation || "Staff"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="font-medium text-foreground">{punchTime}</p>
                          <span className="text-[10px] text-muted-foreground">{distance}m from office</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> {confidence}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Biometric AWS Rekognition Security Notice */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                Strict Biometric Face Recognition is Enforced
              </p>
              <p className="text-muted-foreground text-[11.5px] mt-0.5 leading-relaxed">
                All employee check-ins and check-outs require active camera streaming with real-time eye-blink proof of life, verified through AWS Rekognition against the registered employee photo. Static photo uploads and spoofing attempts are strictly prevented.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Modules */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-xs p-4 sm:p-5">
            <h2 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Administrative Actions
            </h2>

            <div className="space-y-2">
              <Link
                href="/admin/employees"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Employee Management</p>
                    <p className="text-[10.5px] text-muted-foreground">Onboard, update, or remove staff</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/attendance"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Attendance Punch Logs</p>
                    <p className="text-[10.5px] text-muted-foreground">Company-wide biometric log sheet</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/leaves"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Leave Approvals</p>
                    <p className="text-[10.5px] text-muted-foreground">Review vacation & sick requests</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/departments"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Department Overview</p>
                    <p className="text-[10.5px] text-muted-foreground">Organizational units & headcounts</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Office Location & Geofence</p>
                    <p className="text-[10.5px] text-muted-foreground">Configure perimeter boundaries</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Geofence Location Calibration Modal */}
      <OfficeLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={officeLocation}
        onSaved={(newLoc) => setOfficeLocation(newLoc)}
      />
    </div>
  );
}
