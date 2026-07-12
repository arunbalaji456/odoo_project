import { useState } from "react";

const allNotifications = [
  { id: 1, type: "Bookings", text: "Laptop AF-0014 assigned to Priya Shah", time: "2m ago" },
  { id: 2, type: "Approvals", text: "Maintenance request AF-0055 approved", time: "18m ago" },
  { id: 3, type: "Bookings", text: "Booking confirmed: Room B2, 2:00 to 3:00 PM", time: "1h ago" },
  { id: 4, type: "Approvals", text: "Transfer approved: AF-0033 to Facilities dept", time: "3h ago" },
  { id: 5, type: "Alerts", text: "Overdue return: AF-0021", time: "1d ago" },
  { id: 6, type: "Alerts", text: "Audit discrepancy flagged: AF-0088 damaged", time: "2d ago" },
];

const tabs = ["All", "Alerts", "Approvals", "Bookings"];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    activeTab === "All" ? allNotifications : allNotifications.filter((n) => n.type === activeTab);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="Notifications" />
      <div style={{ flex: 1, padding: 24 }}>
        <h2>AssetFlow</h2>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid #ddd",
                background: activeTab === tab ? "#d7f5e9" : "#fff",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: n.type === "Alerts" ? "#e57373" : "#90caf9",
                    display: "inline-block",
                  }}
                />
                {n.text}
              </span>
              <span style={{ color: "#999", fontSize: 12 }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active }) {
  const items = [
    "Dashboard",
    "Organization setup",
    "Assets",
    "Allocation & Transfer",
    "Resource Booking",
    "Maintenance",
    "Audit",
    "Reports",
    "Notifications",
  ];
  return (
    <div style={{ width: 180, borderRight: "1px solid #eee", padding: 16 }}>
      {items.map((item) => (
        <p
          key={item}
          style={{
            padding: "6px 8px",
            borderRadius: 6,
            background: item === active ? "#d7f5e9" : "transparent",
            fontWeight: item === active ? 600 : 400,
          }}
        >
          {item}
        </p>
      ))}
    </div>
  );
}