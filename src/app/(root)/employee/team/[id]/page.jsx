"use client";
import React, { use } from "react";
import EmployeeDetailView from "@/components/pages/admin/employees/detail";

export default function TeamMemberDetailPage({ params }) {
  const { id } = use(params);

  return (
    <EmployeeDetailView
      employeeId={id}
      backUrl="/employee/team"
      backLabel="My Team"
      allowEdit={false}
    />
  );
}

