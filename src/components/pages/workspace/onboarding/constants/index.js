import { User, Briefcase, MapPin, Shield } from "lucide-react";

export const DRAFT_STORAGE_KEY_PREFIX = "hr_onboarding_draft";

export const STEPS = [
  {
    id: 1,
    title: "Personal Profile",
    subtitle: "Legal name, contact & personal bio",
    icon: User,
  },
  {
    id: 2,
    title: "Role & Department",
    subtitle: "Designation, department & workplace terms",
    icon: Briefcase,
  },
  {
    id: 3,
    title: "Addresses & Emergency",
    subtitle: "Current & permanent residences & emergency contact",
    icon: MapPin,
  },
  {
    id: 4,
    title: "Identity & Verification",
    subtitle: "Official Aadhar & PAN document uploads",
    icon: Shield,
  },
];

export const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

export const WORK_LOCATION_OPTIONS = [
  { value: "On-site", label: "On-site (Office)", disabled: false },
  { value: "Hybrid", label: "Hybrid (Flexible)", disabled: true },
  { value: "Remote", label: "Fully Remote", disabled: true },
];

export const DEPARTMENTS = [
  "Digital Team",
  "Onboarding Team",
  "Retention Team",
  "Tech Team",
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full-Time", label: "Full-Time", disabled: false },
  { value: "Part-Time", label: "Part-Time", disabled: true },
  { value: "Contract", label: "Contract", disabled: true },
  { value: "Intern", label: "Intern", disabled: true },
];

export const DEPARTMENT_DESIGNATIONS = {
  "Digital Team": [
    "Sales Executive",
    "Digital Lead",
  ],
  "Onboarding Team": [
    "Sales Executive",
    "Onboarding Lead",
  ],
  "Retention Team": [
    "Customer Support",
    "Retention Lead",
  ],
  "Tech Team": [
    "Software Engineer",
    "Tech Lead",
  ],
  // Case-insensitive fallbacks for saved drafts / existing profiles
  "DIGITAL TEAM": [
    "Sales Executive",
    "Digital Lead",
  ],
  "ONBOARDING TEAM": [
    "Sales Executive",
    "Onboarding Lead",
  ],
  "RETENTION TEAM": [
    "Customer Support",
    "Retention Lead",
  ],
  "TECH TEAM": [
    "Software Engineer",
    "Tech Lead",
  ],
  Digital: [
    "Sales Executive",
    "Digital Lead",
  ],
  Onboarding: [
    "Sales Executive",
    "Onboarding Lead",
  ],
  Retention: [
    "Customer Support",
    "Retention Lead",
  ],
  Tech: [
    "Software Engineer",
    "Tech Lead",
  ],
};

export const DEPARTMENT_NORMALIZATION_MAP = {
  "DIGITAL TEAM": "Digital Team",
  "ONBOARDING TEAM": "Onboarding Team",
  "RETENTION TEAM": "Retention Team",
  "TECH TEAM": "Tech Team",
  "digital team": "Digital Team",
  "onboarding team": "Onboarding Team",
  "retention team": "Retention Team",
  "tech team": "Tech Team",
  Digital: "Digital Team",
  Onboarding: "Onboarding Team",
  Retention: "Retention Team",
  Tech: "Tech Team",
};

export const DESIGNATION_NORMALIZATION_MAP = {
  "SALES EXECUTIVE": "Sales Executive",
  "DIGITAL LEAD": "Digital Lead",
  "ONBOARDING SPECIALIST": "Sales Executive",
  "ONBOARDING LEAD": "Onboarding Lead",
  "CUSTOMER SUPPORT": "Customer Support",
  "RETENTION LEAD": "Retention Lead",
  "SOFTWARE ENGINEER": "Software Engineer",
  "TECH LEAD": "Tech Lead",
  "Onboarding Specialist": "Sales Executive",
};
