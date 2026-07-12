import { useState } from "react";

const utilizationData = [
  { dept: "Engineering", value: 82 },
  { dept: "Facilities", value: 45 },
  { dept: "Field Ops", value: 63 },
  { dept: "HR", value: 30 },
];

const maintenanceTrend = [12, 18, 15, 22, 28, 25, 34]; // last 7 weeks

const mostUsed = [
  { name: "Room B2", detail: "34 bookings this month" },
  { name: "Van AF-343", detail: "21 trips this month" },
  { name: "Projector AF-335", detail: "18 uses" },
];

const idleAssets = [
  { name: "Camera AF-0301", detail: "unused 60+ days" },
  { name: "Chair AF-0410", detail: "unused 45 days" },
];

const dueForAction = [
  { name: "Forklift AF-0087", detail: "service due in 5 days" },
  { name: "Laptop AF-0020", detail: "4 years old, nearing retirement" },
];

export default function Reports() {
  const maxUtil = Math.max(...utilizationData.map((d) => d.value));
  const maxTrend = Math.max(...maintenanceTrend);

  const handleExport = () => {
    const rows = [
      ["Department", "Utilization %"],
      ...utilizationData.map((d) => [d.dept, d.value]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assetflow_report.csv";
    a.click();
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="Reports" />
      <div style={{ flex: 1, padding: 24 }}>
        <h2>AssetFlow</h2>

        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          {/* Utilization by department */}
          <div style={{ flex: 1, background: "#e8f0ff", borderRadius: 12, padding: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>Utilization by department</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
              {utilizationData.map((d) => (
                <div key={d.dept} style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      height: `${(d.value / maxUtil) * 100}px`,
                      background: "#f4d35e",
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  />
                  <span style={{ fontSize: 11 }}>{d.dept}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance frequency */}
          <div style={{ flex: 1, background: "#e8f0ff", borderRadius: 12, padding: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>Maintenance Frequency</p>
            <svg width="100%" height="140" viewBox="0 0 280 140">
              <polyline
                fill="none"
                stroke="#d9534f"
                strokeWidth="2"
                points={maintenanceTrend
                  .map((v, i) => `${i * 45},${140 - (v / maxTrend) * 130}`)
                  .join(" ")}
              />
            </svg>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600 }}>Most used assets</p>
            {mostUsed.map((a) => (
              <p key={a.name} style={{ fontSize: 13, color: "#555" }}>
                {a.name}: {a.detail}
              </p>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600 }}>Idle assets</p>
            {idleAssets.map((a) => (
              <p key={a.name} style={{ fontSize: 13, color: "#555" }}>
                {a.name}: {a.detail}
              </p>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <p style={{ fontWeight: 600 }}>Assets due for maintenance / nearing retirement</p>
          {dueForAction.map((a) => (
            <p key={a.name} style={{ fontSize: 13, color: "#555" }}>
              {a.name}: {a.detail}
            </p>
          ))}
        </div>

        <button
          onClick={handleExport}
          style={{ marginTop: 20, padding: "8px 16px", background: "#fbe0e0", border: "none", borderRadius: 8 }}
        >
          Export report
        </button>
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