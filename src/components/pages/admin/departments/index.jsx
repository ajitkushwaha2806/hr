"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useDepartments } from "@/store/hooks/useDepartments";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import {
  DepartmentsHeader,
  DepartmentCard,
  DepartmentModal,
  DepartmentsSkeleton,
  DepartmentsEmptyState,
} from "./fragments";

export default function DepartmentsManagement() {
  const {
    departments,
    isLoading,
    addDepartment,
    isAdding,
    updateDepartment,
    isUpdating,
    deleteDepartment,
    isDeleting,
  } = useDepartments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDepartment(dept);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (payload) => {
    if (editingDepartment) {
      await updateDepartment(payload);
    } else {
      await addDepartment(payload);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete?._id) return;
    try {
      await deleteDepartment(departmentToDelete._id);
      setDepartmentToDelete(null);
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <div className="min-h-screen bg-white rounded-2xl m-2 sm:m-4 dark:bg-zinc-950 p-3.5 sm:p-5 lg:p-6 space-y-5 pb-24 sm:pb-8">
      <DepartmentsHeader
        totalCount={departments.length}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {isLoading ? (
        <DepartmentsSkeleton />
      ) : (
        <div className="space-y-5">
          {/* Empty State when no departments exist at all */}
          {departments.length === 0 && (
            <DepartmentsEmptyState onOpenCreateModal={handleOpenCreateModal} />
          )}

          {/* Department Cards Grid */}
          {departments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept._id}
                  department={dept}
                  onEdit={handleOpenEditModal}
                  onDelete={(d) => setDepartmentToDelete(d)}
                  isDeleting={departmentToDelete?._id === dept._id && isDeleting}
                />
              ))}

              {/* In-grid Add Department action card */}
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="min-h-[140px] sm:min-h-[200px] rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-slate-50/40 dark:bg-zinc-900/40 hover:bg-primary/5 p-5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 cursor-pointer group shadow-2xs"
              >
                <div className="size-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  <Plus className="size-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    Add New Department
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit / Create Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={isAdding || isUpdating}
        editingDepartment={editingDepartment}
      />

      {/* Modern Confirmation Alert for Deletion */}
      <ConfirmDeleteAlert
        isOpen={Boolean(departmentToDelete)}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Department?"
        description={`Are you sure you want to remove "${departmentToDelete?.name}"? Employees in this department may need to be reassigned.`}
      />
    </div>
  );
}
