"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/global/loader";
import { DatePicker } from "@/components/ui/date-picker";
import useNotification from "@/store/hooks/useNotification";
import { useDepartments } from "@/store/hooks/useDepartments";
import { NOTIFICATION_MESSAGES } from "@/constants/notification";
import { DEPARTMENTS, EMPLOYMENT_TYPES } from "../../helpers/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";



function getEmployeeFormData(employee) {
  if (!employee) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeId: "",
      department: "Engineering",
      designation: "",
      employmentType: "Full-Time",
      status: "Active",
      joiningDate: new Date().toISOString().split("T")[0],
      salary: "",
      city: "",
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      upiId: "",
    };
  }

  return {
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    email: employee.email || "",
    phone: employee.phone || "",
    employeeId: employee.employeeId || "",
    department: employee.department || "Engineering",
    designation: employee.designation || "",
    employmentType: employee.employmentType || "Full-Time",
    status: employee.status || "Active",
    joiningDate: employee.joiningDate
      ? new Date(employee.joiningDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    salary: employee.salary != null ? String(employee.salary) : "",
    city: employee.address?.city || "",
    bankName: employee.bankDetails?.bankName || "",
    accountHolderName: employee.bankDetails?.accountHolderName || "",
    accountNumber: employee.bankDetails?.accountNumber || "",
    ifscCode: employee.bankDetails?.ifscCode || "",
    branchName: employee.bankDetails?.branchName || "",
    upiId: employee.bankDetails?.upiId || "",
  };
}

export default function EmployeeFormSheet({ isOpen, onClose, employee, onSave, isLoading }) {
  const isEditMode = Boolean(employee);
  const notify = useNotification();
  const { departments: dbDepartments = [] } = useDepartments();

  const [formData, setFormData] = useState(() => getEmployeeFormData(employee));
  const [prevKey, setPrevKey] = useState("");
  const [errors, setErrors] = useState({});

  const availableDepts = dbDepartments.length > 0 ? dbDepartments.map((d) => d.name) : DEPARTMENTS;
  const currentDeptObj = dbDepartments.find(
    (d) => d.name?.toLowerCase().trim() === (formData.department || "").toLowerCase().trim()
  );
  const availableDesignations = currentDeptObj?.designations || [];


  const currentKey = `${employee?._id || "new"}_${isOpen ? "open" : "closed"}`;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setFormData(getEmployeeFormData(employee));
    setErrors({});
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    if (!formData.designation.trim()) errs.designation = "Job title/designation is required";
    if (!formData.department) errs.department = "Department is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notify.warning(NOTIFICATION_MESSAGES.EMPLOYEE.VALIDATION_ERROR);
      return;
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      employeeId: formData.employeeId.trim() || undefined,
      department: formData.department,
      designation: formData.designation.trim(),
      employmentType: formData.employmentType,
      status: formData.status,
      joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : new Date(),
      salary: formData.salary ? Number(formData.salary) : 0,
      address: {
        city: formData.city.trim(),
      },
      bankDetails: {
        bankName: formData.bankName.trim(),
        accountHolderName: formData.accountHolderName.trim() || `${formData.firstName} ${formData.lastName}`.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        branchName: formData.branchName.trim(),
        upiId: formData.upiId.trim(),
      },
    };

    await onSave(payload);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col bg-white dark:bg-zinc-950 border-l border-border/50 shadow-2xl"
      >
        <SheetHeader className="px-6 py-5 border-b border-border/40 shrink-0">
          <SheetTitle className="text-lg font-bold text-foreground">
            {isEditMode ? "Edit Employee Profile" : "Onboard New Employee"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-0.5">
            {isEditMode
              ? "Update employee job details, contact info, and status"
              : "Fill in the details to add a new team member to your organization"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Basic Info */}
            <div className="space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Personal Information
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">First Name *</Label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="h-9 text-xs"
                  />
                  {errors.firstName && (
                    <span className="text-[11px] text-destructive">{errors.firstName}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Last Name *</Label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="h-9 text-xs"
                  />
                  {errors.lastName && (
                    <span className="text-[11px] text-destructive">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Work Email *</Label>
                  <Input
                    type="email"
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-9 text-xs"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-destructive">{errors.email}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-9 text-xs"
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-destructive">{errors.phone}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-3 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Job & Organization
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Employee ID (Optional)</Label>
                  <Input
                    placeholder="EMP-1001 (auto if empty)"
                    value={formData.employeeId}
                    onChange={(e) => handleChange("employeeId", e.target.value)}
                    className="h-9 text-xs uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(val) => handleChange("department", val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepts.map((dept) => (
                        <SelectItem key={dept} value={dept} className="text-xs">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Job Designation *</Label>
                  <Input
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.designation}
                    onChange={(e) => handleChange("designation", e.target.value)}
                    className="h-9 text-xs"
                  />
                  {availableDesignations.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {availableDesignations.map((desig) => (
                        <button
                          key={desig}
                          type="button"
                          onClick={() => handleChange("designation", desig)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                            formData.designation === desig
                              ? "bg-primary text-primary-foreground border-primary font-semibold"
                              : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted"
                          }`}
                        >
                          {desig}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.designation && (
                    <span className="text-[11px] text-destructive">{errors.designation}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(val) => handleChange("employmentType", val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-xs">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleChange("status", val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active" className="text-xs">Active</SelectItem>
                      <SelectItem value="Probation" className="text-xs">Probation</SelectItem>
                      <SelectItem value="On Leave" className="text-xs">On Leave</SelectItem>
                      <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date of Joining</Label>
                  <DatePicker
                    value={formData.joiningDate}
                    onChange={(val) => handleChange("joiningDate", val)}
                    placeholder="Select date of joining"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Compensation & Location */}
            <div className="space-y-3.5 pt-3 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Compensation & Location
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Annual Salary / CTC (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1200000"
                    value={formData.salary}
                    onChange={(e) => handleChange("salary", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Work Location / City</Label>
                  <Input
                    placeholder="e.g. Bengaluru, Remote"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-3.5 pt-3 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Bank & Settlement Details
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bank Name</Label>
                  <Input
                    placeholder="e.g. HDFC Bank, SBI"
                    value={formData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Account Holder Name</Label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={formData.accountHolderName}
                    onChange={(e) => handleChange("accountHolderName", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Account Number</Label>
                  <Input
                    placeholder="e.g. 123456789012"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange("accountNumber", e.target.value.replace(/\D/g, ""))}
                    className="h-9 text-xs font-mono"
                    maxLength={18}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">IFSC Code</Label>
                  <Input
                    placeholder="e.g. HDFC0001234"
                    value={formData.ifscCode}
                    onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase().trim())}
                    className="h-9 text-xs uppercase font-mono"
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Branch Name (Optional)</Label>
                  <Input
                    placeholder="e.g. Koramangala"
                    value={formData.branchName}
                    onChange={(e) => handleChange("branchName", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">UPI ID (Optional)</Label>
                  <Input
                    placeholder="e.g. user@okhdfcbank"
                    value={formData.upiId}
                    onChange={(e) => handleChange("upiId", e.target.value.trim().toLowerCase())}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 text-xs rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-9 text-xs rounded-md font-semibold px-4 gap-1.5"
            >
              {isLoading && <Spinner size="xs" className="mr-1" />}
              <span>{isEditMode ? "Save Changes" : "Onboard Employee"}</span>
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
