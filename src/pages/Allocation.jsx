import { useState } from "react";
import {
  UserCheck, ArrowLeftRight, Undo2, AlertTriangle,
  CheckCircle2, XCircle, History,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  getAssets, saveAssets, getAllocations, saveAllocations,
  getTransfers, saveTransfers, logActivity,
} from "../utils/appData";
import { getEmployees } from "../utils/orgData";
import "./Allocation.css";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function Allocation() {
  const [assets, setAssets] = useState(getAssets());
  const [allocations, setAllocations] = useState(getAllocations());
  const [transfers, setTransfers] = useState(getTransfers());
  const [selectedTag, setSelectedTag] = useState("");
  const [allocForm, setAllocForm] = useState({ holder: "", expectedReturn: "" });
  const [transferForm, setTransferForm] = useState({ to: "", reason: "" });
  const [returnCondition, setReturnCondition] = useState("Good");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const employees = getEmployees();
  const empName = (e) => e.name || e.fullName || e.email;

  const asset = assets.find((a) => a.tag === selectedTag);
  const activeAllocation = allocations.find(
    (al) => al.asset === selectedTag && al.status === "Active"
  );
  const pendingTransfers = transfers.filter((t) => t.status === "Requested");
  const history = allocations
    .filter((al) => al.asset === selectedTag)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const updateAssetStatus = (tag, status, extra = {}) => {
    const updated = assets.map((a) =>
      a.tag === tag ? { ...a, status, ...extra } : a
    );
    setAssets(updated);
    saveAssets(updated);
  };

  const selectAsset = (tag) => {
    setSelectedTag(tag);
    setError("");
    setNotice("");
    setAllocForm({ holder: "", expectedReturn: "" });
    setTransferForm({ to: "", reason: "" });
  };

  // ---------- RULE A lives here ----------
  const allocate = () => {
    setError("");
    setNotice("");
    if (!allocForm.holder || !allocForm.expectedReturn) {
      setError("Select an employee and an expected return date.");
      return;
    }
    // Re-check storage at save time — never trust UI state alone
    const existing = getAllocations().find(
      (al) => al.asset === asset.tag && al.status === "Active"
    );
    if (existing) {
      setError(
        `Blocked: ${asset.tag} is already held by ${existing.holder}. Submit a transfer request instead.`
      );
      return;
    }
    const record = {
      id: Date.now(),
      asset: asset.tag,
      assetName: asset.name,
      holder: allocForm.holder,
      expectedReturn: allocForm.expectedReturn,
      status: "Active",
      date: new Date().toISOString(),
    };
    const updated = [record, ...allocations];
    setAllocations(updated);
    saveAllocations(updated);
    updateAssetStatus(asset.tag, "Allocated");
    logActivity(`${asset.tag} ${asset.name} allocated to ${record.holder}`);
    setNotice(`${asset.tag} allocated to ${record.holder}.`);
    setAllocForm({ holder: "", expectedReturn: "" });
  };

  const submitTransfer = () => {
    setError("");
    setNotice("");
    if (!transferForm.to) {
      setError("Select the employee the asset should transfer to.");
      return;
    }
    if (transferForm.to === activeAllocation.holder) {
      setError(`${activeAllocation.holder} already holds this asset.`);
      return;
    }
    const record = {
      id: Date.now(),
      asset: asset.tag,
      assetName: asset.name,
      from: activeAllocation.holder,
      to: transferForm.to,
      reason: transferForm.reason.trim(),
      status: "Requested",
      date: new Date().toISOString(),
    };
    const updated = [record, ...transfers];
    setTransfers(updated);
    saveTransfers(updated);
    logActivity(
      `Transfer requested: ${asset.tag} from ${record.from} to ${record.to}`
    );
    setNotice("Transfer request submitted — pending approval below.");
    setTransferForm({ to: "", reason: "" });
  };

  const approveTransfer = (t) => {
    // Close the old allocation, open a new one for the receiver
    const old = allocations.find(
      (al) => al.asset === t.asset && al.status === "Active"
    );
    let updatedAlloc = allocations.map((al) =>
      al.id === old?.id
        ? { ...al, status: "Returned", returnedAt: new Date().toISOString(), returnCondition: "Transferred" }
        : al
    );
    updatedAlloc = [
      {
        id: Date.now(),
        asset: t.asset,
        assetName: t.assetName,
        holder: t.to,
        expectedReturn: old?.expectedReturn || "",
        status: "Active",
        date: new Date().toISOString(),
      },
      ...updatedAlloc,
    ];
    setAllocations(updatedAlloc);
    saveAllocations(updatedAlloc);

    const updatedTransfers = transfers.map((tr) =>
      tr.id === t.id
        ? { ...tr, status: "Approved", approvedAt: new Date().toISOString() }
        : tr
    );
    setTransfers(updatedTransfers);
    saveTransfers(updatedTransfers);
    logActivity(`Transfer approved: ${t.asset} re-allocated from ${t.from} to ${t.to}`);
    setNotice(`${t.asset} re-allocated to ${t.to}.`);
  };

  const rejectTransfer = (t) => {
    const updated = transfers.map((tr) =>
      tr.id === t.id ? { ...tr, status: "Rejected" } : tr
    );
    setTransfers(updated);
    saveTransfers(updated);
    logActivity(`Transfer rejected: ${t.asset} stays with ${t.from}`);
  };

  const returnAsset = () => {
    const updated = allocations.map((al) =>
      al.id === activeAllocation.id
        ? {
            ...al,
            status: "Returned",
            returnedAt: new Date().toISOString(),
            returnCondition,
          }
        : al
    );
    setAllocations(updated);
    saveAllocations(updated);
    updateAssetStatus(asset.tag, "Available", { condition: returnCondition });
    logActivity(
      `${asset.tag} returned by ${activeAllocation.holder} — condition: ${returnCondition}`
    );
    setNotice(`${asset.tag} checked in — back to Available.`);
  };

  return (
    <Layout>
      <div className="alloc">
        <div className="alloc-head">
          <h1>Allocation &amp; Transfer</h1>
          <p>Assign assets, block double-allocation, and route transfers</p>
        </div>

        <div className="panel">
          <label className="field">
            Asset
            <select value={selectedTag} onChange={(e) => selectAsset(e.target.value)}>
              <option value="">Select an asset…</option>
              {assets.map((a) => (
                <option key={a.tag} value={a.tag}>
                  {a.tag} — {a.name} ({a.status})
                </option>
              ))}
            </select>
          </label>
          {assets.length === 0 && (
            <p className="hint">No assets yet — register one on the Assets screen first.</p>
          )}
        </div>

        {notice && (
          <div className="banner banner-green">
            <CheckCircle2 size={15} /> {notice}
          </div>
        )}
        {error && (
          <div className="banner banner-red">
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* ----- Available: allocate ----- */}
        {asset && asset.status === "Available" && (
          <div className="panel">
            <div className="panel-title">
              <UserCheck size={15} /> Allocate {asset.tag}
            </div>
            <div className="row">
              <label className="field">
                Allocate to
                <select
                  value={allocForm.holder}
                  onChange={(e) => setAllocForm({ ...allocForm, holder: e.target.value })}
                >
                  <option value="">Select employee…</option>
                  {employees.map((emp) => (
                    <option key={emp.id || emp.email} value={empName(emp)}>
                      {empName(emp)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Expected return
                <input
                  type="date"
                  value={allocForm.expectedReturn}
                  onChange={(e) =>
                    setAllocForm({ ...allocForm, expectedReturn: e.target.value })
                  }
                />
              </label>
            </div>
            <button className="btn-primary" onClick={allocate}>
              Allocate asset
            </button>
          </div>
        )}

        {/* ----- Allocated: RULE A block + transfer + return ----- */}
        {asset && asset.status === "Allocated" && activeAllocation && (
          <>
            <div className="banner banner-red block-banner">
              <AlertTriangle size={15} />
              <div>
                <strong>Already allocated to {activeAllocation.holder}</strong>
                <br />
                Direct re-allocation is blocked — submit a transfer request below.
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                <ArrowLeftRight size={15} /> Transfer request
              </div>
              <div className="row">
                <label className="field">
                  From
                  <input value={activeAllocation.holder} readOnly className="readonly" />
                </label>
                <label className="field">
                  To
                  <select
                    value={transferForm.to}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, to: e.target.value })
                    }
                  >
                    <option value="">Select employee…</option>
                    {employees
                      .filter((emp) => empName(emp) !== activeAllocation.holder)
                      .map((emp) => (
                        <option key={emp.id || emp.email} value={empName(emp)}>
                          {empName(emp)}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <label className="field">
                Reason
                <textarea
                  rows={3}
                  value={transferForm.reason}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, reason: e.target.value })
                  }
                  placeholder="Why should this asset move?"
                />
              </label>
              <button className="btn-primary" onClick={submitTransfer}>
                Submit request
              </button>
            </div>

            <div className="panel">
              <div className="panel-title">
                <Undo2 size={15} /> Return / check-in
              </div>
              <div className="row row-end">
                <label className="field">
                  Condition on return
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                  >
                    {["New", "Good", "Fair", "Poor"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <button className="btn-outline" onClick={returnAsset}>
                  Return asset
                </button>
              </div>
            </div>
          </>
        )}

        {asset &&
          asset.status !== "Available" &&
          asset.status !== "Allocated" && (
            <div className="banner banner-amber">
              <AlertTriangle size={15} />
              {asset.tag} is {asset.status} — it can't be allocated right now.
            </div>
          )}

        {/* ----- Pending transfers ----- */}
        {pendingTransfers.length > 0 && (
          <div className="panel">
            <div className="panel-title">
              <ArrowLeftRight size={15} /> Pending transfer requests
            </div>
            <ul className="transfer-list">
              {pendingTransfers.map((t) => (
                <li key={t.id}>
                  <div className="transfer-info">
                    <strong>{t.asset}</strong> {t.assetName} · {t.from} →{" "}
                    {t.to}
                    {t.reason && <span className="reason">“{t.reason}”</span>}
                  </div>
                  <div className="transfer-actions">
                    <button className="btn-mini approve" onClick={() => approveTransfer(t)}>
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button className="btn-mini reject" onClick={() => rejectTransfer(t)}>
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ----- History ----- */}
        {asset && (
          <div className="panel">
            <div className="panel-title">
              <History size={15} /> Allocation history — {asset.tag}
            </div>
            {history.length === 0 ? (
              <p className="hint">No allocations yet for this asset.</p>
            ) : (
              <ul className="history-list">
                {history.map((h) => (
                  <li key={h.id}>
                    <span className="h-date">{fmtDate(h.date)}</span>
                    Allocated to {h.holder}
                    {h.status === "Returned" &&
                      ` — returned${h.returnCondition ? ` · condition: ${h.returnCondition}` : ""}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}