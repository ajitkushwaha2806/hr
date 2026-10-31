"use client";
import { use } from "react";
import EmployeeDetailView from "@/components/pages/admin/employees/detail";

export default function EmployeeDetailPage({ params }) {
  const { id } = use(params);
  return <EmployeeDetailView employeeId={id} />;
}
