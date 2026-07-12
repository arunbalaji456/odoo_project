// Departments
export function getDepartments() {
  return JSON.parse(localStorage.getItem("departments") || "[]");
}
export function addDepartment(dept) {
  const departments = getDepartments();
  const newDept = { id: Date.now().toString(), status: "Active", ...dept };
  departments.push(newDept);
  localStorage.setItem("departments", JSON.stringify(departments));
  return newDept;
}
export function updateDepartment(id, updates) {
  const departments = getDepartments().map((d) =>
    d.id === id ? { ...d, ...updates } : d
  );
  localStorage.setItem("departments", JSON.stringify(departments));
}

// Categories
export function getCategories() {
  return JSON.parse(localStorage.getItem("categories") || "[]");
}
export function addCategory(cat) {
  const categories = getCategories();
  const newCat = { id: Date.now().toString(), ...cat };
  categories.push(newCat);
  localStorage.setItem("categories", JSON.stringify(categories));
  return newCat;
}

// Employees (reuses the "users" created via signup, plus manual role updates)
export function getEmployees() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
export function updateEmployeeRole(id, role, department) {
  const users = getEmployees().map((u) =>
    u.id === id ? { ...u, role, department } : u
  );
  localStorage.setItem("users", JSON.stringify(users));
}