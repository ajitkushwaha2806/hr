"use client";
import { useState, useEffect } from "react";
import { User, X } from "lucide-react";
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
      isTeamLead: false,
      teamLeads: [],
      city: "",
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      upiId: "",
    };
  }

  // Extract initial teamLeads array
  const initialTeamLeads = [];
  if (Array.isArray(employee.teamLeads) && employee.teamLeads.length > 0) {
    employee.teamLeads.forEach((tl) => {
      const id = (tl?._id || tl)?.toString();
      if (id && !initialTeamLeads.includes(id)) initialTeamLeads.push(id);
    });
  } else if (employee.teamLead) {
    const id = (employee.teamLead?._id || employee.teamLead)?.toString();
    if (id && !initialTeamLeads.includes(id)) initialTeamLeads.push(id);
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
    isTeamLead: Boolean(employee.isTeamLead || employee.role === "TEAM_LEAD"),
    teamLeads: initialTeamLeads,
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
  const [teamLeads, setTeamLeads] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      fetch("/api/employees?teamLeads=true")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.success && Array.isArray(data.data)) {
            setTeamLeads(data.data);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

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

  const handleAddTeamLead = (leadId) => {
    if (!leadId || leadId === "placeholder") return;
    setFormData((prev) => {
      const current = Array.isArray(prev.teamLeads) ? prev.teamLeads : [];
      if (current.includes(leadId)) return prev;
      return {
        ...prev,
        teamLeads: [...current, leadId],
      };
    });
  };

  const handleRemoveTeamLead = (leadId) => {
    setFormData((prev) => ({
      ...prev,
      teamLeads: (Array.isArray(prev.teamLeads) ? prev.teamLeads : []).filter((id) => id !== leadId),
    }));
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
      isTeamLead: Boolean(formData.isTeamLead),
      teamLeads: formData.teamLeads || [],
      teamLead: (formData.teamLeads && formData.teamLeads[0]) || null,
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
        <SheetHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border/40 shrink-0">
          <SheetTitle className="text-base sm:text-lg font-bold text-foreground">
            {isEditMode ? "Edit Employee Profile" : "Onboard New Employee"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-0.5">
            {isEditMode
              ? "Update employee job details, contact info, and status"
              : "Fill in the details to add a new team member to your organization"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
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

            {/* Team Hierarchy & Leadership */}
            <div className="space-y-3.5 pt-3 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Team Hierarchy & Permissions
              </span>
              <div className="p-3.5 rounded-md border border-border/60 bg-muted/20 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isTeamLead)}
                    onChange={(e) => handleChange("isTeamLead", e.target.checked)}
                    className="mt-0.5 size-4 rounded-md border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      Designate as Team Lead (TL)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Grants TL permissions to monitor attendance logs and review leave requests for assigned team members.
                    </span>
                  </div>
                </label>

                {/* Reports To (Team Leads) with Multiple TL Support */}
                <div className="space-y-2 pt-2.5 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Reports To (Team Leads)</Label>
                    <span className="text-[10px] text-muted-foreground">
                      {formData.teamLeads?.length || 0} assigned
                    </span>
                  </div>

                  {/* Selected Team Leads Badges */}
                  {formData.teamLeads?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-background border border-border/60">
                      {formData.teamLeads.map((tlId) => {
                        const found = teamLeads.find((t) => (t._id || t.id) === tlId);
                        const getTLName = (item) => {
                          if (!item) return null;
                          if (item.name) return item.name;
                          const fn = `${item.firstName || ""} ${item.lastName || ""}`.trim();
                          if (fn) return fn;
                          return item.email || null;
                        };

                        const name =
                          getTLName(found) ||
                          (employee?.teamLead?._id === tlId ? getTLName(employee.teamLead) : null) ||
                          (Array.isArray(employee?.teamLeads) &&
                            getTLName(employee.teamLeads.find((t) => (t._id || t) === tlId))) ||
                          "Team Lead";

                        const designation = found?.designation || "";

                        return (
                          <span
                            key={tlId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                          >
                            <User className="size-3 shrink-0" />
                            <span className="font-semibold">{name}</span>
                            {designation && (
                              <span className="text-[10px] opacity-75 hidden sm:inline">
                                ({designation})
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamLead(tlId)}
                              className="size-3.5 rounded-full hover:bg-primary/20 flex items-center justify-center cursor-pointer ml-0.5"
                              title={`Remove ${name}`}
                            >
                              <X className="size-2.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-md bg-muted/30 border border-dashed border-border/60 text-xs text-muted-foreground italic">
                      None (Reports directly to Admin / Management)
                    </div>
                  )}

                  {/* Dropdown to add another Team Lead */}
                  <Select
                    value="placeholder"
                    onValueChange={(val) => {
                      if (val && val !== "placeholder") {
                        handleAddTeamLead(val);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="+ Assign a Team Lead..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 z-[100] w-(--anchor-width) min-w-[280px]">
                      <SelectItem value="placeholder" disabled className="text-xs text-muted-foreground">
                        Select a Team Lead to add...
                      </SelectItem>
                      {teamLeads
                        .filter((tl) => !employee?._id || tl._id !== employee._id)
                        .map((tl) => {
                          const isAssigned = formData.teamLeads?.includes(tl._id);
                          return (
                            <SelectItem
                              key={tl._id}
                              value={tl._id}
                              disabled={isAssigned}
                              className="text-xs cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full gap-3 py-0.5">
                                <div className="flex flex-col text-left">
                                  <span className="font-semibold text-foreground flex items-center gap-1">
                                    {tl.name || `${tl.firstName || ""} ${tl.lastName || ""}`.trim() || tl.email || "Team Lead"}
                                    {tl.isTeamLead && (
                                      <span className="ml-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                                        TL
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10.5px] text-muted-foreground">
                                    {tl.department || "General"} · {tl.designation || "Lead"} · {tl.employeeId || ""}
                                  </span>
                                </div>
                                {isAssigned && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Assigned
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>

                  <span className="text-[10.5px] text-muted-foreground block">
                    Leave request emails from this employee will route only to these designated TLs and company Admins.
                  </span>
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
