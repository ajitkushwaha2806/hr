"use client";
import ProfileFieldItem from "./profile-field-item";
import ProfileHeroHeader from "./profile-hero-header";
import ProfileSectionCard from "./profile-section-card";
import FaceCaptureCard from "@/components/ui/face-capture-card";
import {  User,  Mail,  Phone,  Building2,  Briefcase,  MapPin,  CheckCircle2,  Calendar,  CreditCard,  FileText,  HeartHandshake,  Home,  Landmark,  BadgeCheck,  Globe, AlertCircle, Shield } from "lucide-react";

export default function EmployeeProfileView({ employee, officeLocation, todayPunch, avatar, onFaceChange }) {
  const fullName = 
    employee?.name || 
    (employee?.firstName ? `${employee.firstName} ${employee.lastName || ""}`.trim() : "") ||
    "Employee";

  const empEmail = employee?.email?.trim() || "Not provided";
  const empId = employee?.employeeId?.trim() || "Not assigned";
  const empDept = employee?.department?.trim() || "Not assigned";
  const empRole = employee?.designation?.trim() || "Not assigned";
  const empPhone = employee?.phone?.trim() || "Not provided";
  const empGender = employee?.gender?.trim() || "Not specified";
  const empStatus = employee?.status?.trim() || "Active";
  const empType = employee?.employmentType?.trim() || "Not specified";
  const orgId = employee?.organizationId || officeLocation?.organizationId || "Not assigned";
  const systemRole = employee?.role === "org:admin" ? "Organization Admin" : "Team Member";

  const formatDate = (d) => {
    if (!d) return "Not specified";
    try {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return "Not specified";
      return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "Not specified";
    }
  };

  const joiningDate = employee?.joiningDate ? formatDate(employee.joiningDate) : "Not specified";
  const dateOfBirth = employee?.dateOfBirth ? formatDate(employee.dateOfBirth) : "Not specified";

  const curAddr = employee?.currentAddress || employee?.address || {};
  const currentAddressParts = [
    curAddr.street,
    curAddr.city,
    curAddr.state,
    curAddr.postalCode,
    curAddr.country
  ].filter((p) => typeof p === "string" && p.trim().length > 0);
  const currentAddressStr = currentAddressParts.length > 0 ? currentAddressParts.join(", ") : "Not provided";

  const permAddr = employee?.permanentAddress || {};
  const permAddressParts = [
    permAddr.street,
    permAddr.city,
    permAddr.state,
    permAddr.postalCode,
    permAddr.country
  ].filter((p) => typeof p === "string" && p.trim().length > 0);
  
  const permAddressStr = permAddr.sameAsCurrent 
    ? (currentAddressStr !== "Not provided" ? `${currentAddressStr} (Same as current)` : "Same as current residential address") 
    : (permAddressParts.length > 0 ? permAddressParts.join(", ") : "Not provided");

  const country = curAddr.country?.trim() || permAddr.country?.trim() || "Not specified";

  const bank = employee?.bankDetails || {};
  const bankName = bank.bankName?.trim() || "Not provided";
  const accHolder = bank.accountHolderName?.trim() || "Not provided";
  const accNumber = bank.accountNumber?.trim()
    ? (bank.accountNumber.trim().length >= 4 ? `•••• •••• ${bank.accountNumber.trim().slice(-4)}` : bank.accountNumber.trim())
    : "Not provided";
  const ifsc = bank.ifscCode?.trim() || "Not provided";
  const branch = bank.branchName?.trim() || "Not provided";
  const upiId = bank.upiId?.trim() || "Not provided";

  const docs = employee?.documents || {};
  const aadharRaw = docs.aadhar?.number?.trim();
  const aadharNum = aadharRaw 
    ? (aadharRaw.length >= 4 ? `•••• •••• ${aadharRaw.slice(-4)}` : aadharRaw) 
    : "Not provided";
  const hasAadhar = Boolean(aadharRaw);

  const panRaw = docs.pan?.number?.trim();
  const panNum = panRaw || "Not provided";
  const hasPan = Boolean(panRaw);

  const emergency = employee?.emergencyContact || {};
  const emName = emergency.name?.trim() || "Not provided";
  const emRel = emergency.relation?.trim() || "Not provided";
  const emPhone = emergency.phone?.trim() || "Not provided";

  const officeName = officeLocation?.officeName?.trim() || "Office Location";
  const radius = officeLocation?.radiusMeters;
  const officeDisplay = officeLocation 
    ? `${officeName}${radius ? ` (${radius}m geofence)` : ""}` 
    : "Not configured";

  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <ProfileHeroHeader
        fullName={fullName}
        avatarUrl={avatar || employee?.avatar}
        role={empRole}
        department={empDept}
        employeeId={empId}
        status={empStatus}
        employmentType={empType}
        lastPunchTime={todayPunch?.checkInTime}
      />

      <FaceCaptureCard
        value={avatar || employee?.avatar}
        onChange={onFaceChange}
        allowRetake={false}
        label="Live Biometric Face ID"
        description="Frontal live selfie compared via AWS Rekognition for facial attendance verification."
      />

      <ProfileSectionCard
        title="Personal & Contact Information"
        icon={User}
        tag="Basic Info"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ProfileFieldItem icon={User} label="Full Legal Name" value={fullName} />
          <ProfileFieldItem icon={Mail} label="Work Email" value={empEmail} />
          <ProfileFieldItem icon={Phone} label="Phone Number" value={empPhone} />
          <ProfileFieldItem icon={BadgeCheck} label="Gender" value={empGender} />
          <ProfileFieldItem icon={Calendar} label="Date of Birth" value={dateOfBirth} />
          <ProfileFieldItem icon={Globe} label="Country / Region" value={country} />
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Employment & Organizational Details"
        icon={Briefcase}
        tag="Job Record"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ProfileFieldItem icon={Briefcase} label="Employee ID" value={empId} isMono />
          <ProfileFieldItem icon={Building2} label="Department" value={empDept} />
          <ProfileFieldItem icon={User} label="Designation / Role" value={empRole} />
          <ProfileFieldItem icon={BadgeCheck} label="Employment Type" value={empType} />
          <ProfileFieldItem icon={Shield} label="Access Role" value={systemRole} />
          <ProfileFieldItem icon={Calendar} label="Date of Joining" value={joiningDate} />
          <ProfileFieldItem 
            icon={CheckCircle2} 
            label="Current Status" 
            value={empStatus} 
            highlightColor="text-emerald-600 dark:text-emerald-400" 
          />
          <ProfileFieldItem 
            icon={Building2} 
            label="Organization ID" 
            value={orgId} 
            isMono 
          />
          <ProfileFieldItem
            icon={MapPin}
            label="Assigned Office Location"
            value={officeDisplay}
            colSpan={2}
          />
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Address Information"
        icon={Home}
        tag="Residence"
      >
        <div className="space-y-2.5">
          <ProfileFieldItem 
            icon={Home} 
            label="Current Residential Address" 
            value={currentAddressStr} 
          />
          <ProfileFieldItem 
            icon={Landmark} 
            label="Permanent Address" 
            value={permAddressStr} 
          />
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Bank & Salary Payout Details"
        icon={Landmark}
        tag="Direct Deposit"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ProfileFieldItem icon={User} label="Account Holder Name" value={accHolder} />
          <ProfileFieldItem icon={Landmark} label="Bank Name" value={bankName} />
          <ProfileFieldItem icon={CreditCard} label="Bank Account Number" value={accNumber} isMono />
          <ProfileFieldItem icon={BadgeCheck} label="IFSC Code" value={ifsc} isMono />
          <ProfileFieldItem icon={Building2} label="Branch Name" value={branch} />
          <ProfileFieldItem icon={CreditCard} label="UPI ID" value={upiId} isMono />
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Identification & KYC Documents"
        icon={FileText}
        tag="Govt ID Record"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ProfileFieldItem
            icon={FileText}
            label="Aadhaar Card Number"
            value={aadharNum}
            isMono
            badge={
              hasAadhar ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Identity Verified
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-2.5 h-2.5" /> Pending Upload
                </span>
              )
            }
          />
          <ProfileFieldItem
            icon={FileText}
            label="Permanent Account Number (PAN)"
            value={panNum}
            isMono
            badge={
              hasPan ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Tax Record Active
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-2.5 h-2.5" /> Pending Upload
                </span>
              )
            }
          />
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Emergency Contact Information"
        icon={HeartHandshake}
        tag="Primary Contact"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <ProfileFieldItem icon={User} label="Contact Name" value={emName} />
          <ProfileFieldItem icon={HeartHandshake} label="Relationship" value={emRel} />
          <ProfileFieldItem icon={Phone} label="Contact Phone" value={emPhone} />
        </div>
      </ProfileSectionCard>
    </div>
  );
}
