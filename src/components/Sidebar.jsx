import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Organization setup", path: "/org-setup" },
  { label: "Assets", path: "/assets" },
  { label: "Allocation & Transfer", path: "/allocation" },
  { label: "Resource Booking", path: "/booking" },
  { label: "Maintenance", path: "/maintenance" },
  { label: "Audit", path: "/audit" },
  { label: "Reports", path: "/reports" },
  { label: "Notifications", path: "/notifications" },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">AssetFlow</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}