export const SYSTEM_PERMISSIONS = [
  // --- Organization & Company Settings ---
  {
    code: "ORGANIZATION:READ",
    description: "View organization details, branch locations, and company policies",
    category: "Organization",
  },
  {
    code: "ORGANIZATION:UPDATE",
    description: "Update company profile, legal details, work week policies, and branding",
    category: "Organization",
  },

  // --- Department & Designation ---
  {
    code: "DEPARTMENT:READ",
    description: "View departments, designations, and organizational hierarchy",
    category: "Departments",
  },
  {
    code: "DEPARTMENT:CREATE",
    description: "Create new departments, teams, and job designations",
    category: "Departments",
  },
  {
    code: "DEPARTMENT:UPDATE",
    description: "Edit department info, reporting structures, and designations",
    category: "Departments",
  },
  {
    code: "DEPARTMENT:DELETE",
    description: "Remove departments and designations",
    category: "Departments",
  },

  // --- Employee Management ---
  {
    code: "EMPLOYEE:READ",
    description: "View employee directory, profiles, and basic contact details",
    category: "Employees",
  },
  {
    code: "EMPLOYEE:CREATE",
    description: "Onboard new employees, generate offer letters, and send invitations",
    category: "Employees",
  },
  {
    code: "EMPLOYEE:UPDATE",
    description: "Edit employee profile, documents, compensation details, and job details",
    category: "Employees",
  },
  {
    code: "EMPLOYEE:DELETE",
    description: "Offboard, deactivate, or terminate employee accounts",
    category: "Employees",
  },

  // --- Attendance & Shifts ---
  {
    code: "ATTENDANCE:READ",
    description: "View employee attendance records, daily clock-in/out logs, and shifts",
    category: "Attendance",
  },
  {
    code: "ATTENDANCE:RECORD",
    description: "Clock in and out for self attendance and log break times",
    category: "Attendance",
  },
  {
    code: "ATTENDANCE:MANAGE",
    description: "Approve attendance regularization, assign shifts, and modify attendance records",
    category: "Attendance",
  },

  // --- Leave & Time Off ---
  {
    code: "LEAVE:READ",
    description: "View leave balances, time-off requests, and holiday calendar",
    category: "Leave Management",
  },
  {
    code: "LEAVE:APPLY",
    description: "Submit leave and time-off applications for self",
    category: "Leave Management",
  },
  {
    code: "LEAVE:APPROVE",
    description: "Review, approve, or reject team leave and time-off applications",
    category: "Leave Management",
  },
  {
    code: "LEAVE:MANAGE",
    description: "Configure leave types, annual quotas, accrual rules, and holiday schedules",
    category: "Leave Management",
  },

  // --- Payroll & Compensation ---
  {
    code: "PAYROLL:READ",
    description: "View payroll summaries, salary slips, tax documents, and compensation history",
    category: "Payroll",
  },
  {
    code: "PAYROLL:CREATE",
    description: "Generate and process monthly payroll cycles and payouts",
    category: "Payroll",
  },
  {
    code: "PAYROLL:UPDATE",
    description: "Adjust deductions, allowances, bonuses, overtime pay, and reimbursements",
    category: "Payroll",
  },
  {
    code: "PAYROLL:DELETE",
    description: "Cancel or recompute draft and processed payroll batches",
    category: "Payroll",
  },

  // --- Performance & Appraisals ---
  {
    code: "PERFORMANCE:READ",
    description: "View performance reviews, OKRs, goals, and feedback",
    category: "Performance",
  },
  {
    code: "PERFORMANCE:MANAGE",
    description: "Initiate appraisal cycles, submit manager reviews, and set KPIs/OKRs",
    category: "Performance",
  },

  // --- Recruitment & Applicant Tracking ---
  {
    code: "RECRUITMENT:READ",
    description: "View open job requisitions, applicant pipelines, and interview schedules",
    category: "Recruitment",
  },
  {
    code: "RECRUITMENT:MANAGE",
    description: "Create job postings, schedule interviews, and manage hiring stages",
    category: "Recruitment",
  },

  // --- Assets & Equipment ---
  {
    code: "ASSET:READ",
    description: "View company hardware, software licenses, and assigned assets",
    category: "Assets",
  },
  {
    code: "ASSET:MANAGE",
    description: "Allocate, track, maintain, and retrieve company equipment",
    category: "Assets",
  },

  // --- Roles & Access Control ---
  {
    code: "ROLE:READ",
    description: "View system roles and permission sets",
    category: "Access Control",
  },
  {
    code: "ROLE:MANAGE",
    description: "Create and customize user roles and manage access permissions",
    category: "Access Control",
  },

  // --- Reports & Analytics ---
  {
    code: "REPORTS:READ",
    description: "Access workforce analytics, headcount reports, attendance rates, and attrition metrics",
    category: "Reports",
  },
];

