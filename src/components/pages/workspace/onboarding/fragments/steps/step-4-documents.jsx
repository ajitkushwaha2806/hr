"use client";
import FloatingField from "../floating-field";
import { Shield, CreditCard, FileText } from "lucide-react";
import { DocumentUploadCard } from "@/components/ui/document-upload-card";
import { formatAadharInput, formatPanInput } from "../../helpers/formatters";

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
    </div>
  );
}
