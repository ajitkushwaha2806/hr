"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, Clock, CheckCircle2, XCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable from "@/components/global/table";
import { Asset } from "@/components/common/Asset";
import useNotification from "@/store/hooks/useNotification";
import { LeaveFrontendService } from "@/services/frontend/leave";
import { STATUS_CONFIG, LEAVE_TYPE_STYLES } from "./constants";
import { formatLeaveDuration, formatDateRange, computeLeaveStats } from "./helpers";
import RejectReasonModal from "./fragments/reject-reason-modal";

export default function LeavesManagement() {
  const notify = useNotification();

  const [requests, setRequests] = useState([]);
  const [rawStats, setRawStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState(null);

  const fetchLeaves = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        const res = await LeaveFrontendService.adminGetLeaves();
        if (res) {
          setRequests(res.leaves || []);
          if (res.stats) setRawStats(res.stats);
        }
      } catch (err) {
        notify.error(err.message || "Failed to load leave requests");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    fetchLeaves(true);
  }, [fetchLeaves]);

  const stats = useMemo(
    () => computeLeaveStats(requests, rawStats),
    [requests, rawStats]
  );

  const filterTabs = useMemo(
    () => [
      { value: "all", label: "All Leaves", count: stats.total },
      { value: "pending", label: "Pending", count: stats.pending },
      { value: "approved", label: "Approved", count: stats.approved },
      { value: "rejected", label: "Rejected", count: stats.rejected },
    ],
    [stats]
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // 1. Search Query
      const query = (searchQuery || "").toLowerCase().trim();
      const matchesSearch =
        !query ||
        (r.employeeName || "").toLowerCase().includes(query) ||
        (r.department || "").toLowerCase().includes(query) ||
        (r.employeeEmail || "").toLowerCase().includes(query) ||
        (r.type || "").toLowerCase().includes(query) ||
        (r.reason || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Status Filter
      if (statusFilter === "pending" && r.status !== "PENDING") return false;
      if (statusFilter === "approved" && r.status !== "APPROVED") return false;
      if (statusFilter === "rejected" && r.status !== "REJECTED") return false;

      // 3. Type Filter
      if (typeFilter !== "all" && (r.type || "Casual Leave") !== typeFilter) return false;

      return true;
    });
  }, [requests, searchQuery, statusFilter, typeFilter]);

  const handleApprove = async (id) => {
    try {
      setReviewingId(id);
      await LeaveFrontendService.adminReviewLeave(id, "APPROVE", "Approved by Admin");
      notify.success("Leave request approved successfully!");
      await fetchLeaves(false);
    } catch (err) {
      notify.error(err.message || "Failed to approve leave request");
    } finally {
      setReviewingId(null);
    }
  };

  const handleOpenRejectModal = (request) => {
    setSelectedRequestForReject(request);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (remarks) => {
    if (!selectedRequestForReject) return;
    const reqId = selectedRequestForReject._id || selectedRequestForReject.id;

    try {
      setReviewingId(reqId);
      await LeaveFrontendService.adminReviewLeave(reqId, "REJECT", remarks);
      notify.error("Leave request has been rejected.");
      setRejectModalOpen(false);
      setSelectedRequestForReject(null);
      await fetchLeaves(false);
    } catch (err) {
      notify.error(err.message || "Failed to reject leave request");
    } finally {
      setReviewingId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee",
        sortable: true,
        render: (row) => {
          const avatarUrl = row.avatar || row.employeeId?.avatar || "";
          const empName = row.employeeName || row.name || "Employee";
          const subText = row.department || row.employeeEmail || row.email || "—";
          return (
            <div className="flex items-center gap-3 min-w-0 sm:min-w-[190px] max-w-full">
              <Asset
                src={avatarUrl}
                name={empName}
                className="size-8.5 rounded-full border border-border/60 shrink-0 shadow-2xs"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-xs text-foreground truncate block">
                  {empName}
                </span>
                <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                  {subText}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "type",
        header: "Leave Type",
        sortable: true,
        render: (row) => {
          const type = row.type || "Casual Leave";
          const isLop = type === "Loss of Pay";
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                isLop
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
              }`}
            >
              <span
                className={`size-1.5 rounded-full shrink-0 ${
                  isLop ? "bg-rose-500" : "bg-blue-500"
                }`}
              />
              <span>{type}</span>
            </span>
          );
        },
      },
      {
        key: "duration",
        header: "Duration",
        sortable: true,
        render: (row) => (
          <span className="font-semibold text-xs text-foreground whitespace-nowrap">
            {formatLeaveDuration(row.daysCount || row.days, row.dayType)}
          </span>
        ),
      },
      {
        key: "dates",
        header: "Dates",
        sortable: true,
        render: (row) => (
          <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
            <Clock className="size-3 text-muted-foreground/70 shrink-0" />
            {formatDateRange(row.startDate, row.endDate)}
          </span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        render: (row) => (
          <div
            className="max-w-[200px] lg:max-w-xs truncate text-xs text-muted-foreground"
            title={row.reason || "No reason provided"}
          >
            {row.reason || "—"}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (row) => {
          const config = STATUS_CONFIG[row.status] || STATUS_CONFIG.PENDING;
          let Icon = Clock;
          if (row.status === "APPROVED") Icon = CheckCircle2;
          if (row.status === "REJECTED") Icon = XCircle;
          if (row.status === "CANCELLED") Icon = X;

          return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${config.badgeClass}`}>
              <Icon className="size-3" /> {config.label}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (row) => {
          const reqId = row._id || row.id;
          const isProcessing = reviewingId === reqId;

          if (row.status === "PENDING") {
            return (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleApprove(reqId)}
                  className="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer shadow-2xs gap-1"
                >
                  <Check className="size-3" /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleOpenRejectModal(row)}
                  className="h-7 px-2.5 rounded-md border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold cursor-pointer shadow-2xs gap-1"
                >
                  <X className="size-3" /> Reject
                </Button>
              </div>
            );
          }

          return (
            <span className="text-[11px] text-muted-foreground/70 font-medium">
              Completed
            </span>
          );
        },
      },
    ],
    [reviewingId]
  );

  const renderMobileCard = useCallback(
    (req) => {
      const reqId = req._id || req.id;
      const isProcessing = reviewingId === reqId;
      const avatarUrl = req.avatar || req.employeeId?.avatar || "";
      const empName = req.employeeName || req.name || "Employee";
      const isPending = req.status === "PENDING";
      const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
      let StatusIcon = Clock;
      if (req.status === "APPROVED") StatusIcon = CheckCircle2;
      if (req.status === "REJECTED") StatusIcon = XCircle;
      if (req.status === "CANCELLED") StatusIcon = X;

      const type = req.type || "Casual Leave";
      const styleClass = LEAVE_TYPE_STYLES[type] || LEAVE_TYPE_STYLES.default;

      return (
        <div className="space-y-2.5">
          {/* Top row: Employee & Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Asset
                src={avatarUrl}
                name={empName}
                className="size-8.5 rounded-full border border-border/60 shrink-0 shadow-2xs"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-foreground truncate">
                  {empName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {req.department || req.employeeEmail || "—"}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${config.badgeClass}`}>
              <StatusIcon className="size-3" /> {config.label}
            </span>
          </div>

          {/* Chips: Leave Type, Duration & Dates */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-md border ${
                type === "Loss of Pay"
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
              }`}
            >
              <span
                className={`size-1.5 rounded-full shrink-0 ${
                  type === "Loss of Pay" ? "bg-rose-500" : "bg-blue-500"
                }`}
              />
              <span>{type}</span>
            </span>
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60">
              {formatLeaveDuration(req.daysCount || req.days, req.dayType)}
            </span>
            <span className="text-[10.5px] font-mono text-muted-foreground flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/50">
              <Clock className="size-3 text-muted-foreground shrink-0" />
              {formatDateRange(req.startDate, req.endDate)}
            </span>
          </div>

          {/* Reason box if provided */}
          {req.reason && (
            <div className="text-xs bg-muted/30 p-2 sm:p-2.5 rounded-md border border-border/40 leading-relaxed">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground/80 block mb-0.5">
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
                onClick={() => handleApprove(reqId)}
                className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-2xs gap-1.5"
              >
                <Check className="size-3.5" />
                <span>Approve</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleOpenRejectModal(req)}
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
    },
    [reviewingId]
  );

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-4 sm:space-y-6 min-w-0 pb-24 sm:pb-8">
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl border border-border/40 shadow-xs">
        <DataTable
          title="Leave Records"
          subtitle="Review, approve, and track employee leave applications"
          columns={columns}
          data={filteredRequests}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search by name, department, leave type, reason..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterTabs={filterTabs}
          activeFilterTab={statusFilter}
          onFilterTabChange={setStatusFilter}
          actions={
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchLeaves(true)}
              disabled={isLoading}
              className="size-8.5 rounded-md border-border/60 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Refresh leave records"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            </Button>
          }
          searchActions={
            <div className="w-auto shrink-0">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-auto shrink-0 h-8.5 px-2.5 sm:px-3 text-xs rounded-md bg-muted/40 border-border/60 gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer">
                  <SelectValue placeholder="All Leave Types">
                    {typeFilter === "all" ? "All Leave Types" : typeFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[150px] p-1">
                  <SelectItem value="all" className="text-xs cursor-pointer">
                    All Leave Types
                  </SelectItem>
                  <SelectItem value="Casual Leave" className="text-xs cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                      <span>Casual Leave</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="Loss of Pay" className="text-xs cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                      <span>Loss of Pay</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          pagination
          pageSize={10}
          emptyState={{
            title: "No Leave Records Found",
            description: "No leave requests match your search or filter criteria.",
          }}
          renderMobileCard={renderMobileCard}
        />
      </div>

      <RejectReasonModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequestForReject(null);
        }}
        onConfirm={handleConfirmReject}
        request={selectedRequestForReject}
        isSubmitting={Boolean(reviewingId)}
      />
    </div>
  );
}
