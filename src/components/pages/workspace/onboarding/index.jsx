"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useOnboarding } from "@/store/hooks/useOnboarding";
import { DEPARTMENTS, EMPLOYMENT_TYPES } from "../employee/helpers/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles,
  Edit3,
} from "lucide-react";

export default function EmployeeOnboarding() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, employee, isOnboarded, isLoading, isSubmitting, submitOnboarding } = useOnboarding();

  const [activeStep, setActiveStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Prefer not to say",
    dateOfBirth: "",
    department: "Engineering",
    designation: "",
    employmentType: "Full-Time",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
  });

  const [errors, setErrors] = useState({});

  // Sync initial form values from user/employee
  useEffect(() => {
    if (user || employee) {
      const nameParts = (employee?.name || user?.name || "").trim().split(" ");
      const fName = employee?.firstName || nameParts[0] || "";
      const lName = employee?.lastName || nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: fName,
        lastName: lName,
        email: employee?.email || user?.email || "",
        phone: employee?.phone || user?.phone || "",
        gender: employee?.gender || "Prefer not to say",
        dateOfBirth: employee?.dateOfBirth
          ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
          : "",
        department: employee?.department || "Engineering",
        designation: employee?.designation || "",
        employmentType: employee?.employmentType || "Full-Time",
        street: employee?.address?.street || "",
        city: employee?.address?.city || "",
        state: employee?.address?.state || "",
        postalCode: employee?.address?.postalCode || "",
        emergencyName: employee?.emergencyContact?.name || "",
        emergencyRelation: employee?.emergencyContact?.relation || "",
        emergencyPhone: employee?.emergencyContact?.phone || "",
      });
    }
  }, [user, employee]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.firstName.trim()) errs.firstName = "First name is required";
      if (!formData.lastName.trim()) errs.lastName = "Last name is required";
      if (!formData.phone.trim()) errs.phone = "Phone number is required";
    } else if (step === 2) {
      if (!formData.department) errs.department = "Department is required";
      if (!formData.designation.trim()) errs.designation = "Job designation is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        department: formData.department,
        designation: formData.designation.trim(),
        employmentType: formData.employmentType,
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: "India",
        },
        emergencyContact: {
          name: formData.emergencyName.trim(),
          relation: formData.emergencyRelation.trim(),
          phone: formData.emergencyPhone.trim(),
        },
      };

      await submitOnboarding(payload);
      setIsEditing(false);
    } catch {
      // Handled in hook
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/sign-in" });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Checking employee onboarding status...</p>
      </div>
    );
  }

  // Already Onboarded View (and not currently editing)
  if (isOnboarded && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 text-white border border-border/40 shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-9 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Onboarding Completed
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/20 text-primary-foreground border border-primary/30">
                    Role: {user?.role || "EMPLOYEE"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mt-1.5 tracking-tight">
                  Welcome aboard, {employee?.name || user?.name}!
                </h1>
                <p className="text-sm text-zinc-300 mt-1">
                  Your employee profile is active. You have full self-service access to HR tools.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 font-medium"
              >
                <Edit3 className="size-3.5 mr-1.5" />
                Update Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-zinc-300 hover:text-white hover:bg-white/10 text-xs h-9"
              >
                <LogOut className="size-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border/50 shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="size-20 rounded-full bg-gradient-to-tr from-primary/20 to-primary/40 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
              {(employee?.firstName?.[0] || user?.name?.[0] || "E").toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {employee?.name || user?.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {employee?.designation || "Employee"}
              </p>
              <span className="inline-block mt-2 font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                {employee?.employeeId || "EMP-XXXX"}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-border/40 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold text-foreground">{employee?.department || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-semibold text-foreground">{employee?.employmentType || "Full-Time"}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {employee?.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border/50 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Employee Contact & Work Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Mail className="size-3.5 text-primary" /> Email Address
                  </span>
                  <p className="font-semibold text-foreground truncate">{employee?.email || user?.email}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Phone className="size-3.5 text-primary" /> Phone Number
                  </span>
                  <p className="font-semibold text-foreground">{employee?.phone || "—"}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <MapPin className="size-3.5 text-primary" /> Location
                  </span>
                  <p className="font-semibold text-foreground">
                    {[employee?.address?.city, employee?.address?.state].filter(Boolean).join(", ") || "Office / Remote"}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <HeartHandshake className="size-3.5 text-primary" /> Emergency Contact
                  </span>
                  <p className="font-semibold text-foreground">
                    {employee?.emergencyContact?.name
                      ? `${employee.emergencyContact.name} (${employee.emergencyContact.relation || "Contact"}) - ${employee.emergencyContact.phone || ""}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => router.push("/employees")}
                className="h-10 text-xs font-semibold rounded-xl px-5 gap-2 cursor-pointer shadow-sm"
              >
                <span>View Employee Directory</span>
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="h-10 text-xs font-semibold rounded-xl px-5 border-border/60"
              >
                <span>Go to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-step Onboarding Form View
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <Sparkles className="size-3.5" />
            <span>Employee Onboarding</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Welcome, {user?.name || "Team Member"}!
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Every registered user starts as an <strong>Employee</strong>. Complete your profile details below to finalize onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold text-foreground border border-border/60">
            Role: {user?.role || "EMPLOYEE"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <LogOut className="size-3.5 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStep === 1
              ? "border-primary bg-primary/5 text-primary shadow-2xs"
              : "border-border/50 bg-white dark:bg-zinc-900 text-muted-foreground hover:border-border"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider">Step 1</div>
          <div className="text-xs font-semibold mt-0.5">Personal Info</div>
        </button>

        <button
          type="button"
          onClick={() => {
            if (validateStep(1)) setActiveStep(2);
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStep === 2
              ? "border-primary bg-primary/5 text-primary shadow-2xs"
              : "border-border/50 bg-white dark:bg-zinc-900 text-muted-foreground hover:border-border"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider">Step 2</div>
          <div className="text-xs font-semibold mt-0.5">Role & Department</div>
        </button>

        <button
          type="button"
          onClick={() => {
            if (validateStep(1) && validateStep(2)) setActiveStep(3);
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStep === 3
              ? "border-primary bg-primary/5 text-primary shadow-2xs"
              : "border-border/50 bg-white dark:bg-zinc-900 text-muted-foreground hover:border-border"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider">Step 3</div>
          <div className="text-xs font-semibold mt-0.5">Address & Emergency</div>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border/50 shadow-xs space-y-6">
        {/* Step 1: Personal Info */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-border/40 pb-3">
              <h2 className="text-base font-bold text-foreground">Personal Information</h2>
              <p className="text-xs text-muted-foreground">Enter your basic identification details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">First Name *</Label>
                <Input
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="h-9.5 text-xs"
                />
                {errors.firstName && <span className="text-[11px] text-destructive">{errors.firstName}</span>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Last Name *</Label>
                <Input
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="h-9.5 text-xs"
                />
                {errors.lastName && <span className="text-[11px] text-destructive">{errors.lastName}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address (Registered)</Label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-9.5 text-xs bg-muted/40 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="h-9.5 text-xs"
                />
                {errors.phone && <span className="text-[11px] text-destructive">{errors.phone}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => handleChange("gender", val)}>
                  <SelectTrigger className="h-9.5 text-xs">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="text-xs">Male</SelectItem>
                    <SelectItem value="Female" className="text-xs">Female</SelectItem>
                    <SelectItem value="Non-Binary" className="text-xs">Non-Binary</SelectItem>
                    <SelectItem value="Prefer not to say" className="text-xs">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="h-9.5 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Role & Department */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-border/40 pb-3">
              <h2 className="text-base font-bold text-foreground">Work & Organizational Details</h2>
              <p className="text-xs text-muted-foreground">Select your assigned team, department, and job title.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department *</Label>
                <Select value={formData.department} onValueChange={(val) => handleChange("department", val)}>
                  <SelectTrigger className="h-9.5 text-xs">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <span className="text-[11px] text-destructive">{errors.department}</span>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Job Designation *</Label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  className="h-9.5 text-xs"
                />
                {errors.designation && <span className="text-[11px] text-destructive">{errors.designation}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(val) => handleChange("employmentType", val)}>
                  <SelectTrigger className="h-9.5 text-xs">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">System Role</Label>
                <Input
                  value="EMPLOYEE (Self-Service)"
                  disabled
                  className="h-9.5 text-xs bg-muted/40 cursor-not-allowed font-medium"
                />
                <span className="text-[11px] text-muted-foreground">
                  Default role assigned to all registered employees.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Address & Emergency */}
        {activeStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-border/40 pb-3">
              <h2 className="text-base font-bold text-foreground">Address & Emergency Contact</h2>
              <p className="text-xs text-muted-foreground">Keep your emergency contacts and residence up to date.</p>
            </div>

            <div className="space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Residential Address
              </span>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Street Address</Label>
                <Input
                  placeholder="Flat No, Building, Street"
                  value={formData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  className="h-9.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    placeholder="Bengaluru"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="h-9.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">State</Label>
                  <Input
                    placeholder="Karnataka"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="h-9.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Postal Code</Label>
                  <Input
                    placeholder="560001"
                    value={formData.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    className="h-9.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-3 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Emergency Contact
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Contact Name</Label>
                  <Input
                    placeholder="e.g. Sarah Doe"
                    value={formData.emergencyName}
                    onChange={(e) => handleChange("emergencyName", e.target.value)}
                    className="h-9.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Relationship</Label>
                  <Input
                    placeholder="e.g. Spouse / Parent"
                    value={formData.emergencyRelation}
                    onChange={(e) => handleChange("emergencyRelation", e.target.value)}
                    className="h-9.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Emergency Phone</Label>
                  <Input
                    placeholder="+91 98765 00000"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                    className="h-9.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div>
            {activeStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="h-9.5 text-xs rounded-xl px-4"
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-9.5 text-xs rounded-xl"
              >
                Cancel
              </Button>
            )}

            {activeStep < 3 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="h-9.5 text-xs font-semibold rounded-xl px-5 gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9.5 text-xs font-semibold rounded-xl px-6 gap-2 shadow-sm"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>Complete Onboarding</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
