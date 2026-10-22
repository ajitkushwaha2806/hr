export const LEAVE_STATUS = {
  ALL: "all",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const STATUS_TABS = [
  { key: LEAVE_STATUS.ALL, label: "All" },
  { key: LEAVE_STATUS.PENDING, label: "Pending", highlight: "amber" },
  { key: LEAVE_STATUS.APPROVED, label: "Approved", highlight: "emerald" },
  { key: LEAVE_STATUS.REJECTED, label: "Rejected", highlight: "rose" },
];

export const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    iconName: "Clock",
  },
  APPROVED: {
    label: "Approved",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    iconName: "CheckCircle2",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    iconName: "XCircle",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
    iconName: "X",
  },
};

export const LEAVE_TYPE_STYLES = {
  "Casual Leave": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Loss of Pay": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  default: "bg-primary/10 text-primary border-primary/20",
};

export const LEAVE_TYPES = [
  {
    key: "Casual Leave",
    label: "Casual Leave",
    shortLabel: "Casual",
    paidType: "Paid",
    color: "blue",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    description: "Paid leave deducted from monthly quota",
  },
  {
    key: "Loss of Pay",
    label: "Loss of Pay",
    shortLabel: "LOP",
    paidType: "Unpaid",
    color: "rose",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    description: "Unpaid time off with salary deduction",
  },
];
