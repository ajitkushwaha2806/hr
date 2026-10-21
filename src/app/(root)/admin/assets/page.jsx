"use client";

import { Laptop, Plus, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAssetsPage() {
  const assets = [
    { tag: "AST-2024-001", name: 'MacBook Pro 16" M3 Max', category: "Laptop", assignedTo: "Ajit Kushwaha", dept: "Engineering", status: "Assigned" },
    { tag: "AST-2024-002", name: 'MacBook Pro 14" M3 Pro', category: "Laptop", assignedTo: "Rohit Sharma", dept: "Product Design", status: "Assigned" },
    { tag: "AST-2024-003", name: "Dell UltraSharp 32\" 4K", category: "Monitor", assignedTo: "Priya Patel", dept: "Operations", status: "Assigned" },
    { tag: "AST-2024-004", name: 'ThinkPad X1 Carbon Gen 12', category: "Laptop", assignedTo: "Available in Inventory", dept: "IT Stock", status: "In Stock" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Company Hardware & IT Assets
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <Laptop className="w-3 h-3" /> Asset Inventory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track hardware allocation, workstations, warranties, and device health.
          </p>
        </div>

        <Button size="sm" className="h-8.5 px-3 rounded-lg text-xs font-semibold shadow-2xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Allocate New Asset
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Assets</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">48</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total managed devices</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Assigned Devices</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">42</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">In active employee use</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">In Stock</p>
          <p className="text-2xl font-bold tracking-tight text-primary mt-1">6</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Ready for deployment</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Warranty Active</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">100%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">AppleCare / Dell Pro</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Hardware Asset Roster</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Asset Tag</th>
                <th className="p-3.5">Device Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Assigned To</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {assets.map((ast) => (
                <tr key={ast.tag} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 pl-4 font-mono font-semibold text-foreground">{ast.tag}</td>
                  <td className="p-3.5 font-medium text-foreground">{ast.name}</td>
                  <td className="p-3.5 text-muted-foreground">{ast.category}</td>
                  <td className="p-3.5 font-semibold text-foreground">{ast.assignedTo}</td>
                  <td className="p-3.5 text-muted-foreground">{ast.dept}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      ast.status === "Assigned"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    }`}>
                      <CheckCircle2 className="w-3 h-3" /> {ast.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:underline">
                      Manage
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
