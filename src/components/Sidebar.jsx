import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getCurrentUser, logout } from "../utils/auth";
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
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

      <div className="sidebar-footer">
        {currentUser && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {currentUser.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="sidebar-user-name">{currentUser.name}</div>
              <div className="sidebar-user-role">{currentUser.role}</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
}