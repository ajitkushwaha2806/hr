"use client";

import { useEffect } from "react";
import { Building2, Briefcase, Clock, Compass, Calendar } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { FloatingDatePicker } from "@/components/ui/date-picker";
import {
  DEPARTMENTS,
  WORK_LOCATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  DEPARTMENT_DESIGNATIONS,
  DEPARTMENT_NORMALIZATION_MAP,
  DESIGNATION_NORMALIZATION_MAP,
} from "../../constants";
import FloatingSelect from "../floating-select";

export default function Step2Role({ formData, handleChange, errors = {} }) {
  const normalizedDept =
    DEPARTMENT_NORMALIZATION_MAP[formData.department] ||
    formData.department ||
    "Digital Team";

  const availableDesignations =
    DEPARTMENT_DESIGNATIONS[normalizedDept] ||
    DEPARTMENT_DESIGNATIONS["Digital Team"] ||
    [];

  const rawDesig = formData.designation || "";
  const normalizedDesig =
    DESIGNATION_NORMALIZATION_MAP[rawDesig] ||
    (availableDesignations.includes(rawDesig) ? rawDesig : availableDesignations[0] || "");

  useEffect(() => {
    if (formData.department && formData.department !== normalizedDept) {
      handleChange("department", normalizedDept);
    }
    if (formData.designation && formData.designation !== normalizedDesig) {
      handleChange("designation", normalizedDesig);
    }
  }, [formData.department, formData.designation, normalizedDept, normalizedDesig, handleChange]);

  const handleDepartmentChange = (newDept) => {
    const cleanDept = DEPARTMENT_NORMALIZATION_MAP[newDept] || newDept;
    handleChange("department", cleanDept);
    const designations = DEPARTMENT_DESIGNATIONS[cleanDept] || [];
    if (!designations.includes(formData.designation)) {
      handleChange("designation", designations[0] || "");
    }
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <FloatingSelect
          label="Department *"
          icon={Building2}
          value={normalizedDept}
          onValueChange={handleDepartmentChange}
          placeholder="Select Department"
          error={errors.department}
        >
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept} value={dept} className="text-sm">
              {dept}
            </SelectItem>
          ))}
        </FloatingSelect>

        <FloatingSelect
          label="Designation / Job Title *"
          icon={Briefcase}
          value={normalizedDesig}
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
          value={formData.employmentType}
          onValueChange={(val) => handleChange("employmentType", val)}
          placeholder="Select Type"
        >
          {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
            <SelectItem
              key={type.value}
              value={type.value}
              disabled={type.disabled}
              className={`text-sm ${type.disabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : ""}`}
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
              className={`text-sm ${loc.disabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : ""}`}
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
