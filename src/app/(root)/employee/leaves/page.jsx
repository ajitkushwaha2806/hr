import EmployeeLeavesView from "@/components/pages/employee/leaves";

export const metadata = {
  title: "My Leaves | Employee Self-Service",
  description: "View monthly casual leave balance, submit leave requests, and track approval status.",
};

export default function EmployeeLeavesPage() {
  return <EmployeeLeavesView />;
}
