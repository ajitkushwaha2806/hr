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

    return (
      <div className="space-y-2.5">
        {/* Top: Employee & Date */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Asset
              src={emp.avatar}
              name={empName}
              className="size-8.5 rounded-full border border-border/60 shrink-0 shadow-2xs"
            />
            <div className="min-w-0">
              <p className="font-bold text-xs text-foreground truncate">
                {empName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {emp.email || emp.department || "Staff"}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40 shrink-0">
            {punch.date || "--"}
          </span>
        </div>

        {/* Punches Grid: Check In & Check Out */}
        <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-lg border border-border/40">
          {/* Check In */}
          <div className="space-y-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              Check-In
            </span>
            {punch.status === "ABSENT" ? (
              <span className="inline-flex items-center gap-1 font-semibold text-xs text-rose-600 dark:text-rose-400">
                <XCircle className="size-3" /> Absent
              </span>
            ) : punch.checkIn?.status === "SUCCESS" || punch.checkIn?.time ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> {checkInTime}
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
                    className="shrink-0 group cursor-pointer"
                    title="View Check-In Selfie"
                  >
                    <img
                      src={checkInSelfie}
                      alt="Check-in Photo"
                      className="size-5.5 rounded-md object-cover border border-border/80 group-hover:scale-105 transition-transform"
                    />
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">--:--</span>
            )}
          </div>

          {/* Check Out */}
          <div className="space-y-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              Check-Out
            </span>
            {punch.status === "ABSENT" ? (
              <span className="text-xs text-muted-foreground">--:--</span>
            ) : punch.checkOut?.time ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 font-semibold text-xs text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="size-3" /> {checkOutTime}
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
                    className="shrink-0 group cursor-pointer"
                    title="View Check-Out Selfie"
                  >
                    <img
                      src={checkOutSelfie}
                      alt="Check-out Photo"
                      className="size-5.5 rounded-md object-cover border border-border/80 group-hover:scale-105 transition-transform"
                    />
                  </button>
                )}
              </div>
            ) : punch.checkIn?.time ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                <Clock className="size-2.5" /> In Progress
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">--:--</span>
            )}
          </div>
        </div>

        {/* Meta details strip */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Clock className="size-3 text-muted-foreground" />
            {punch.status === "ABSENT"
              ? "Absent"
              : duration !== "--"
              ? `${duration} shift`
              : "Shift active"}
          </span>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <MapPin className="size-3 text-amber-500" />
              <span>{distance}</span>
            </span>

            <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3" />
              <span>{confidence}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-4 sm:space-y-6 min-w-0 pb-24 sm:pb-8">
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl border border-border/40 shadow-xs">
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
            <div className="flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto flex-nowrap">
              <div className="flex items-center bg-muted/40 border border-border/80 rounded-md p-0.5 shadow-2xs shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSetToday}
                  className={`h-7 px-2 text-[11px] sm:text-xs font-semibold rounded cursor-pointer ${
                    isToday
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Today
                </Button>

                <div className="h-4 w-px bg-border/60 mx-0.5" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevDay}
                  className="h-7 w-7 p-0 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="size-3.5" />
                </Button>

                <div className="w-24 sm:w-32">
                  <DatePicker
                    value={selectedDate}
                    onChange={(newDate) => {
                      if (newDate) handleDateChange(newDate);
                    }}
                    placeholder="Select date"
                    className="h-7 border-0 shadow-none px-1 text-xs font-semibold hover:bg-muted/60 cursor-pointer"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextDay}
                  className="h-7 w-7 p-0 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 border border-border/40 font-medium text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                <UserCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-foreground">{logs.length} Logged</span>
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
