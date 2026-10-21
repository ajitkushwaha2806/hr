"use client";

import { useState } from "react";
import { Wallet, DollarSign, Download, ArrowUpRight, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPayrollPage() {
  const [payrollPeriod, setPayrollPeriod] = useState("October 2026");

  const payrollSummary = [
    { department: "Engineering", employees: 14, grossPay: "$112,000", deductions: "$18,400", netPay: "$93,600", status: "Processed" },
    { department: "Product Design", employees: 6, grossPay: "$48,000", deductions: "$7,200", netPay: "$40,800", status: "Processed" },
    { department: "Operations", employees: 8, grossPay: "$52,000", deductions: "$8,100", netPay: "$43,900", status: "Processed" },
    { department: "Marketing", employees: 5, grossPay: "$35,000", deductions: "$5,500", netPay: "$29,500", status: "Pending" },
    { department: "Human Resources", employees: 4, grossPay: "$28,000", deductions: "$4,200", netPay: "$23,800", status: "Pending" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Payroll & Compensation
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <Wallet className="w-3 h-3" /> {payrollPeriod}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Review monthly salary disbursement, tax withholdings, and employee payroll slips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8.5 px-3 rounded-lg text-xs font-medium border-border shadow-2xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Report
          </Button>
          <Button size="sm" className="h-8.5 px-3 rounded-lg text-xs font-semibold shadow-2xs">
            Disburse Salaries
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Monthly Gross</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">$275,000</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">37 Salaried employees</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Deductions & Tax</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">$43,400</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Statutory withholdings</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Net Payout</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">$231,600</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Direct bank deposit</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Disbursement Status</p>
          <p className="text-2xl font-bold tracking-tight text-primary mt-1">75% Ready</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">3 depts processed</p>
        </div>
      </div>

      {/* Payroll Department Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Department Payroll Batches</h2>
          <span className="text-xs text-muted-foreground">Cycle ends Oct 31, 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Department</th>
                <th className="p-3.5">Headcount</th>
                <th className="p-3.5">Gross Pay</th>
                <th className="p-3.5">Deductions</th>
                <th className="p-3.5">Net Pay</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {payrollSummary.map((item) => (
                <tr key={item.department} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 pl-4 font-semibold text-foreground">{item.department}</td>
                  <td className="p-3.5 text-muted-foreground">{item.employees}</td>
                  <td className="p-3.5 font-medium text-foreground">{item.grossPay}</td>
                  <td className="p-3.5 text-rose-600 dark:text-rose-400 font-medium">{item.deductions}</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{item.netPay}</td>
                  <td className="p-3.5">
                    {item.status === "Processed" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Processed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:underline">
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
