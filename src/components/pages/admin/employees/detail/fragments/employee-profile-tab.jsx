"use client";
import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  User,
  Briefcase,
  Landmark,
  ShieldCheck,
  FileText,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  AlertCircle,
  Phone,
} from "lucide-react";
import { EmployeeStatusBadge, DepartmentBadge, EmploymentTypeBadge, TeamLeadBadge } from "../../helpers/badges";

export function EmployeeProfileTab({ employee }) {
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "MMMM dd, yyyy");
    } catch {
      return String(d);
    }
  };

  const formatDateTime = (d) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "MMM dd, yyyy · hh:mm a");
    } catch {
      return String(d);
    }
  };

  const age = useMemo(() => {
    if (!employee?.dateOfBirth) return null;
    try {
      const birth = new Date(employee.dateOfBirth);
      if (isNaN(birth.getTime())) return null;
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      return calculatedAge > 0 ? calculatedAge : null;
    } catch {
      return null;
    }
  }, [employee.dateOfBirth]);

  const bank = employee.bankDetails || {};
  const currentAddr = employee.currentAddress || employee.address || {};
  const permanentAddr = employee.permanentAddress || {};
  const emergency = employee.emergencyContact || {};
  const docs = employee.documents || {};
  const nda = employee.nda || {};

  const isSameAddress = permanentAddr.sameAsCurrent;

  return (
    <div className="space-y-6">
      {/* 2-column or 3-column layout of all A-Z sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Personal Information */}
        <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-2 border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <User className="size-4 text-primary shrink-0" />
              Personal Information
            </h3>
            <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md shrink-0">
              {employee.gender || "Not specified"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <InfoItem label="First Name" value={employee.firstName} />
            <InfoItem label="Last Name" value={employee.lastName} />
            <InfoItem
              label="Email Address"
              value={employee.email}
              isCopyable
              onCopy={() => handleCopy(employee.email, "email")}
              isCopied={copiedKey === "email"}
            />
            <InfoItem
              label="Phone Number"
              value={employee.phone}
              isCopyable
              onCopy={() => handleCopy(employee.phone, "phone")}
              isCopied={copiedKey === "phone"}
            />
            <InfoItem
              label="Date of Birth"
              value={
                employee.dateOfBirth
                  ? `${formatDate(employee.dateOfBirth)} ${age ? `(${age} years)` : ""}`
                  : "—"
              }
            />
            <InfoItem label="Gender" value={employee.gender || "—"} />
            <InfoItem label="System Role" value={employee.role || "org:member"} />
            <InfoItem
              label="Clerk Auth ID"
              value={employee.clerkId ? `${employee.clerkId.slice(0, 16)}...` : "Unlinked"}
            />
          </div>
        </div>

        {/* Section 2: Employment & Compensation */}
        <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-2 border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Briefcase className="size-4 text-primary shrink-0" />
              Employment & Role Details
            </h3>
            <div className="shrink-0">
              <EmployeeStatusBadge status={employee.status || "Active"} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <InfoItem
              label="Employee ID"
              value={employee.employeeId}
              isCopyable
              onCopy={() => handleCopy(employee.employeeId, "empId")}
              isCopied={copiedKey === "empId"}
              badgeClass="font-mono font-bold text-foreground"
            />
            <InfoItem label="Designation" value={employee.designation} />
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Department</span>
              <DepartmentBadge department={employee.department || "General"} />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Employment Type</span>
              <EmploymentTypeBadge type={employee.employmentType || "Full-Time"} />
            </div>
            <InfoItem label="Joining Date" value={formatDate(employee.joiningDate)} />
            <InfoItem
              label="Monthly Casual Leaves Quota"
              value={`${employee.monthlyCasualLeavesQuota || 4} days / month`}
            />
            <InfoItem
              label="Leadership Role"
              value={
                employee.isTeamLead || employee.role === "TEAM_LEAD" ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-violet-700 dark:text-violet-400">
                    <TeamLeadBadge /> Team Lead
                  </span>
                ) : (
                  "Team Member"
                )
              }
            />
            <InfoItem
              label="Reporting Team Leads"
              value={
                Array.isArray(employee.teamLeads) && employee.teamLeads.length > 0
                  ? employee.teamLeads
                      .map((tl) => (typeof tl === "object" ? tl.name || `${tl.firstName || ""} ${tl.lastName || ""}`.trim() : "Team Lead"))
                      .filter(Boolean)
                      .join(", ")
                  : employee.teamLead
                  ? (typeof employee.teamLead === "object"
                      ? employee.teamLead.name || `${employee.teamLead.firstName || ""} ${employee.teamLead.lastName || ""}`.trim()
                      : "Assigned Team Lead")
                  : "Direct Admin / Management"
              }
            />
            <InfoItem
              label="Base Salary"
              value={
                employee.salary
                  ? `₹ ${Number(employee.salary).toLocaleString("en-IN")}`
                  : "Not set"
              }
            />
            <InfoItem
              label="Biometric Face Enrolled"
              value={employee.avatar ? "Enrolled (Photo on file)" : "Not Enrolled"}
              valueClass={employee.avatar ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-amber-600"}
            />
          </div>
        </div>

        {/* Section 3: Bank & Financial Details */}
        <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-2 border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Landmark className="size-4 text-primary shrink-0" />
              Bank & Salary Account
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono shrink-0">
              {bank.ifscCode || "IFSC Not Set"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <InfoItem label="Bank Name" value={bank.bankName || "—"} />
            <InfoItem label="Account Holder Name" value={bank.accountHolderName || "—"} />

            {/* Account Number with view/hide & copy */}
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Account Number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-foreground">
                  {bank.accountNumber
                    ? showAccountNumber
                      ? bank.accountNumber
                      : `•••• •••• ${bank.accountNumber.slice(-4)}`
                    : "—"}
                </span>
                {bank.accountNumber && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title={showAccountNumber ? "Hide" : "Show Account Number"}
                    >
                      {showAccountNumber ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(bank.accountNumber, "accNo")}
                      className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedKey === "accNo" ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <InfoItem
              label="IFSC Code"
              value={bank.ifscCode}
              isCopyable
              onCopy={() => handleCopy(bank.ifscCode, "ifsc")}
              isCopied={copiedKey === "ifsc"}
              badgeClass="font-mono"
            />
            <InfoItem label="Branch Name" value={bank.branchName || "—"} />
            <InfoItem
              label="UPI ID"
              value={bank.upiId}
              isCopyable
              onCopy={() => handleCopy(bank.upiId, "upi")}
              isCopied={copiedKey === "upi"}
            />
          </div>
        </div>

        {/* Section 4: Emergency Contact */}
        <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-1 border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <HeartHandshake className="size-4 text-primary shrink-0" />
              Emergency Contact
            </h3>
            <span className="text-xs text-muted-foreground shrink-0">In case of incident</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <InfoItem label="Contact Person Name" value={emergency.name || "—"} />
            <InfoItem label="Relationship" value={emergency.relation || "—"} />
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Phone Number</span>
              {emergency.phone ? (
                <a
                  href={`tel:${emergency.phone}`}
                  className="font-medium text-primary hover:underline flex items-center gap-1.5"
                >
                  <Phone className="size-3" />
                  <span>{emergency.phone}</span>
                </a>
              ) : (
                <span className="text-muted-foreground italic">Not provided</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Addresses (Current & Permanent) */}
      <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-2 border-b border-border/50 pb-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-primary shrink-0" />
            Residential Addresses
          </h3>
          {isSameAddress && (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              Permanent Address same as Current
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Current Address */}
          <div className="p-3.5 rounded-md border border-border/50 bg-muted/20 space-y-2">
            <span className="font-semibold text-xs text-foreground block">Current / Present Address</span>
            <div className="space-y-1 text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">{currentAddr.street || "Street not specified"}</p>
              <p>
                {[currentAddr.city, currentAddr.state, currentAddr.postalCode]
                  .filter(Boolean)
                  .join(", ") || "City / State not specified"}
              </p>
              <p>{currentAddr.country || "India"}</p>
            </div>
          </div>

          {/* Permanent Address */}
          <div className="p-3.5 rounded-md border border-border/50 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-foreground block">Permanent Address</span>
              {isSameAddress && (
                <span className="text-[10px] text-muted-foreground italic">(Same as current)</span>
              )}
            </div>
            <div className="space-y-1 text-muted-foreground leading-relaxed">
              {isSameAddress ? (
                <>
                  <p className="font-medium text-foreground">{currentAddr.street || "—"}</p>
                  <p>
                    {[currentAddr.city, currentAddr.state, currentAddr.postalCode]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                  <p>{currentAddr.country || "India"}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">{permanentAddr.street || "Street not specified"}</p>
                  <p>
                    {[permanentAddr.city, permanentAddr.state, permanentAddr.postalCode]
                      .filter(Boolean)
                      .join(", ") || "City / State not specified"}
                  </p>
                  <p>{permanentAddr.country || "India"}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Uploaded Documents */}
      <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-1.5 border-b border-border/50 pb-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary shrink-0" />
            Verification & Identity Documents
          </h3>
          <span className="text-xs text-muted-foreground">Identity & Education certificates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aadhar Card */}
          <DocumentCard
            title="Aadhar Card"
            number={docs.aadhar?.number}
            frontUrl={docs.aadhar?.frontUrl}
            backUrl={docs.aadhar?.backUrl}
            onPreview={setPreviewDoc}
          />

          {/* PAN Card */}
          <DocumentCard
            title="PAN Card"
            number={docs.pan?.number}
            fileUrl={docs.pan?.fileUrl}
            onPreview={setPreviewDoc}
          />

          {/* 10th Result */}
          <DocumentCard
            title="10th Marksheet"
            number={docs.tenthResult?.rollNumber ? `Roll: ${docs.tenthResult.rollNumber}` : null}
            fileUrl={docs.tenthResult?.fileUrl}
            onPreview={setPreviewDoc}
          />

          {/* 12th Result */}
          <DocumentCard
            title="12th Marksheet"
            number={docs.twelfthResult?.rollNumber ? `Roll: ${docs.twelfthResult.rollNumber}` : null}
            fileUrl={docs.twelfthResult?.fileUrl}
            onPreview={setPreviewDoc}
          />
        </div>
      </div>

      {/* Section 7: NDA & Legal Agreement */}
      <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-2.5 border-b border-border/50 pb-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>Non-Disclosure Agreement (NDA) & Legal</span>
          </h3>
          {nda.isSigned ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shrink-0">
              <CheckCircle2 className="size-3.5 shrink-0" /> Signed & Legally Executed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <AlertCircle className="size-3.5 shrink-0" /> Pending Signature
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <InfoItem label="Signer Name" value={nda.signerName || "—"} />
          <InfoItem label="Signed On" value={formatDateTime(nda.signedAt)} />
          <InfoItem label="Agreement Version" value={`v${nda.version || "1.0"}`} />
          <InfoItem label="Signature Type" value={nda.signatureType || "Digital"} />
        </div>

        {/* Signature & Document links */}
        {(nda.signatureData || nda.signatureUrl || nda.agreementPdfUrl) && (
          <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Signature preview */}
            {(nda.signatureData || nda.signatureUrl) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-xs text-muted-foreground">Digital Signature:</span>
                <div className="h-12 w-32 border border-border/60 rounded-md bg-white p-1 flex items-center justify-center shrink-0">
                  <img
                    src={nda.signatureData || nda.signatureUrl}
                    alt="Employee Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* PDF link */}
            {nda.agreementPdfUrl && (
              <a
                href={nda.agreementPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border/60 text-xs font-medium hover:bg-muted text-primary w-full sm:w-auto"
              >
                <Download className="size-3.5 shrink-0" />
                <span>Download Signed NDA (PDF)</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Section 8: System Metadata & Timestamps */}
      <div className="bg-card border border-border/60 rounded-md p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4 flex-wrap">
          <span>
            Created: <strong className="text-foreground">{formatDateTime(employee.createdAt)}</strong>
          </span>
          <span>
            Last Updated: <strong className="text-foreground">{formatDateTime(employee.updatedAt)}</strong>
          </span>
        </div>
        <span className="font-mono text-[11px]">
          Org ID: {employee.organizationId} · Record ID: {employee._id}
        </span>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-card text-card-foreground border border-border p-4 rounded-md w-[95vw] sm:max-w-2xl space-y-3 shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h4 className="font-semibold text-sm">{previewDoc.title}</h4>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Open in new tab"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XCircle className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded-md border border-border bg-black/5 flex items-center justify-center p-2">
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="max-h-[70vh] max-w-full object-contain rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  isCopyable = false,
  onCopy,
  isCopied = false,
  badgeClass = "",
  valueClass = "",
}) {
  return (
    <div>
      <span className="text-[11px] text-muted-foreground block mb-0.5">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-medium text-foreground ${badgeClass} ${valueClass} ${
            !value ? "italic text-muted-foreground/60" : ""
          }`}
        >
          {value || "—"}
        </span>
        {isCopyable && value && (
          <button
            onClick={onCopy}
            className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            title={`Copy ${label}`}
          >
            {isCopied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ title, number, frontUrl, backUrl, fileUrl, onPreview }) {
  const hasFiles = Boolean(frontUrl || backUrl || fileUrl);

  return (
    <div className="p-3.5 rounded-md border border-border/60 bg-muted/15 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-semibold text-xs text-foreground truncate">{title}</span>
          <FileText className="size-3.5 text-muted-foreground shrink-0" />
        </div>
        {number ? (
          <span className="font-mono text-[11px] text-muted-foreground block truncate">
            {number}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground/60 italic">Number not recorded</span>
        )}
      </div>

      <div className="pt-2 border-t border-border/40">
        {hasFiles ? (
          <div className="flex items-center gap-2 flex-wrap">
            {frontUrl && (
              <button
                onClick={() => onPreview({ title: `${title} (Front)`, url: frontUrl })}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Front Side</span>
                <ExternalLink className="size-2.5" />
              </button>
            )}
            {backUrl && (
              <button
                onClick={() => onPreview({ title: `${title} (Back)`, url: backUrl })}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Back Side</span>
                <ExternalLink className="size-2.5" />
              </button>
            )}
            {fileUrl && (
              <button
                onClick={() => onPreview({ title, url: fileUrl })}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Document</span>
                <ExternalLink className="size-2.5" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground/60 italic">No document file attached</span>
        )}
      </div>
    </div>
  );
}
