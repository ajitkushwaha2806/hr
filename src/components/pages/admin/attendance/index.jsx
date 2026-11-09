"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  XCircle,
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
} from "./helpers";
import { SelfiePreviewModal } from "./fragments";

export default function AttendanceManagement() {
  const notify = useNotification();

  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSelfieData, setSelectedSelfieData] = useState(null);

  const isToday = selectedDate === getTodayDateString();

  const fetchAttendanceLogs = useCallback(
    async (dateToFetch, showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        const res = await AttendanceService.getAdminAttendanceLogs({
          date: dateToFetch,
          limit: 100,
        });

        if (res?.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        notify.error(err?.message || "Failed to load attendance logs");
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
        const res = await AttendanceService.getAdminAttendanceLogs({
          date: selectedDate,
          limit: 100,
        });
        if (!ignore && res?.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        if (!ignore) {
          notify.error(err?.message || "Failed to load attendance logs");
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
        header: "Employee",
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
                    <img
                      src={selfie}
                      alt="Selfie"
                      className="size-4.5 rounded object-cover"
                    />
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary font-medium">
                      Photo
                    </span>
                  </button>
                )}
              </div>
            );
          }

          return <span className="text-xs text-muted-foreground">--:--</span>;
        },
      },
      {
        key: "checkOut",
        header: "Check-Out",
        sortable: true,
        render: (row) => {
          if (row.status === "ABSENT") {
            return <span className="text-xs text-muted-foreground">--:--</span>;
          }

          const checkOutTime = formatPunchTime(row.checkOut?.time);
          const selfie = row.checkOut?.selfieUrl;
          const emp = row.employeeId || {};
          const empName = resolveEmployeeName(emp);
          const distance = formatDistance(row.checkOut?.distanceMeters);
          const confidence = formatConfidence(row.checkOut?.faceMatchConfidence);

          if (row.checkOut?.time) {
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
                    <img
                      src={selfie}
                      alt="Selfie"
                      className="size-4.5 rounded object-cover"
                    />
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary font-medium">
                      Photo
                    </span>
                  </button>
                )}
              </div>
            );
          }

          if (row.checkIn?.time) {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                <Clock className="size-3" /> In Progress
              </span>
            );
          }

          return <span className="text-xs text-muted-foreground">--:--</span>;
        },
      },
      {
        key: "duration",
        header: "Shift Duration",
        sortable: true,
        render: (row) => {
          if (row.status === "ABSENT") {
            return <span className="text-xs text-muted-foreground">--</span>;
          }
          return (
            <span className="font-semibold text-xs text-foreground whitespace-nowrap">
              {formatDuration(row.durationMinutes)}
            </span>
          );
        },
      },
      {
        key: "distance",
        header: "Geofence Distance",
        sortable: true,
        render: (row) => {
          if (row.status === "ABSENT") {
            return <span className="text-xs text-muted-foreground">--</span>;
          }
          return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <MapPin className="size-3 text-amber-500 shrink-0" />
              <span>{formatDistance(row.checkIn?.distanceMeters)}</span>
            </span>
          );
        },
      },
      {
        key: "biometric",
        header: "Biometric Match",
        className: "text-right",
        render: (row) => {
          if (row.status === "ABSENT") {
            return (
              <div className="flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/40 whitespace-nowrap">
                  No Punch
                </span>
              </div>
            );
          }

          const conf = formatConfidence(row.checkIn?.faceMatchConfidence);
          return (
            <div className="flex items-center justify-end">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                <ShieldCheck className="size-3" /> Rekognition: {conf}
              </span>
            </div>
          );
        },
      },
    ],
    []
  );

  const renderMobileCard = useCallback((punch) => {
    const emp = punch.employeeId || {};
    const empName = resolveEmployeeName(emp);
    const checkInTime = formatPunchTime(punch.checkIn?.time);
    const checkOutTime = formatPunchTime(punch.checkOut?.time);
    const duration = formatDuration(punch.durationMinutes);
    const distance = formatDistance(punch.checkIn?.distanceMeters);
    const confidence = formatConfidence(punch.checkIn?.faceMatchConfidence);

    const checkInSelfie = punch.checkIn?.selfieUrl;
    const checkOutSelfie = punch.checkOut?.selfieUrl;

    const isAbsent = punch.status === "ABSENT";
    const isClockedIn = punch.checkIn?.time && !punch.checkOut?.time;
    const isFullDay = punch.durationMinutes && punch.durationMinutes >= 480;

    return (
      <div className="space-y-3 p-1">
        {/* Top: Employee & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Asset
              src={emp.avatar}
              name={empName}
              className="size-9 rounded-full border border-border/60 shrink-0 shadow-2xs"
            />
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                {empName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {emp.department || "General"} · <span className="font-mono text-[10.5px]">{punch.date || "--"}</span>
              </p>
            </div>
          </div>

          {/* Prominent Status Pill */}
          <div className="shrink-0">
            {isAbsent ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                Absent
              </span>
            ) : isClockedIn ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 animate-pulse">
                Clocked In
              </span>
            ) : isFullDay ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                Full Day
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                Half Day
              </span>
            )}
          </div>
        </div>

        {/* Punches Row */}
        {isAbsent ? (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <XCircle className="size-4 shrink-0" />
            <span>Marked Absent (No punches recorded)</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-md border border-border/40">
            {/* Check In */}
            <div className="space-y-1 min-w-0">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                Check-In
              </span>
              {punch.checkIn?.status === "SUCCESS" || punch.checkIn?.time ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 dark:text-emerald-400 truncate">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span className="truncate">{checkInTime}</span>
                  </span>
                  {checkInSelfie && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSelfieData({
                          type: "Check-In",
                          selfieUrl: checkInSelfie,
                          empName,
                          empEmail: emp.email,
                          punchTime: checkInTime,
                          distance,
                          confidence,
                          date: punch.date,
                        })
                      }
                      className="size-6 rounded-md overflow-hidden border border-border/80 shrink-0 hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
                      title="View Check-In Photo"
                    >
                      <img
                        src={checkInSelfie}
                        alt="Photo"
                        className="size-full object-cover"
                      />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">Pending</span>
              )}
            </div>

            {/* Check Out */}
            <div className="space-y-1 min-w-0">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                Check-Out
              </span>
              {punch.checkOut?.time ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-blue-600 dark:text-blue-400 truncate">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span className="truncate">{checkOutTime}</span>
                  </span>
                  {checkOutSelfie && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSelfieData({
                          type: "Check-Out",
                          selfieUrl: checkOutSelfie,
                          empName,
                          empEmail: emp.email,
                          punchTime: checkOutTime,
                          distance: formatDistance(punch.checkOut?.distanceMeters),
                          confidence: formatConfidence(punch.checkOut?.faceMatchConfidence),
                          date: punch.date,
                        })
                      }
                      className="size-6 rounded-md overflow-hidden border border-border/80 shrink-0 hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
                      title="View Check-Out Photo"
                    >
                      <img
                        src={checkOutSelfie}
                        alt="Photo"
                        className="size-full object-cover"
                      />
                    </button>
                  )}
                </div>
              ) : punch.checkIn?.time ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="size-3 animate-pulse shrink-0" /> In Progress
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">--:--</span>
              )}
            </div>
          </div>
        )}

        {/* Meta details strip */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30 gap-2">
          <span className="font-semibold text-foreground flex items-center gap-1 shrink-0">
            <Clock className="size-3 text-muted-foreground" />
            {isAbsent
              ? "0h 0m"
              : duration !== "--"
              ? `${duration}`
              : "In Progress"}
          </span>

          <div className="flex items-center gap-2 overflow-hidden text-[10.5px]">
            {distance && distance !== "--" && (
              <span className="inline-flex items-center gap-0.5 text-muted-foreground truncate" title="Distance from office">
                <MapPin className="size-3 text-amber-500 shrink-0" />
                <span className="truncate">{distance}</span>
              </span>
            )}

            {confidence && confidence !== "--" && (
              <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400 shrink-0" title="Face Match Verified">
                <ShieldCheck className="size-3 shrink-0" />
                <span>{confidence}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-4 sm:space-y-6 min-w-0 pb-24 sm:pb-8">
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-md border border-border/40 shadow-xs">
        <DataTable
          title="Attendance Logs"
          subtitle="Real-time employee check-in, check-out, and biometric logs"
          columns={columns}
          data={filteredLogs}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search by employee, email..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actions={
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchAttendanceLogs(selectedDate, true)}
              disabled={isLoading}
              className="size-8.5 rounded-md border-border/60 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Refresh attendance logs"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            </Button>
          }
          searchActions={
            <div className="flex items-center justify-between gap-1.5 w-full sm:w-auto">
              <div className="flex items-center flex-1 sm:flex-initial bg-muted/40 border border-border/80 rounded-md p-0.5 shadow-2xs min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSetToday}
                  className={`h-7 px-2.5 text-[11px] sm:text-xs font-semibold rounded cursor-pointer shrink-0 ${
                    isToday
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Today
                </Button>

                <div className="h-4 w-px bg-border/60 mx-0.5 shrink-0" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevDay}
                  className="size-7 p-0 rounded text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  title="Previous Day"
                >
                  <ChevronLeft className="size-3.5" />
                </Button>

                <div className="flex-1 sm:w-32 min-w-0">
                  <DatePicker
                    value={selectedDate}
                    onChange={(newDate) => {
                      if (newDate) handleDateChange(newDate);
                    }}
                    placeholder="Select date"
                    className="h-7 border-0 shadow-none px-2 text-xs font-semibold hover:bg-muted/60 cursor-pointer w-full text-center"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextDay}
                  className="size-7 p-0 rounded text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  title="Next Day"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 border border-border/40 font-semibold text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                <UserCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-foreground">{logs.length} Logged</span>
              </span>
            </div>
          }
          pagination
          pageSize={10}
          emptyState={{
            title: "No Attendance Logs",
            description: `No employee punches recorded for ${selectedDate || "this date"}. Use the date selector to audit other days.`,
          }}
          renderMobileCard={renderMobileCard}
        />
      </div>

      <SelfiePreviewModal
        isOpen={Boolean(selectedSelfieData)}
        onClose={() => setSelectedSelfieData(null)}
        data={selectedSelfieData}
      />
    </div>
  );
}
