import { useState, Fragment } from "react";
import { PackagePlus, Search, ChevronDown, ChevronUp, X } from "lucide-react";
import Layout from "../components/Layout";
import {
  getAssets, saveAssets, getAllocations, getMaintenance, logActivity,
} from "../utils/appData";
import { getCategories } from "../utils/orgData"; // ⚠️ check this export name
import "./Assets.css";

const STATUSES = [
  "Available", "Allocated", "Reserved", "Under Maintenance",
  "Lost", "Retired", "Disposed",
];
const CONDITIONS = ["New", "Good", "Fair", "Poor"];

const nextTag = (assets) => {
  const max = assets.reduce((m, a) => {
    const n = parseInt((a.tag || "").replace("AF-", ""), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `AF-${String(max + 1).padStart(4, "0")}`;
};

const emptyForm = {
  name: "", category: "", serial: "", location: "",
  acquisitionDate: "", condition: "Good", bookable: false,
};

export default function Assets() {
  const [assets, setAssets] = useState(getAssets());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  // Categories come from Organization Setup (Screen 3) — single source of truth
  const categories = (getCategories() || [])
    .map((c) => (typeof c === "string" ? c : c.name))
    .filter(Boolean);

  const set = (field) => (e) =>
    setForm({
      ...form,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const registerAsset = () => {
    if (!form.name.trim() || !form.category || !form.serial.trim()) {
      setError("Name, category and serial number are required.");
      return;
    }
    const tag = nextTag(assets);
    const asset = {
      id: Date.now(),
      tag,
      ...form,
      name: form.name.trim(),
      serial: form.serial.trim(),
      location: form.location.trim(),
      status: "Available",
      createdAt: new Date().toISOString(),
    };
    const updated = [asset, ...assets];
    setAssets(updated);
    saveAssets(updated);
    logActivity(`${tag} ${asset.name} registered — status Available`);
    setForm(emptyForm);
    setError("");
    setShowForm(false);
  };

  const historyFor = (tag) => {
    const alloc = getAllocations()
      .filter((al) => al.asset === tag)
      .map((al) => ({
        time: al.date || al.createdAt,
        text: `Allocated to ${al.holder}${al.status === "Returned" ? " (returned)" : ""}`,
      }));
    const maint = getMaintenance()
      .filter((m) => m.asset === tag)
      .map((m) => ({
        time: m.date || m.createdAt,
        text: `Maintenance: ${m.issue || "request"} — ${m.status}`,
      }));
    return [...alloc, ...maint].sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );
  };

  const q = search.toLowerCase();
  const visible = assets.filter((a) => {
    const matchQ =
      !q ||
      [a.tag, a.name, a.serial, a.location].some((f) =>
        (f || "").toLowerCase().includes(q)
      );
    const matchCat = catFilter === "All" || a.category === catFilter;
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const pillClass = (status) =>
    `status-pill s-${status.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Layout>
      <div className="assets">
        <div className="assets-head">
          <div>
            <h1>Assets</h1>
            <p>Register and track every asset from acquisition to disposal</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={15} /> : <PackagePlus size={15} />}
            {showForm ? "Close" : "Register Asset"}
          </button>
        </div>

        {showForm && (
          <div className="register-panel">
            <div className="form-grid">
              <label>
                Asset name*
                <input value={form.name} onChange={set("name")} placeholder="Dell Laptop" />
              </label>
              <label>
                Category*
                <select value={form.category} onChange={set("category")}>
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Serial number*
                <input value={form.serial} onChange={set("serial")} placeholder="SN-8842-XK" />
              </label>
              <label>
                Location
                <input value={form.location} onChange={set("location")} placeholder="Warehouse / Bengaluru office" />
              </label>
              <label>
                Acquisition date
                <input type="date" value={form.acquisitionDate} onChange={set("acquisitionDate")} />
              </label>
              <label>
                Condition
                <select value={form.condition} onChange={set("condition")}>
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="bookable-check">
              <input type="checkbox" checked={form.bookable} onChange={set("bookable")} />
              Bookable resource (rooms, vehicles, shared equipment)
            </label>
            {categories.length === 0 && (
              <p className="form-hint">
                No categories yet — add them in Organization setup first.
              </p>
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primary" onClick={registerAsset}>
              Save asset
            </button>
          </div>
        )}

        <div className="filter-bar">
          <div className="search-box">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tag, serial, name or location…"
            />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
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
                <th>Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-row">
                    {assets.length === 0
                      ? "No assets registered yet — click Register Asset to add the first one."
                      : "No assets match your search or filters."}
                  </td>
                </tr>
              )}
              {visible.map((a) => (
                <Fragment key={a.id}>
                  <tr>
                    <td className="tag-cell">{a.tag}</td>
                    <td>{a.name}</td>
                    <td>
                      <span className="cat-badge">{a.category}</span>
                    </td>
                    <td>
                      <span className={pillClass(a.status)}>
                        <span className="pill-dot" />
                        {a.status}
                      </span>
                    </td>
                    <td>{a.location || "—"}</td>
                    <td>
                      <button
                        className="link-btn"
                        onClick={() => setExpanded(expanded === a.tag ? null : a.tag)}
                      >
                        {expanded === a.tag ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        View
                      </button>
                    </td>
                  </tr>
                  {expanded === a.tag && (
                    <tr className="history-row">
                      <td colSpan={6}>
                        <div className="history-box">
                          <span className="history-title">History — {a.tag}</span>
                          {historyFor(a.tag).length === 0 ? (
                            <p className="history-empty">
                              No allocation or maintenance history yet.
                            </p>
                          ) : (
                            <ul>
                              {historyFor(a.tag).map((h, i) => (
                                <li key={i}>{h.text}</li>
                              ))}
                            </ul>
                          )}
                          <p className="history-meta">
                            Serial {a.serial} · Condition {a.condition} ·{" "}
                            {a.bookable ? "Bookable" : "Not bookable"}
                            {a.acquisitionDate ? ` · Acquired ${a.acquisitionDate}` : ""}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}