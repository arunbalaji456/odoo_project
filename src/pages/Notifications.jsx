import { useState } from "react";
import { Bell, CalendarClock, CheckCircle2, AlertTriangle, ArrowLeftRight, CheckCheck } from "lucide-react";
import Layout from "../components/Layout";
import "./Notifications.css";

const initialNotifications = [
  { id: 1, type: "Bookings", text: "Laptop AF-0014 assigned to Priya Shah", time: "2m ago", read: false },
  { id: 2, type: "Approvals", text: "Maintenance request AF-0055 approved", time: "18m ago", read: false },
  { id: 3, type: "Bookings", text: "Booking confirmed: Room B2, 2:00 to 3:00 PM", time: "1h ago", read: false },
  { id: 4, type: "Approvals", text: "Transfer approved: AF-0033 to Facilities dept", time: "3h ago", read: true },
];

const tabs = ["All", "Alerts", "Approvals", "Bookings"];

const typeIcon = {
  Alerts: AlertTriangle,
  Approvals: CheckCircle2,
  Bookings: CalendarClock,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    activeTab === "All" ? notifications : notifications.filter((n) => n.type === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const countFor = (tab) =>
    tab === "All" ? notifications.length : notifications.filter((n) => n.type === tab).length;

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Layout>
      <div className="notif">
        <div className="notif-head">
          <div>
            <h1>Notifications</h1>
            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="notif-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`notif-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="notif-tab-count">{countFor(tab)}</span>
            </button>
          ))}
        </div>

        <div className="notif-card">
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <Bell size={22} />
              <p>No notifications in this category.</p>
            </div>
          ) : (
            <ul className="notif-list">
              {filtered.map((n) => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <li
                    key={n.id}
                    className={n.read ? "" : "unread"}
                    onClick={() => markAsRead(n.id)}
                  >
                    <span className={`notif-icon type-${n.type.toLowerCase()}`}>
                      <Icon size={14} />
                    </span>
                    <span className="notif-text">{n.text}</span>
                    <span className="notif-meta">
                      {!n.read && <span className="unread-dot" />}
                      <span className="notif-time">{n.time}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}