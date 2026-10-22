"use client";
import { useState } from "react";
import { CheckCircle2, MapPin, ShieldCheck, Clock, UserX } from "lucide-react";
import {
  resolveEmployeeName,
  getEmployeeInitials,
  formatPunchTime,
  formatDuration,
  formatDistance,
  formatConfidence,
} from "../helpers";

function EmployeeAvatarCell({ emp }) {
  const [imgFailed, setImgFailed] = useState(false);
  const name = resolveEmployeeName(emp);
  const initials = getEmployeeInitials(name);

  return (
    <div className="flex items-center gap-2.5">
      {emp.avatar && !imgFailed ? (
        <img
          src={emp.avatar}
          alt={name}
          onError={() => setImgFailed(true)}
          className="size-8 rounded-full object-cover border border-border/80 shrink-0 shadow-2xs"
        />
      ) : (
        <div className="size-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[11px] shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-[200px]">
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
          {emp.email || emp.department || "Staff"}
        </p>
      </div>
    </div>
  );
}

export default function AttendanceTable({
  logs = [],
  onViewSelfie,
  selectedDate,
}) {
  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border/70 rounded-xl p-10 sm:p-14 text-center shadow-xs">
        <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center mb-3">
          <UserX className="size-6" />
        </div>
        <h3 className="font-bold text-foreground text-sm sm:text-base">No Attendance Logs</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No employee punches recorded for {selectedDate || "this date"}. Use the date selector to audit other days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/70 rounded-xl shadow-xs overflow-hidden">
      {/* Mobile App Cards View (Visible on sm:hidden) */}
      <div className="sm:hidden divide-y divide-border/60">
        {logs.map((punch) => {
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
            <div
              key={punch._id || punch.id}
              className="p-3.5 space-y-3 bg-card hover:bg-muted/15 transition-colors"
            >
              {/* Top: Employee & Date */}
              <div className="flex items-start justify-between gap-2">
                <EmployeeAvatarCell emp={emp} />
                <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40 shrink-0">
                  {punch.date || "--"}
                </span>
              </div>

              {/* Punches Grid: Check In & Check Out */}
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                {/* Check In */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Check-In
                  </span>
                  {punch.checkIn?.status === "SUCCESS" || punch.checkIn?.time ? (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> {checkInTime}
                      </span>
                      {checkInSelfie && (
                        <button
                          type="button"
                          onClick={() =>
                            onViewSelfie({
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
                            className="size-6 rounded-md object-cover border border-border/80 group-hover:scale-105 transition-transform"
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Check-Out
                  </span>
                  {punch.checkOut?.time ? (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-xs text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="size-3" /> {checkOutTime}
                      </span>
                      {checkOutSelfie && (
                        <button
                          type="button"
                          onClick={() =>
                            onViewSelfie({
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
                            className="size-6 rounded-md object-cover border border-border/80 group-hover:scale-105 transition-transform"
                          />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Clock className="size-3" /> In Progress
                    </span>
                  )}
                </div>
              </div>

              {/* Meta details strip */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" />
                  {duration !== "--" ? `${duration} shift` : "Shift active"}
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
        })}
      </div>

      {/* Desktop Table View (Visible on sm and up) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5 pl-4">Employee</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Check-In</th>
              <th className="p-3.5">Check-Out</th>
              <th className="p-3.5">Shift Duration</th>
              <th className="p-3.5">Geofence Distance</th>
              <th className="p-3.5 pr-4 text-right">Biometric Match</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {logs.map((punch) => {
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
                <tr
                  key={punch._id || punch.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3.5 pl-4">
                    <EmployeeAvatarCell emp={emp} />
                  </td>

                  <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                    {punch.date || "--"}
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    {punch.checkIn?.status === "SUCCESS" || punch.checkIn?.time ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" /> {checkInTime}
                        </span>

                        {checkInSelfie && (
                          <button
                            type="button"
                            onClick={() =>
                              onViewSelfie({
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
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
                            title="View Check-In Selfie"
                          >
                            <img
                              src={checkInSelfie}
                              alt="Check-in Photo"
                              className="size-6 rounded-md object-cover border border-border group-hover:scale-105 transition-transform"
                            />
                            <span className="text-[10px] font-medium hidden sm:inline group-hover:underline">Photo</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--:--</span>
                    )}
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    {punch.checkOut?.time ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="size-3.5" /> {checkOutTime}
                        </span>

                        {checkOutSelfie && (
                          <button
                            type="button"
                            onClick={() =>
                              onViewSelfie({
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
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
                            title="View Check-Out Selfie"
                          >
                            <img
                              src={checkOutSelfie}
                              alt="Check-out Photo"
                              className="size-6 rounded-md object-cover border border-border group-hover:scale-105 transition-transform"
                            />
                            <span className="text-[10px] font-medium hidden sm:inline group-hover:underline">Photo</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Clock className="size-3" /> In Progress
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                    {punch.checkOut?.time ? (
                      <span className="font-semibold text-foreground">{duration}</span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3.5 text-amber-500 shrink-0" />
                      <span>{distance}</span>
                    </span>
                  </td>

                  <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="size-3" /> Rekognition: {confidence}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
