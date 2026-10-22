"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEPARTMENT_SUGGESTIONS } from "../constants";
import { Building2, X, Plus, Sparkles } from "lucide-react";

export default function DepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  editingDepartment = null,
}) {
  const [departmentName, setDepartmentName] = useState("");
  const [designations, setDesignations] = useState([]);
  const [currentDesignationInput, setCurrentDesignationInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingDepartment) {
      setDepartmentName(editingDepartment.name || "");
      setDesignations(editingDepartment.designations || []);
    } else {
      setDepartmentName("");
      setDesignations([]);
    }
    setCurrentDesignationInput("");
    setError("");
  }, [editingDepartment, isOpen]);

  const handleAddTag = (tagToAdd) => {
    const trimmed = (tagToAdd || currentDesignationInput).trim();
    if (!trimmed) return;

    if (designations.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Designation "${trimmed}" already added.`);
      return;
    }

    setDesignations((prev) => [...prev, trimmed]);
    setCurrentDesignationInput("");
    setError("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setDesignations((prev) => prev.filter((d) => d !== tagToRemove));
  };

  const handleSelectSuggestion = (suggestion) => {
    setDepartmentName(suggestion.name);
    const merged = [
      ...designations,
      ...suggestion.designations.filter(
        (sd) => !designations.some((d) => d.toLowerCase() === sd.toLowerCase())
      ),
    ];
    setDesignations(merged);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!departmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    let finalDesignations = [...designations];
    const pending = currentDesignationInput.trim();
    if (pending && !finalDesignations.some((d) => d.toLowerCase() === pending.toLowerCase())) {
      finalDesignations.push(pending);
    }

    onSubmit({
      departmentId: editingDepartment?._id,
      name: departmentName.trim(),
      designations: finalDesignations,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer on mobile, Center modal on desktop */}
      <div className="relative w-full sm:max-w-md bg-card rounded-t-[28px] sm:rounded-2xl border-t sm:border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95 ease-out z-10">
        {/* Mobile Drawer Pull Indicator */}
        <div className="flex sm:hidden justify-center pt-2.5 pb-1 bg-muted/40 cursor-grab">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-3.5 border-b border-border/60 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate">
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                Configure department name & roles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="deptName" className="text-xs font-semibold text-foreground">
                Department Name *
              </label>
              <Input
                id="deptName"
                placeholder="e.g. Engineering, Sales, Marketing"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="h-10 text-xs rounded-xl"
                autoFocus
              />
            </div>

            {!editingDepartment && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" /> Quick Suggestions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DEPARTMENT_SUGGESTIONS.slice(0, 4).map((sugg) => (
                    <button
                      key={sugg.name}
                      type="button"
                      onClick={() => handleSelectSuggestion(sugg)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer font-medium"
                    >
                      + {sugg.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Designations / Roles
                </label>
                <span className="text-[10px] text-muted-foreground">Optional</span>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type role and click Add"
                  value={currentDesignationInput}
                  onChange={(e) => setCurrentDesignationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="h-10 text-xs rounded-xl flex-1"
                />
                <Button
                  type="button"
                  onClick={() => handleAddTag()}
                  size="sm"
                  variant="outline"
                  className="h-10 px-3.5 text-xs font-semibold shrink-0 cursor-pointer rounded-xl"
                >
                  <Plus className="size-3.5 mr-1" /> Add
                </Button>
              </div>

              {designations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto pr-1">
                  {designations.map((desig) => (
                    <span
                      key={desig}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                    >
                      <span>{desig}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(desig)}
                        className="hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                        title="Remove"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-3.5 sm:p-4 border-t border-border/70 bg-card/95 backdrop-blur-md shrink-0 flex items-center gap-2.5 pb-safe pb-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              <span>
                {isSubmitting
                  ? "Saving..."
                  : editingDepartment
                  ? "Update Department"
                  : "Save Department"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}