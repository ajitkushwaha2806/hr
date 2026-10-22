"use client";

import { useMemo, useEffect } from "react";
import { Building2, Briefcase, Clock, Compass, Calendar, Loader2 } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { FloatingDatePicker } from "@/components/ui/date-picker";
import { useDepartments } from "@/store/hooks/useDepartments";
import {
  DEPARTMENTS as FALLBACK_DEPARTMENTS,
  WORK_LOCATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  DEPARTMENT_DESIGNATIONS as FALLBACK_DESIGNATIONS,
  DEPARTMENT_NORMALIZATION_MAP,
} from "../../constants";
import FloatingSelect from "../floating-select";

export default function Step2Role({ formData, handleChange, errors = {} }) {
  const { departments: dbDepartments = [], isLoading: isDepartmentsLoading } = useDepartments();

  const availableDepartments = useMemo(() => {
    if (Array.isArray(dbDepartments) && dbDepartments.length > 0) {
      return dbDepartments.map((d) => d.name).filter(Boolean);
    }
    return FALLBACK_DEPARTMENTS;
  }, [dbDepartments]);

  const currentDeptRaw = formData.department || "";
  const matchedDept = useMemo(() => {
    if (!currentDeptRaw) {
      return availableDepartments[0] || "Tech Team";
    }
    const found = availableDepartments.find(
      (dept) => dept.toLowerCase().trim() === currentDeptRaw.toLowerCase().trim()
    );
    return found || DEPARTMENT_NORMALIZATION_MAP[currentDeptRaw] || currentDeptRaw;
  }, [availableDepartments, currentDeptRaw]);

  const availableDesignations = useMemo(() => {
    const deptObj = Array.isArray(dbDepartments)
      ? dbDepartments.find(
          (d) => d.name?.toLowerCase().trim() === matchedDept?.toLowerCase().trim()
        )
      : null;

    if (deptObj && Array.isArray(deptObj.designations) && deptObj.designations.length > 0) {
      return deptObj.designations;
    }

    if (FALLBACK_DESIGNATIONS[matchedDept]) {
      return FALLBACK_DESIGNATIONS[matchedDept];
    }
    return formData.designation ? [formData.designation] : ["Team Member"];
  }, [dbDepartments, matchedDept, formData.designation]);

  useEffect(() => {
    if (!formData.department || formData.department !== matchedDept) {
      handleChange("department", matchedDept);
    }

    const currentDesig = formData.designation || "";
    const isDesigValid = availableDesignations.some(
      (d) => d.toLowerCase().trim() === currentDesig.toLowerCase().trim()
    );

    if (!isDesigValid && availableDesignations.length > 0) {
      handleChange("designation", availableDesignations[0]);
    }
  }, [matchedDept, availableDesignations, formData.department, formData.designation, handleChange]);

  const handleDepartmentChange = (newDept) => {
    handleChange("department", newDept);

    const deptObj = Array.isArray(dbDepartments)
      ? dbDepartments.find((d) => d.name?.toLowerCase().trim() === newDept?.toLowerCase().trim())
      : null;

    const newDesignations =
      deptObj?.designations?.length > 0
        ? deptObj.designations
        : FALLBACK_DESIGNATIONS[newDept] || [];

    if (newDesignations.length > 0 && !newDesignations.includes(formData.designation)) {
      handleChange("designation", newDesignations[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <FloatingSelect
          label="Department *"
          icon={Building2}
          value={matchedDept}
          onValueChange={handleDepartmentChange}
          placeholder={isDepartmentsLoading ? "Loading departments..." : "Select Department"}
          error={errors.department}
        >
          {isDepartmentsLoading && availableDepartments.length === 0 ? (
            <SelectItem value="loading" disabled className="text-sm">
              <span className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" /> Loading departments...
              </span>
            </SelectItem>
          ) : (
            availableDepartments.map((dept) => (
              <SelectItem key={dept} value={dept} className="text-sm">
                {dept}
              </SelectItem>
            ))
          )}
        </FloatingSelect>

        <FloatingSelect
          label="Designation / Job Title *"
          icon={Briefcase}
          value={formData.designation || availableDesignations[0] || ""}
          onValueChange={(val) => handleChange("designation", val)}
          placeholder="Select Designation"
          error={errors.designation}
        >
          {availableDesignations.map((desig) => (
            <SelectItem key={desig} value={desig} className="text-sm">
              {desig}
            </SelectItem>
          ))}
        </FloatingSelect>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        <FloatingSelect
          label="Employment Type"
          icon={Clock}
          value={formData.employmentType || "Full-Time"}
          onValueChange={(val) => handleChange("employmentType", val)}
          placeholder="Select Type"
        >
          {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
            <SelectItem
              key={type.value}
              value={type.value}
              disabled={type.disabled}
              className={`text-sm ${
                type.disabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : ""
              }`}
            >
              <span>{type.label}</span>
            </SelectItem>
          ))}
        </FloatingSelect>

        <FloatingSelect
          label="Work Location"
          icon={Compass}
          value={formData.workLocation || "On-site"}
          onValueChange={(val) => handleChange("workLocation", val)}
          placeholder="Select Location"
        >
          {WORK_LOCATION_OPTIONS.map((loc) => (
            <SelectItem
              key={loc.value}
              value={loc.value}
              disabled={loc.disabled}
              className={`text-sm ${
                loc.disabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : ""
              }`}
            >
              <span>{loc.label}</span>
            </SelectItem>
          ))}
        </FloatingSelect>

        <FloatingDatePicker
          label="Joining / Start Date"
          icon={Calendar}
          value={formData.joiningDate}
          onChange={(val) => handleChange("joiningDate", val)}
          placeholder="Select Joining Date"
          minYear={2000}
          maxYear={new Date().getFullYear() + 2}
        />
      </div>
    </div>
  );
}
