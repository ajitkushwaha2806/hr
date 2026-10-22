import React from "react";
import { format } from "date-fns";
import { Asset } from "@/components/common/Asset";
import { MoreHorizontal, Edit, Trash2, Mail, Phone, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeStatusBadge, DepartmentBadge, EmploymentTypeBadge } from "./badges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const getEmployeeColumns = ({ onEdit, onDelete }) => [
  {
    key: "employee",
    header: "Employee",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3 min-w-0 sm:min-w-[200px] max-w-full">
        <Asset
          src={row.avatar}
          name={row.name || `${row.firstName} ${row.lastName}`}
          className="size-9 rounded-full border border-border/60 shrink-0 shadow-2xs"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-xs text-foreground truncate block">
            {row.name || `${row.firstName} ${row.lastName}`}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 min-w-0">
            <Mail className="size-2.5 shrink-0 opacity-60" />
            <span className="truncate">{row.email}</span>
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "employeeId",
    header: "Emp ID",
    sortable: true,
    render: (row) => (
      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50 truncate max-w-full inline-block">
        {row.employeeId || "—"}
      </span>
    ),
  },
  {
    key: "department",
    header: "Department & Role",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col gap-0.5 min-w-0 sm:min-w-[140px] max-w-full">
        <span className="font-medium text-xs text-foreground truncate block">
          {row.designation || "—"}
        </span>
        <div className="mt-0.5 min-w-0 max-w-full">
          <DepartmentBadge department={row.department} />
        </div>
      </div>
    ),
  },
  {
    key: "employmentType",
    header: "Type",
    sortable: true,
    render: (row) => <EmploymentTypeBadge type={row.employmentType || "Full-Time"} />,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (row) => <EmployeeStatusBadge status={row.status || "Active"} />,
  },
  {
    key: "bankDetails",
    header: "Bank Details",
    render: (row) => {
      const bank = row.bankDetails;
      const hasBank = Boolean(bank?.accountNumber || bank?.bankName || bank?.ifscCode);
      if (!hasBank) {
        return (
          <span className="text-xs text-muted-foreground/60 italic">—</span>
        );
      }
      const last4 = bank.accountNumber ? bank.accountNumber.slice(-4) : "";
      return (
        <div className="flex flex-col gap-0.5 min-w-0 sm:min-w-[140px] max-w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <Landmark className="size-3 text-muted-foreground shrink-0" />
            <span className="font-medium text-xs text-foreground truncate block flex-1">
              {bank.bankName || "Bank Account"}
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground truncate pl-4.5 block">
            {last4 ? `A/C ••••${last4}` : ""}
            {bank.ifscCode ? (last4 ? ` · ${bank.ifscCode}` : bank.ifscCode) : ""}
          </span>
        </div>
      );
    },
  },
  {
    key: "joiningDate",
    header: "Joining Date",
    sortable: true,
    render: (row) => {
      if (!row.joiningDate) return "—";
      try {
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(row.joiningDate), "MMM dd, yyyy")}
          </span>
        );
      } catch {
        return "—";
      }
    },
  },
  {
    key: "phone",
    header: "Phone",
    render: (row) => (
      <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-0 max-w-full">
        <Phone className="size-2.5 opacity-60 shrink-0" />
        <span className="truncate">{row.phone || "—"}</span>
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-40 rounded-lg p-1 shadow-lg">
          <DropdownMenuItem
            onClick={() => onEdit?.(row)}
            className="flex items-center gap-2 cursor-pointer text-xs font-medium py-1.5"
          >
            <Edit className="size-3.5 text-muted-foreground" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={() => onDelete?.(row)}
            className="flex items-center gap-2 cursor-pointer text-xs font-medium text-destructive hover:bg-destructive/10 py-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
