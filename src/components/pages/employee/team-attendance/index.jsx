"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  XCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import DataTable from "@/components/global/table";
import { Asset } from "@/components/common/Asset";
import useNotification from "@/store/hooks/useNotification";
import { AttendanceService } from "@/services/frontend/attendance";
import {
  filterAttendanceLogs,
  getTodayDateString,
  shiftDateByDays,
  resolveEmployeeName,
  formatPunchTime,
  formatDuration,
  formatDistance,
  formatConfidence,
} from "@/components/pages/admin/attendance/helpers";
import { SelfiePreviewModal } from "@/components/pages/admin/attendance/fragments";

export default function TeamAttendanceView() {
  const notify = useNotification();

  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSelfieData, setSelectedSelfieData] = useState(null);

  const isToday = selectedDate === getTodayDateString();

  const fetchTeamAttendanceLogs = useCallback(
    async (dateToFetch, showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        const res = await AttendanceService.getTeamAttendanceLogs({
          date: dateToFetch,
          limit: 100,
        });

        if (res?.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        notify.error(err?.message || "Failed to load team attendance logs");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      try {
        const res = await AttendanceService.getTeamAttendanceLogs({
          date: selectedDate,
          limit: 100,
        });
        if (!ignore && res?.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        if (!ignore) {
          notify.error(err?.message || "Failed to load team attendance logs");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => {
      ignore = true;
    };
  }, [selectedDate, notify]);

  const handleDateChange = (newDate) => {
    if (newDate) setSelectedDate(newDate);
  };

  const handlePrevDay = () => {
    setSelectedDate(shiftDateByDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(shiftDateByDays(selectedDate, 1));
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayDateString());
  };

  const filteredLogs = useMemo(
    () => filterAttendanceLogs(logs, searchQuery),
    [logs, searchQuery]
  );

  const columns = useMemo(
    () => [
      {
        key: "employee",
        header: "Team Member",
        sortable: true,
        render: (row) => {
          const emp = row.employeeId || {};
          const empName = resolveEmployeeName(emp);
          const email = emp.email || emp.department || "—";

          return (
            <div className="flex items-center gap-3 min-w-0 sm:min-w-[190px] max-w-full">
              <Asset
                src={emp.avatar}
                name={empName}
                className="size-8.5 rounded-full border border-border/60 shrink-0 shadow-2xs"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-xs text-foreground truncate block">
                  {empName}
                </span>
                <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                  {email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "date",
        header: "Date",
        sortable: true,
        render: (row) => (
          <span className="font-medium text-xs text-foreground whitespace-nowrap">
            {row.date || "--"}
          </span>
        ),
      },
      {
        key: "checkIn",
        header: "Check-In",
        sortable: true,
        render: (row) => {
          if (row.status === "ABSENT") {
            return (
              <span className="inline-flex items-center gap-1 font-semibold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 whitespace-nowrap">
                <XCircle className="size-3.5" /> Absent
              </span>
            );
          }

          const checkInTime = formatPunchTime(row.checkIn?.time);
          const selfie = row.checkIn?.selfieUrl;
          const emp = row.employeeId || {};
          const empName = resolveEmployeeName(emp);
          const distance = formatDistance(row.checkIn?.distanceMeters);
          const confidence = formatConfidence(row.checkIn?.faceMatchConfidence);

          if (row.checkIn?.status === "SUCCESS" || row.checkIn?.time) {
            return (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>{checkInTime}</span>
                </span>
                {selfie && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSelfieData({
                        type: "Check-In",
                        selfieUrl: selfie,
                        empName,
                        empEmail: emp.email,
                        punchTime: checkInTime,
                        distance,
                        confidence,
                        date: row.date,
                      })
                    }
                    className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/60 hover:border-primary/40 bg-muted/30 hover:bg-primary/5 transition-all cursor-pointer group"
                    title="View Check-In Selfie"
                  >
                    <Image
                      src={selfie}
                      alt="Selfie"
                      width={18}
                      height={18}
                      unoptimized
                      className="size-4.5 rounded object-cover"
                    />
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary font-medium hidden sm:inline">
                      Selfie
                    </span>
                  </button>
                )}
              </div>
            );
          }

          return (
            <span className="text-muted-foreground text-xs italic whitespace-nowrap">
              Pending
            </span>
          );
        },
      },
      {
        key: "checkOut",
        header: "Check-Out",
        sortable: true,
        render: (row) => {
          if (row.status === "ABSENT") {
            return (
              <span className="text-muted-foreground text-xs italic">—</span>
            );
          }

          const checkOutTime = formatPunchTime(row.checkOut?.time);
          const selfie = row.checkOut?.selfieUrl;
          const emp = row.employeeId || {};
          const empName = resolveEmployeeName(emp);
          const distance = formatDistance(row.checkOut?.distanceMeters);
          const confidence = formatConfidence(row.checkOut?.faceMatchConfidence);

          if (row.checkOut?.status === "SUCCESS" || row.checkOut?.time) {
            return (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 font-semibold text-xs text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>{checkOutTime}</span>
                </span>
                {selfie && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSelfieData({
                        type: "Check-Out",
                        selfieUrl: selfie,
                        empName,
                        empEmail: emp.email,
                        punchTime: checkOutTime,
                        distance,
                        confidence,
                        date: row.date,
                      })
                    }
                    className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/60 hover:border-primary/40 bg-muted/30 hover:bg-primary/5 transition-all cursor-pointer group"
                    title="View Check-Out Selfie"
                  >
                    <Image
                      src={selfie}
                      alt="Selfie"
                      width={18}
                      height={18}
                      unoptimized
                      className="size-4.5 rounded object-cover"
                    />
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary font-medium hidden sm:inline">
                      Selfie
                    </span>
                  </button>
                )}
              </div>
            );
          }

          return (
            <span className="text-muted-foreground text-xs italic whitespace-nowrap">
              In Progress
            </span>
          );
        },
      },
      {
        key: "duration",
        header: "Work Duration",
        sortable: true,
        render: (row) => {
          if (row.status === "ABSENT") {
            return <span className="text-muted-foreground text-xs italic">—</span>;
          }
          const duration = formatDuration(row.durationMinutes);
          return (
            <span className="font-semibold text-xs text-foreground whitespace-nowrap">
              {duration}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (row) => {
          if (row.status === "ABSENT") {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                Absent
              </span>
            );
          }
          if (row.checkIn && !row.checkOut) {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                Clocked In
              </span>
            );
          }
          if (row.durationMinutes && row.durationMinutes >= 480) {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                Full Day
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
              Half Day
            </span>
          );
        },
      },
    ],
    []
  );

  // Summary counts
  const totalLogs = logs.length;
  const presentCount = logs.filter((l) => l.status !== "ABSENT" && l.checkIn).length;
  const absentCount = logs.filter((l) => l.status === "ABSENT").length;
  const onDutyCount = logs.filter((l) => l.checkIn && !l.checkOut).length;

  return (
    <div className="space-y-5 pb-28 sm:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-6 text-primary" />
              Team Attendance Logs
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              TL Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor daily check-in times, work hours, and verification selfies for your assigned direct reports.
          </p>
        </div>

        {/* Date Filter & Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1 bg-card border border-border/60 rounded-lg p-1 shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handlePrevDay}
              title="Previous Day"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              className="h-8 border-none shadow-none font-semibold text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleNextDay}
              title="Next Day"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetToday}
              className="h-9 text-xs font-semibold"
            >
              Today
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchTeamAttendanceLogs(selectedDate)}
            disabled={isLoading}
            className="size-9 shrink-0"
            title="Refresh logs"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
              Team Total
            </span>
            <span className="text-xl font-bold text-foreground leading-tight">
              {totalLogs}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
              Present Today
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
              {presentCount}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
            <XCircle className="size-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
              Absent
            </span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 leading-tight">
              {absentCount}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Clock className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
              Currently Clocked In
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 leading-tight">
              {onDutyCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-card border border-border/60 rounded-xl p-4 shadow-2xs">
        <DataTable
          columns={columns}
          data={filteredLogs}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search team member by name or email..."
          emptyTitle="No attendance logs found"
          emptyDescription={`No attendance records found for your team on ${selectedDate}.`}
        />
      </div>

      {/* Selfie Preview Modal */}
      {selectedSelfieData && (
        <SelfiePreviewModal
          data={selectedSelfieData}
          onClose={() => setSelectedSelfieData(null)}
        />
      )}
    </div>
  );
}
