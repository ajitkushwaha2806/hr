"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG, LEAVE_TYPE_STYLES } from "../constants";
import { Check, X, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatLeaveDuration, formatDateRange, getEmployeeInitials } from "../helpers";

function EmployeeAvatar({ name, avatar, email }) {
  const [hasError, setHasError] = useState(false);
  const initials = getEmployeeInitials(name || email);

  if (avatar && !hasError) {
    return (
      <img
        src={avatar}
        alt={name || "Employee"}
        onError={() => setHasError(true)}
        className="size-8 rounded-full object-cover shrink-0 ring-1 ring-border shadow-2xs"
      />
    );
  }

  return (
    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
      {initials}
    </div>
  );
}

export default function LeavesTable({
  requests = [],
  onApprove,
  onReject,
  reviewingId = null,
}) {
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    let Icon = Clock;
    if (status === "APPROVED") Icon = CheckCircle2;
    if (status === "REJECTED") Icon = XCircle;
    if (status === "CANCELLED") Icon = X;

    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}
      >
        <Icon className="size-3" /> {config.label}
      </span>
    );
  };

  const getLeaveTypeBadge = (type = "Casual Leave") => {
    const styleClass = LEAVE_TYPE_STYLES[type] || LEAVE_TYPE_STYLES.default;
    return (
      <span
        className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${styleClass}`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="bg-card border border-border/70 rounded-lg sm:rounded-xl shadow-xs overflow-hidden">
      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="py-12 sm:py-16 px-4 text-center">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Clock className="size-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-foreground">
            No leave requests found
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            No matching records for your current filter and search criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile App Cards View (Visible on sm:hidden) */}
          <div className="sm:hidden divide-y divide-border/60">
            {requests.map((req) => {
              const reqId = req._id || req.id;
              const isProcessing = reviewingId === reqId;
              const avatarUrl = req.avatar || req.employeeId?.avatar || "";
              const isPending = req.status === "PENDING";

              return (
                <div
                  key={reqId}
                  className="p-2.5 sm:p-3.5 space-y-2 sm:space-y-3 bg-card hover:bg-muted/15 transition-colors"
                >
                  {/* Top: Employee & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <EmployeeAvatar
                        name={req.employeeName}
                        avatar={avatarUrl}
                        email={req.employeeEmail}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">
                          {req.employeeName || "Employee"}
                        </p>
                        <p className="text-[10.5px] sm:text-[11px] text-muted-foreground truncate">
                          {req.department || req.employeeEmail || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Chips: Leave Type, Duration & Dates */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getLeaveTypeBadge(req.type)}
                    <span className="text-[10.5px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60">
                      {formatLeaveDuration(req.daysCount || req.days, req.dayType)}
                    </span>
                    <span className="text-[10.5px] sm:text-[11px] font-mono text-muted-foreground flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/50">
                      <Clock className="size-3 text-muted-foreground shrink-0" />
                      {formatDateRange(req.startDate, req.endDate)}
                    </span>
                  </div>

                  {/* Reason box if provided */}
                  {req.reason && (
                    <div className="text-xs bg-muted/30 p-2 sm:p-2.5 rounded-md sm:rounded-lg border border-border/40 leading-relaxed">
                      <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block mb-0.5">
                        Reason
                      </span>
                      <p className="text-foreground/90">{req.reason}</p>
                    </div>
                  )}

                  {/* Actions for Pending Requests */}
                  {isPending ? (
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => onApprove(reqId)}
                        className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-2xs gap-1.5"
                      >
                        <Check className="size-3.5" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => onReject(req)}
                        className="h-8 rounded-lg border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer shadow-2xs gap-1.5"
                      >
                        <X className="size-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>Review Status</span>
                      <span className="font-semibold text-foreground/80">Completed</span>
                    </div>
                  )}
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
                  <th className="p-3.5">Leave Type</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Dates</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {requests.map((req) => {
                  const reqId = req._id || req.id;
                  const isProcessing = reviewingId === reqId;
                  const avatarUrl = req.avatar || req.employeeId?.avatar || "";

                  return (
                    <tr key={reqId} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <EmployeeAvatar
                            name={req.employeeName}
                            avatar={avatarUrl}
                            email={req.employeeEmail}
                          />
                          <div>
                            <p className="font-semibold text-foreground">
                              {req.employeeName || "Employee"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {req.department || req.employeeEmail || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {getLeaveTypeBadge(req.type)}
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-medium text-foreground">
                        {formatLeaveDuration(req.daysCount || req.days, req.dayType)}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {formatDateRange(req.startDate, req.endDate)}
                      </td>

                      <td
                        className="p-3.5 max-w-xs truncate text-muted-foreground"
                        title={req.reason || "No reason provided"}
                      >
                        {req.reason || "—"}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        {req.status === "PENDING" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => onApprove(reqId)}
                              className="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer shadow-2xs"
                            >
                              <Check className="size-3 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => onReject(req)}
                              className="h-7 px-2.5 rounded-md border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold cursor-pointer shadow-2xs"
                            >
                              <X className="size-3 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/80 font-medium">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}