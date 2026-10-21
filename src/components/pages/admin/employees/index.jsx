"use client";
import { Plus, RefreshCw } from "lucide-react";
import { EmployeeFormSheet } from "./fragments";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/global/table";
import { useState, useMemo, useCallback } from "react";
import { useEmployees } from "@/store/hooks/useEmployee";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMPLOYEE_STATUS_FILTERS, DEPARTMENTS, DEFAULT_PAGE_SIZE, EMPLOYEE_EMPTY_STATE, getEmployeeColumns } from "./helpers";

export default function EmployeeManagement() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const { employees, stats, isLoading, isFetching, error, refetch, addEmployee, updateEmployee, deleteEmployee, isDeleting } = useEmployees({
    status: statusFilter,
    department: departmentFilter,
    search: searchQuery,
  });

  const handleAddEmployee = useCallback(() => {
    setEditingEmployee(null);
    setIsSheetOpen(true);
  }, []);

  const handleEditEmployee = useCallback((emp) => {
    setEditingEmployee(emp);
    setIsSheetOpen(true);
  }, []);

  const handleSaveEmployee = async (data) => {
    try {
      if (editingEmployee?._id) {
        await updateEmployee({ id: editingEmployee._id, data });
      } else {
        await addEmployee(data);
      }
      setIsSheetOpen(false);
      setEditingEmployee(null);
    } catch {
    }
  };

  const handleDelete = useCallback(async () => {
    if (!employeeToDelete?._id) return;
    try {
      await deleteEmployee(employeeToDelete._id);
      setEmployeeToDelete(null);
    } catch {
    }
  }, [employeeToDelete, deleteEmployee]);

  const columns = useMemo(
    () =>
      getEmployeeColumns({
        onEdit: handleEditEmployee,
        onDelete: setEmployeeToDelete,
      }),
    [handleEditEmployee]
  );

  return (
    <div className="flex flex-col m-2 sm:m-4 space-y-4 sm:space-y-6 min-w-0"> 
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-5 rounded-xl border border-border/40 shadow-xs">
        <DataTable
          title="Employee Directory"
          subtitle="View, search, and manage all employees in your organization"
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
          searchActions={
            <div className="w-44 shrink-0">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-8.5 text-xs rounded-md bg-muted/40 border-border/60">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Departments
                  </SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-xs">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          actions={
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={handleAddEmployee}
                size="sm"
                className="flex-1 sm:flex-none h-8.5 rounded-md font-semibold text-xs gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Onboard Employee</span>
              </Button>

              {refetch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="h-8.5 px-2.5 rounded-md border-border/60 shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs"
                  title="Refresh employee list"
                >
                  <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              )}
            </div>
          }
          pagination
          pageSize={DEFAULT_PAGE_SIZE}
          emptyState={EMPLOYEE_EMPTY_STATE}
        />
      </div>

      <EmployeeFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
        isLoading={isLoading}
      />

      <ConfirmDeleteAlert
        isOpen={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Remove Employee?"
        description={`Are you sure you want to permanently remove ${
          employeeToDelete?.name || `${employeeToDelete?.firstName || ""} ${employeeToDelete?.lastName || ""}`
        } from the organization? This action cannot be undone.`}
      />
    </div>
  );
}
