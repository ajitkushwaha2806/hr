"use client";
import FloatingField from "../floating-field";
import { DocumentUploadCard } from "@/components/ui/document-upload-card";
import { formatAadharInput, formatPanInput } from "../../helpers/formatters";
import { Shield, CreditCard, FileText, Landmark, Building2, Wallet, GraduationCap, Award, BookOpen } from "lucide-react";

export default function Step4Documents({ formData, handleChange, errors = {} }) {
  return (
    <div className="space-y-8">

      <div className="space-y-5 p-3.5 sm:p-5 rounded-md border border-border/60 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Shield className="size-4 text-primary" />
          <span>Aadhar Card Verification</span>
        </div>

        <FloatingField
          id="aadharNumber"
          label="Aadhar Card Number *"
          icon={CreditCard}
          placeholder="e.g. 5432 1234 5678"
          value={formData.aadharNumber}
          onChange={(e) => {
            const formatted = formatAadharInput(e.target.value);
            handleChange("aadharNumber", formatted);
          }}
          error={errors.aadharNumber}
          maxLength={14}
          helperText="Enter 12-digit UIDAI number. Upload clear front & back copies below."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <DocumentUploadCard
            label="Aadhar Card (Front Side) *"
            description="Clear photo & number"
            category="aadhar"
            value={formData.aadharFrontUrl}
            onChange={(url) => handleChange("aadharFrontUrl", url)}
            error={errors.aadharFrontUrl}
            required
          />
          <DocumentUploadCard
            label="Aadhar Card (Back Side) *"
            description="Address & QR details"
            category="aadhar"
            value={formData.aadharBackUrl}
            onChange={(url) => handleChange("aadharBackUrl", url)}
            error={errors.aadharBackUrl}
            required
          />
        </div>
      </div>

      <div className="space-y-5 p-3.5 sm:p-5 rounded-md border border-border/60 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <FileText className="size-4 text-primary" />
          <span>Permanent Account Number (PAN) Card</span>
        </div>

        <FloatingField
          id="panNumber"
          label="PAN Card Number *"
          icon={CreditCard}
          placeholder="e.g. ABCDE1234F"
          value={formData.panNumber}
          onChange={(e) => {
            const formatted = formatPanInput(e.target.value);
            handleChange("panNumber", formatted);
          }}
          error={errors.panNumber}
          maxLength={10}
          helperText="10-character alphanumeric PAN issued by the Income Tax Department."
        />

        <div className="pt-1">
          <DocumentUploadCard
            label="PAN Card Document *"
            description="Clear scanned copy or photo"
            category="pan"
            value={formData.panFileUrl}
            onChange={(url) => handleChange("panFileUrl", url)}
            error={errors.panFileUrl}
            required
          />
        </div>
      </div>

      {/* Educational Qualification Documents: 10th & 12th Results */}
      <div className="space-y-5 p-3.5 sm:p-5 rounded-md border border-border/60 bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <GraduationCap className="size-4 text-primary" />
            <span>Educational Qualification & Marksheets</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            10th & 12th Standard Verification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* 10th Standard / Matriculation */}
          <div className="p-3.5 sm:p-4 rounded-lg border border-border/50 bg-slate-50/50 dark:bg-zinc-950/40 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Award className="size-3.5 text-indigo-500" />
                <span>Class 10th (Secondary School)</span>
              </div>

              <FloatingField
                id="tenthRollNumber"
                label="10th Roll / Registration No."
                icon={BookOpen}
                placeholder="e.g. 10293847"
                value={formData.tenthRollNumber}
                onChange={(e) => handleChange("tenthRollNumber", e.target.value)}
                error={errors.tenthRollNumber}
                helperText="As printed on your 10th marksheet."
              />
            </div>

            <DocumentUploadCard
              label="10th Marksheet / Passing Certificate *"
              description="Clear PDF or photo showing marks"
              category="education"
              value={formData.tenthResultUrl}
              onChange={(url) => handleChange("tenthResultUrl", url)}
              error={errors.tenthResultUrl}
              required
            />
          </div>

          {/* 12th Standard / Intermediate */}
          <div className="p-3.5 sm:p-4 rounded-lg border border-border/50 bg-slate-50/50 dark:bg-zinc-950/40 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Award className="size-3.5 text-indigo-500" />
                <span>Class 12th (Higher Secondary)</span>
              </div>

              <FloatingField
                id="twelfthRollNumber"
                label="12th Roll / Registration No."
                icon={BookOpen}
                placeholder="e.g. 12948572"
                value={formData.twelfthRollNumber}
                onChange={(e) => handleChange("twelfthRollNumber", e.target.value)}
                error={errors.twelfthRollNumber}
                helperText="As printed on your 12th marksheet."
              />
            </div>

            <DocumentUploadCard
              label="12th Marksheet / Passing Certificate *"
              description="Clear PDF or photo showing marks"
              category="education"
              value={formData.twelfthResultUrl}
              onChange={(url) => handleChange("twelfthResultUrl", url)}
              error={errors.twelfthResultUrl}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-5 p-3.5 sm:p-5 rounded-md border border-border/60 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Landmark className="size-4 text-primary" />
          <span>Bank Account & Settlement Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FloatingField
            id="accountHolderName"
            label="Account Holder Name *"
            icon={CreditCard}
            placeholder="e.g. John Doe"
            value={formData.accountHolderName}
            onChange={(e) => handleChange("accountHolderName", e.target.value)}
            error={errors.accountHolderName}
            helperText="As printed on your bank passbook or statement."
          />

          <FloatingField
            id="bankName"
            label="Bank Name *"
            icon={Building2}
            placeholder="e.g. HDFC Bank, State Bank of India"
            value={formData.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            error={errors.bankName}
            helperText="Full bank name where salary will be credited."
          />

          <FloatingField
            id="accountNumber"
            label="Bank Account Number *"
            icon={CreditCard}
            placeholder="e.g. 123456789012"
            value={formData.accountNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              handleChange("accountNumber", val);
            }}
            error={errors.accountNumber}
            maxLength={18}
            helperText="9-18 digit account number for salary disbursement."
          />

          <FloatingField
            id="ifscCode"
            label="IFSC Code *"
            icon={Landmark}
            placeholder="e.g. HDFC0001234"
            value={formData.ifscCode}
            onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase().trim())}
            error={errors.ifscCode}
            maxLength={11}
            helperText="11-character code (e.g. 4 letters, '0', 6 alphanumeric characters)."
          />

          <FloatingField
            id="branchName"
            label="Branch Name (Optional)"
            icon={Building2}
            placeholder="e.g. Koramangala 5th Block"
            value={formData.branchName}
            onChange={(e) => handleChange("branchName", e.target.value)}
            error={errors.branchName}
            helperText="Bank branch location."
          />

          <FloatingField
            id="upiId"
            label="UPI ID (Optional)"
            icon={Wallet}
            placeholder="e.g. username@okhdfcbank"
            value={formData.upiId}
            onChange={(e) => handleChange("upiId", e.target.value.toLowerCase().trim())}
            error={errors.upiId}
            helperText="For quick reimbursements and settlements."
          />
        </div>
      </div>
    </div>
  );
}