export const ALL_PERMISSION_CODES = SYSTEM_PERMISSIONS.map((p) => p.code);

export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    name: "SUPER_ADMIN",
    description: "Full, unrestricted administrative access across the entire HR platform and all organizational entities.",
    isSystemRole: true,
    permissions: ALL_PERMISSION_CODES,
  },

  HR_ADMIN: {
    name: "HR_ADMIN",
    description: "Comprehensive HR administrative access across employees, departments, payroll, leaves, attendance, and recruitment.",
    isSystemRole: true,
    permissions: ALL_PERMISSION_CODES.filter((code) => code !== "ORGANIZATION:UPDATE"),
  },

  HR_MANAGER: {
    name: "HR_MANAGER",
    description: "Operational HR management including employee records, onboarding, leave approvals, attendance, recruitment, and assets.",
    isSystemRole: true,
    permissions: [
      "ORGANIZATION:READ",
      "DEPARTMENT:READ",
      "EMPLOYEE:READ",
      "EMPLOYEE:CREATE",
      "EMPLOYEE:UPDATE",
      "ATTENDANCE:READ",
      "ATTENDANCE:RECORD",
      "ATTENDANCE:MANAGE",
      "LEAVE:READ",
      "LEAVE:APPLY",
      "LEAVE:APPROVE",
      "LEAVE:MANAGE",
      "PERFORMANCE:READ",
      "PERFORMANCE:MANAGE",
      "RECRUITMENT:READ",
      "RECRUITMENT:MANAGE",
      "ASSET:READ",
      "ASSET:MANAGE",
      "REPORTS:READ",
    ],
  },

  FINANCE_MANAGER: {
    name: "FINANCE_MANAGER",
    description: "Dedicated access to payroll management, compensation records, reimbursements, and financial reports.",
    isSystemRole: true,
    permissions: [
      "ORGANIZATION:READ",
      "EMPLOYEE:READ",
      "ATTENDANCE:READ",
      "LEAVE:READ",
      "PAYROLL:READ",
      "PAYROLL:CREATE",
      "PAYROLL:UPDATE",
      "PAYROLL:DELETE",
      "REPORTS:READ",
    ],
  },

  TEAM_LEAD: {
    name: "TEAM_LEAD",
    description: "Department or team manager with access to view team members, approve leaves, manage attendance, and conduct appraisals.",
    isSystemRole: true,
    permissions: [
      "ORGANIZATION:READ",
      "DEPARTMENT:READ",
      "EMPLOYEE:READ",
      "ATTENDANCE:READ",
      "ATTENDANCE:RECORD",
      "ATTENDANCE:MANAGE",
      "LEAVE:READ",
      "LEAVE:APPLY",
      "LEAVE:APPROVE",
      "PERFORMANCE:READ",
      "PERFORMANCE:MANAGE",
      "ASSET:READ",
    ],
  },

  EMPLOYEE: {
    name: "EMPLOYEE",
    description: "Standard employee self-service access to view profile, clock in/out, view payslips, apply for leaves, and track personal goals.",
    isSystemRole: true,
    permissions: [
      "ORGANIZATION:READ",
      "DEPARTMENT:READ",
      "EMPLOYEE:READ",
      "ATTENDANCE:RECORD",
      "LEAVE:READ",
      "LEAVE:APPLY",
      "PAYROLL:READ",
      "PERFORMANCE:READ",
      "ASSET:READ",
    ],
  },
};

export const SYSTEM_ROLES_LIST = Object.values(SYSTEM_ROLES);
