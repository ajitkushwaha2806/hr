export const filterEmployeesList = (
  employeeList,
  { statusFilter = "all", departmentFilter = "all", searchQuery = "" } = {}
) => {
  if (!Array.isArray(employeeList)) return [];

  let data = employeeList;

  if (statusFilter && statusFilter !== "all") {
    data = data.filter(
      (e) => (e.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }

  if (departmentFilter && departmentFilter !== "all") {
    data = data.filter(
      (e) => (e.department || "").toLowerCase() === departmentFilter.toLowerCase()
    );
  }

  const query = searchQuery?.trim()?.toLowerCase();
  if (query) {
    data = data.filter((e) => {
      const fullName = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
      const name = (e.name || "").toLowerCase();
      const email = (e.email || "").toLowerCase();
      const phone = (e.phone || "").toLowerCase();
      const empId = (e.employeeId || "").toLowerCase();
      const designation = (e.designation || "").toLowerCase();
      const department = (e.department || "").toLowerCase();

      return (
        fullName.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        empId.includes(query) ||
        designation.includes(query) ||
        department.includes(query)
      );
    });
  }

  return data;
};

export const filterUsersList = filterEmployeesList;

