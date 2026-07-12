import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Building2, Tag, Users, Plus } from "lucide-react";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  getCategories,
  addCategory,
  getEmployees,
  updateEmployeeRole,
} from "../utils/orgData";
import "./OrgSetup.css";

const ROLES = ["employee", "department_head", "asset_manager", "admin"];

export default function OrgSetup() {
  const [tab, setTab] = useState("departments");
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    setDepartments(getDepartments());
    setCategories(getCategories());
    setEmployees(getEmployees());
  }, []);

  // --- Departments ---
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [deptParent, setDeptParent] = useState("");

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    addDepartment({ name: deptName, head: deptHead, parent: deptParent || "--" });
    setDepartments(getDepartments());
    setDeptName("");
    setDeptHead("");
    setDeptParent("");
  };

  const toggleDeptStatus = (id, currentStatus) => {
    updateDepartment(id, { status: currentStatus === "Active" ? "Inactive" : "Active" });
    setDepartments(getDepartments());
  };

  // --- Categories ---
  const [catName, setCatName] = useState("");

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory({ name: catName });
    setCategories(getCategories());
    setCatName("");
  };

  // --- Employees ---
  const handleRoleChange = (id, role) => {
    updateEmployeeRole(id, role, null);
    setEmployees(getEmployees());
  };

  return (
    <Layout>
      <div className="org-header">
        <h2 className="org-heading">Organization Setup</h2>
        <p className="org-subheading">
          Manage departments, categories, and your employee directory
        </p>
      </div>

      <div className="org-tabs">
        <button
          className={tab === "departments" ? "tab active" : "tab"}
          onClick={() => setTab("departments")}
        >
          <Building2 size={15} /> Departments
        </button>
        <button
          className={tab === "categories" ? "tab active" : "tab"}
          onClick={() => setTab("categories")}
        >
          <Tag size={15} /> Categories
        </button>
        <button
          className={tab === "employees" ? "tab active" : "tab"}
          onClick={() => setTab("employees")}
        >
          <Users size={15} /> Employee Directory
        </button>
      </div>

      {tab === "departments" && (
        <div className="org-panel">
          <form className="inline-form" onSubmit={handleAddDept}>
            <input
              placeholder="Department name"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              required
            />
            <input
              placeholder="Head (name)"
              value={deptHead}
              onChange={(e) => setDeptHead(e.target.value)}
            />
            <select value={deptParent} onChange={(e) => setDeptParent(e.target.value)}>
              <option value="">No parent</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <button type="submit" className="add-btn">
              <Plus size={14} /> Add Department
            </button>
          </form>

          <table className="org-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Head</th>
                <th>Parent Dept</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td> 
                     <div className="name-cell">
                        <div className="avatar-circle">{d.name.slice(0, 2)}</div>
                        {d.name}
                         </div>
                  </td>
                  <td>{d.head || "--"}</td>
                  <td>{d.parent}</td>
                  <td>
                    <button
                      className={`status-pill ${d.status.toLowerCase()}`}
                      onClick={() => toggleDeptStatus(d.id, d.status)}
                    >
                      {d.status}
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No departments yet — add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "categories" && (
        <div className="org-panel">
          <form className="inline-form" onSubmit={handleAddCategory}>
            <input
              placeholder="Category name (e.g. Electronics)"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
            />
            <button type="submit" className="add-btn">
              <Plus size={14} /> Add Category
            </button>
          </form>

          <table className="org-table">
            <thead>
              <tr>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><span className="category-chip">{c.name}</span></td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td className="empty-row">No categories yet — add one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "employees" && (
        <div className="org-panel">
          <table className="org-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="name-cell">
                        <div className="avatar-circle">{emp.name.slice(0, 2)}</div>
                        {emp.name}
                        </div>
                  </td>
            
                  <td>
                    <select
                      value={emp.role}
                      onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="3" className="empty-row">
                    No employees yet — sign up a test account first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}