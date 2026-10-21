"use client";

import {
  MapPin,
  Home,
  Building2,
  HeartHandshake,
  User,
  Phone,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import FloatingField from "../floating-field";

export default function Step3Addresses({ formData, handleChange, errors = {} }) {
  return (
    <div className="space-y-8">

      {/* Current Residence Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Home className="size-3.5 text-primary" />
          <span>Current Residential Address</span>
        </div>

        <FloatingField
          id="currentStreet"
          label="Current Street Address *"
          icon={MapPin}
          placeholder="e.g. 104, Green Valley Apartments, Sector 14"
          value={formData.currentStreet}
          onChange={(e) => handleChange("currentStreet", e.target.value)}
          error={errors.currentStreet}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <FloatingField
            id="currentCity"
            label="City *"
            icon={MapPin}
            placeholder="e.g. New Delhi"
            value={formData.currentCity}
            onChange={(e) => handleChange("currentCity", e.target.value)}
            error={errors.currentCity}
          />
          <FloatingField
            id="currentState"
            label="State *"
            icon={MapPin}
            placeholder="e.g. Delhi"
            value={formData.currentState}
            onChange={(e) => handleChange("currentState", e.target.value)}
            error={errors.currentState}
          />
          <FloatingField
            id="currentPostalCode"
            label="Postal Code *"
            icon={MapPin}
            placeholder="e.g. 110001"
            value={formData.currentPostalCode}
            onChange={(e) => handleChange("currentPostalCode", e.target.value)}
            error={errors.currentPostalCode}
          />
          <FloatingField
            id="currentCountry"
            label="Country"
            icon={Compass}
            placeholder="e.g. India"
            value={formData.currentCountry}
            onChange={(e) => handleChange("currentCountry", e.target.value)}
          />
        </div>
      </div>

      {/* Permanent Residence Section */}
      <div className="space-y-6 pt-6 border-t border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Building2 className="size-3.5 text-primary" />
            <span>Permanent Legal Address</span>
          </div>

          <label
            htmlFor="sameAsCurrentAddress"
            className="inline-flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 cursor-pointer select-none transition-colors border border-border/60"
          >
            <Checkbox
              id="sameAsCurrentAddress"
              checked={formData.sameAsCurrentAddress}
              onCheckedChange={(checked) => handleChange("sameAsCurrentAddress", Boolean(checked))}
            />
            <span className="text-xs font-medium text-foreground">
              Permanent address is same as current address
            </span>
          </label>
        </div>

        {!formData.sameAsCurrentAddress ? (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <FloatingField
              id="permanentStreet"
              label="Permanent Street Address *"
              icon={MapPin}
              placeholder="e.g. Flat 302, Royal Residency, Station Road"
              value={formData.permanentStreet}
              onChange={(e) => handleChange("permanentStreet", e.target.value)}
              error={errors.permanentStreet}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <FloatingField
                id="permanentCity"
                label="City *"
                icon={MapPin}
                placeholder="e.g. Jaipur"
                value={formData.permanentCity}
                onChange={(e) => handleChange("permanentCity", e.target.value)}
                error={errors.permanentCity}
              />
              <FloatingField
                id="permanentState"
                label="State *"
                icon={MapPin}
                placeholder="e.g. Rajasthan"
                value={formData.permanentState}
                onChange={(e) => handleChange("permanentState", e.target.value)}
                error={errors.permanentState}
              />
              <FloatingField
                id="permanentPostalCode"
                label="Postal Code *"
                icon={MapPin}
                placeholder="e.g. 302001"
                value={formData.permanentPostalCode}
                onChange={(e) => handleChange("permanentPostalCode", e.target.value)}
                error={errors.permanentPostalCode}
              />
              <FloatingField
                id="permanentCountry"
                label="Country"
                icon={Compass}
                placeholder="e.g. India"
                value={formData.permanentCountry}
                onChange={(e) => handleChange("permanentCountry", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-md bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>Permanent address is synchronized with your current residential address.</span>
          </div>
        )}
      </div>

      {/* Emergency Section */}
      <div className="space-y-6 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <HeartHandshake className="size-4 text-rose-500" />
          <span>Primary Emergency Point of Contact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FloatingField
            id="emergencyName"
            label="Contact Person Name *"
            icon={User}
            placeholder="e.g. Sunita Sharma"
            value={formData.emergencyName}
            onChange={(e) => handleChange("emergencyName", e.target.value)}
            error={errors.emergencyName}
          />
          <FloatingField
            id="emergencyRelation"
            label="Relationship"
            icon={HeartHandshake}
            placeholder="e.g. Spouse / Parent / Sibling"
            value={formData.emergencyRelation}
            onChange={(e) => handleChange("emergencyRelation", e.target.value)}
          />
          <FloatingField
            id="emergencyPhone"
            label="Emergency Phone Number *"
            icon={Phone}
            placeholder="+91 9811223344"
            value={formData.emergencyPhone}
            onChange={(e) => handleChange("emergencyPhone", e.target.value)}
            error={errors.emergencyPhone}
          />
        </div>
      </div>
    </div>
  );
}
