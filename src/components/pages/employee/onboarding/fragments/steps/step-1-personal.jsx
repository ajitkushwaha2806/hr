"use client";

import { User, Mail, Phone, Calendar } from "lucide-react";
import { FloatingDatePicker } from "@/components/ui/date-picker";
import { GENDER_OPTIONS } from "../../constants";
import FloatingField from "../floating-field";
import FloatingRadioGroup from "../floating-radio-group";
import FaceCaptureCard from "@/components/ui/face-capture-card";

export default function Step1Personal({ formData, handleChange, errors = {} }) {
  return (
    <div className="space-y-8">

      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <FloatingField
          id="firstName"
          label="First Name *"
          icon={User}
          placeholder="e.g. Rahul"
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          error={errors.firstName}
        />

        <FloatingField
          id="lastName"
          label="Last Name *"
          icon={User}
          placeholder="e.g. Sharma"
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          error={errors.lastName}
        />
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <FloatingField
          id="email"
          label="Email Address (Registered) *"
          icon={Mail}
          value={formData.email}
          disabled
        />

        <FloatingField
          id="phone"
          label="Mobile Phone Number *"
          icon={Phone}
          placeholder="+91 9876543210"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <FloatingRadioGroup
          label="Gender"
          icon={User}
          value={formData.gender}
          onChange={(val) => handleChange("gender", val)}
          options={GENDER_OPTIONS}
        />

        <FloatingDatePicker
          label="Date of Birth"
          icon={Calendar}
          value={formData.dateOfBirth}
          onChange={(val) => handleChange("dateOfBirth", val)}
          placeholder="Select Date of Birth"
          minYear={1940}
          maxYear={new Date().getFullYear()}
        />
      </div>

      <FaceCaptureCard
        value={
          formData.facePhoto && !formData.facePhoto.includes("img.clerk.com")
            ? formData.facePhoto
            : ""
        }
        onChange={(url) => {
          handleChange("facePhoto", url);
          handleChange("avatar", url);
        }}
        allowRetake={true}
        error={errors.facePhoto}
      />
    </div>
  );
}
