import { BarChart3, TrendingUp, Download } from "lucide-react";
import Layout from "../components/Layout";
import "./Reports.css";

const utilizationData = [
  { dept: "Engineering", value: 82 },
  { dept: "Facilities", value: 45 },
  { dept: "Field Ops", value: 63 },
  { dept: "HR", value: 30 },
];

const maintenanceTrend = [12, 18, 15, 22, 28, 25, 34];

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
    const rows = [["Department", "Utilization %"], ...utilizationData.map((d) => [d.dept, d.value])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assetflow_report.csv";
    a.click();
  };

  return (
    <Layout>
      <div className="reports">
        <div className="reports-head">
          <h1>Reports &amp; Analytics</h1>
          <p>Utilization, maintenance frequency, and operational insight</p>
        </div>

        <div className="reports-chart-grid">
          <div className="chart-card">
            <div className="chart-head"><BarChart3 size={15} /> Utilization by department</div>
            <div className="bar-chart">
              {utilizationData.map((d) => (
                <div className="bar-col" key={d.dept}>
                  <div className="bar" style={{ height: `${(d.value / maxUtil) * 100}px` }} />
                  <span>{d.dept}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-head"><TrendingUp size={15} /> Maintenance Frequency</div>
            <svg width="100%" height="140" viewBox="0 0 280 140">
              <polyline
                fill="none"
                stroke="#7c5cf0"
                strokeWidth="2.5"
                points={maintenanceTrend.map((v, i) => `${i * 45},${140 - (v / maxTrend) * 130}`).join(" ")}
              />
            </svg>
          </div>
        </div>

        <div className="reports-list-grid">
          <div className="list-card">
            <h2>Most used assets</h2>
            {mostUsed.map((a) => (
              <div className="list-row" key={a.name}>
                <span>{a.name}</span>
                <span className="list-detail">{a.detail}</span>
              </div>
            ))}
          </div>
          <div className="list-card">
            <h2>Idle assets</h2>
            {idleAssets.map((a) => (
              <div className="list-row" key={a.name}>
                <span>{a.name}</span>
                <span className="list-detail">{a.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="list-card">
          <h2>Assets due for maintenance / nearing retirement</h2>
          {dueForAction.map((a) => (
            <div className="list-row" key={a.name}>
              <span>{a.name}</span>
              <span className="list-detail">{a.detail}</span>
            </div>
          ))}
        </div>

        <button className="qa-btn" onClick={handleExport}>
          <Download size={15} /> Export report
        </button>
      </div>
    </Layout>
  );
}