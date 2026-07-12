import { useNavigate } from "react-router-dom";
import {
  Boxes, UserCheck, Wrench, CalendarClock, ArrowLeftRight, Undo2,
  PackagePlus, CalendarPlus, ClipboardList, AlertTriangle, Activity,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  getAssets, getBookings, getTransfers, getAllocations, getActivity, timeAgo,
} from "../utils/appData";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const assets = getAssets();
  const bookings = getBookings();
  const transfers = getTransfers();
  const allocations = getAllocations();
  const activity = getActivity();

  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const countByStatus = (status) =>
    assets.filter((a) => a.status === status).length;

  const activeAllocations = allocations.filter((al) => al.status === "Active");
  const overdue = activeAllocations.filter(
    (al) => al.expectedReturn && new Date(al.expectedReturn) < now
  );
  const upcomingReturns = activeAllocations.filter(
    (al) =>
      al.expectedReturn &&
      new Date(al.expectedReturn) >= now &&
      new Date(al.expectedReturn) <= in7days
  );
  const activeBookings = bookings.filter(
    (b) => b.status === "Upcoming" || b.status === "Ongoing"
  );
  const pendingTransfers = transfers.filter((t) => t.status === "Requested");

  const kpis = [
    { label: "Available", value: countByStatus("Available"), icon: Boxes, tone: "green" },
    { label: "Allocated", value: countByStatus("Allocated"), icon: UserCheck, tone: "indigo" },
    { label: "Under Maintenance", value: countByStatus("Under Maintenance"), icon: Wrench, tone: "amber" },
    { label: "Active Bookings", value: activeBookings.length, icon: CalendarClock, tone: "blue" },
    { label: "Pending Transfers", value: pendingTransfers.length, icon: ArrowLeftRight, tone: "purple" },
    { label: "Upcoming Returns", value: upcomingReturns.length, icon: Undo2, tone: "pink" },
  ];

  return (
    <Layout>
      <div className="dash">
        <div className="dash-head">
          <h1>Today&apos;s Overview</h1>
          <p>A live snapshot of your organisation&apos;s assets and resources</p>
        </div>

        <div className="kpi-grid">
          {kpis.map(({ label, value, icon: Icon, tone }) => (
            <div className={`kpi-card tone-${tone}`} key={label}>
              <div className="kpi-icon"><Icon size={16} /></div>
              <div>
                <span className="kpi-label">{label}</span>
                <span className="kpi-value">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {overdue.length > 0 && (
          <div className="overdue-banner">
            <AlertTriangle size={15} />
            {overdue.length} asset{overdue.length > 1 ? "s" : ""} overdue for
            return — flagged for follow-up
          </div>
        )}

        <div className="quick-actions">
          <button className="qa-btn primary" onClick={() => navigate("/assets")}>
            <PackagePlus size={15} /> Register Asset
          </button>
          <button className="qa-btn" onClick={() => navigate("/booking")}>
            <CalendarPlus size={15} /> Book Resource
          </button>
          <button className="qa-btn" onClick={() => navigate("/maintenance")}>
            <ClipboardList size={15} /> Raise Request
          </button>
        </div>

        <div className="activity-card">
          <div className="activity-head">
            <Activity size={15} />
            <h2>Recent Activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="activity-empty">
              No activity yet — allocations, bookings and approvals will appear here.
            </p>
          ) : (
            <ul className="activity-list">
              {activity.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <span className="dot" />
                  <span className="activity-text">{item.text}</span>
                  <span className="activity-time">{timeAgo(item.time)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}