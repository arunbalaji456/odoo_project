import { useState } from "react";
import {
  Wrench, AlertTriangle, Search, ListChecks, Clock, CircleCheck, CircleX,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  getAssets, saveAssets, getMaintenance, saveMaintenance, logActivity,
} from "../utils/appData";
import { getCurrentUser } from "../utils/auth";
import "./Maintenance.css";

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Open", "In Progress", "Resolved", "Cancelled"];

const emptyForm = { assetTag: "", issue: "", priority: "Medium" };

export default function Maintenance() {
  const [assets, setAssets] = useState(getAssets());
  const [requests, setRequests] = useState(getMaintenance());
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const user = getCurrentUser();

  // Assets that can have a request raised against them right now
  const selectableAssets = assets.filter(
    (a) => !["Retired", "Disposed"].includes(a.status)
  );

  const activeRequestFor = (tag) =>
    requests.find(
      (r) => r.asset === tag && (r.status === "Open" || r.status === "In Progress")
    );

  const raiseRequest = () => {
    setError("");
    setNotice("");
    if (!form.assetTag) {
      setError("Choose an asset first.");
      return;
    }
    if (!form.issue.trim()) {
      setError("Describe the issue before submitting.");
      return;
    }
    if (activeRequestFor(form.assetTag)) {
      setError("This asset already has an open maintenance request.");
      return;
    }

    const asset = assets.find((a) => a.tag === form.assetTag);
    const record = {
      id: Date.now(),
      asset: asset.tag,
      assetName: asset.name,
      issue: form.issue.trim(),
      priority: form.priority,
      status: "Open",
      raisedBy: user?.name || "Unknown",
      date: new Date().toISOString(),
      previousStatus: asset.status,
      resolvedAt: null,
    };

    const updatedRequests = [record, ...requests];
    setRequests(updatedRequests);
    saveMaintenance(updatedRequests);

    const updatedAssets = assets.map((a) =>
      a.tag === asset.tag ? { ...a, status: "Under Maintenance" } : a
    );
    setAssets(updatedAssets);
    saveAssets(updatedAssets);

    logActivity(`${asset.tag} ${asset.name} flagged for maintenance — ${form.priority} priority`);
    setForm(emptyForm);
    setNotice(`Maintenance request raised for ${asset.tag}.`);
  };

  const updateStatus = (id, newStatus) => {
    const record = requests.find((r) => r.id === id);
    if (!record) return;

    const updatedRequests = requests.map((r) =>
      r.id === id
        ? {
            ...r,
            status: newStatus,
            resolvedAt: ["Resolved", "Cancelled"].includes(newStatus)
              ? new Date().toISOString()
              : null,
          }
        : r
    );
    setRequests(updatedRequests);
    saveMaintenance(updatedRequests);

    const updatedAssets = assets.map((a) => {
      if (a.tag !== record.asset) return a;
      if (["Resolved", "Cancelled"].includes(newStatus)) {
        // Only hand the asset back if nothing else has since moved it off "Under Maintenance"
        return a.status === "Under Maintenance"
          ? { ...a, status: record.previousStatus || "Available" }
          : a;
      }
      // Re-opened or moved back to active work — make sure it reads as under maintenance
      return { ...a, status: "Under Maintenance" };
    });
    setAssets(updatedAssets);
    saveAssets(updatedAssets);

    logActivity(`${record.asset} maintenance request marked ${newStatus}`);
  };

  const q = search.toLowerCase();
  const visible = requests.filter((r) => {
    const matchQ =
      !q || [r.asset, r.assetName, r.issue].some((f) => (f || "").toLowerCase().includes(q));
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchQ && matchStatus;
  });

  const statusIcon = {
    Open: <AlertTriangle size={13} />,
    "In Progress": <Clock size={13} />,
    Resolved: <CircleCheck size={13} />,
    Cancelled: <CircleX size={13} />,
  };

  const statusClass = (s) => `m-status m-${s.toLowerCase().replace(/\s+/g, "-")}`;
  const priorityClass = (p) => `priority-pill p-${p.toLowerCase()}`;

  return (
    <Layout>
      <div className="maint">
        <div className="maint-head">
          <div>
            <h1>Maintenance</h1>
            <p>Raise issues against any asset and track them through to resolution</p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <Wrench size={16} /> Raise a Maintenance Request
          </div>

          <div className="row">
            <label className="field">
              Asset
              <select
                value={form.assetTag}
                onChange={(e) => setForm({ ...form, assetTag: e.target.value })}
              >
                <option value="">Select asset…</option>
                {selectableAssets.map((a) => (
                  <option key={a.id} value={a.tag}>
                    {a.tag} — {a.name} ({a.status})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            Issue description
            <textarea
              rows={3}
              placeholder="e.g. Trackpad unresponsive, needs a service check"
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
            />
          </label>

          {selectableAssets.length === 0 && (
            <p className="hint">No assets available yet — register one in Assets first.</p>
          )}
          {error && (
            <div className="banner banner-red">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          {notice && (
            <div className="banner banner-green">
              <CircleCheck size={16} /> {notice}
            </div>
          )}

          <button className="btn-primary" onClick={raiseRequest}>
            <Wrench size={14} /> Submit Request
          </button>
        </div>

        <div className="panel">
          <div className="panel-title">
            <ListChecks size={16} /> Maintenance Requests
          </div>

          <div className="filter-bar">
            <div className="search-box">
              <Search size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tag, asset name, or issue…"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Raised by</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      {requests.length === 0
                        ? "No maintenance requests yet."
                        : "No requests match your search or filters."}
                    </td>
                  </tr>
                )}
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="tag-cell">{r.asset}</span>
                      <div className="sub-text">{r.assetName}</div>
                    </td>
                    <td className="issue-cell">{r.issue}</td>
                    <td>
                      <span className={priorityClass(r.priority)}>{r.priority}</span>
                    </td>
                    <td>{r.raisedBy}</td>
                    <td>{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td>
                      <div className={statusClass(r.status)}>
                        {statusIcon[r.status]}
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}