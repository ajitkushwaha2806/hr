"use client";
import React, { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/global/table";
import { useEmployees } from "@/store/hooks/useEmployee";
import { useDepartments } from "@/store/hooks/useDepartments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EMPLOYEE_STATUS_FILTERS,
  DEPARTMENTS,
  DEFAULT_PAGE_SIZE,
  EMPLOYEE_EMPTY_STATE,
  getEmployeeColumns,
} from "@/components/pages/admin/employees/helpers";

export default function TeamDirectoryView() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { departments: dbDepartments = [] } = useDepartments();
  const availableDepts = dbDepartments.length > 0 ? dbDepartments.map((d) => d.name) : DEPARTMENTS;

  // useEmployees queries /api/employees which automatically scopes to TL direct reports
  const { employees, isLoading, isFetching, error, refetch } = useEmployees({
    status: statusFilter,
    department: departmentFilter,
    search: searchQuery,
  });

  const columns = useMemo(
    () =>
      getEmployeeColumns({
        basePath: "/employee/team",
        allowEdit: false,
      }),
    []
  );

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-4 sm:space-y-6 min-w-0 pb-24 sm:pb-8">
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-md border border-border/40 shadow-xs min-w-0">
        <DataTable
          title="Employee Directory"
          subtitle="View, search, and manage all employees in your team"
          columns={columns}
          data={employees}
          isLoading={isLoading}
          error={error}
          searchable
          searchPlaceholder="Search employees by name, email, ID, or designation..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterTabs={EMPLOYEE_STATUS_FILTERS}
          activeFilterTab={statusFilter}
          onFilterTabChange={setStatusFilter}
          actions={
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end min-w-0">
              {refetch && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="size-8.5 rounded-md border-border/60 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                  title="Refresh employee list"
                >
                  <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
                </Button>
              )}

              <div className="flex-1 sm:flex-initial sm:w-auto min-w-0">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-auto min-w-0 sm:min-w-[130px] h-8.5 px-2.5 sm:px-3 text-xs rounded-md bg-muted/40 border-border/60 gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer">
                    <SelectValue placeholder="All Departments" className="truncate">
                      {departmentFilter === "all" ? "All Departments" : departmentFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="min-w-[150px] p-1">
                    <SelectItem value="all" className="text-xs cursor-pointer">
                      All Departments
                    </SelectItem>
                    {availableDepts.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs cursor-pointer">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
          pagination
          pageSize={DEFAULT_PAGE_SIZE}
          emptyState={EMPLOYEE_EMPTY_STATE}
          onRowClick={(row) => router.push(`/employee/team/${row._id}`)}
          rowClassName="cursor-pointer hover:bg-muted/30 transition-colors"
        />
      </div>
    </div>
  );
}
