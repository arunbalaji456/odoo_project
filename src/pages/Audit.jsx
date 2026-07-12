import { useState } from "react";
import { ClipboardCheck, AlertTriangle } from "lucide-react";
import Layout from "../components/Layout";
import "./Audit.css";

const initialAssets = [
  { id: "AF-003", name: "Dell laptop", expectedLocation: "Desk E12", verification: "Verified" },
  { id: "AF-9921", name: "Office chair", expectedLocation: "Desk E14", verification: "Missing" },
  { id: "AF-9838", name: "Monitor", expectedLocation: "Desk E15", verification: "Damaged" },
];

export default function Audit() {
  const [assets, setAssets] = useState(initialAssets);
  const [cycleClosed, setCycleClosed] = useState(false);

  const flaggedCount = assets.filter(
    (a) => a.verification === "Missing" || a.verification === "Damaged"
  ).length;

  const updateVerification = (id, value) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, verification: value } : a))
    );
  };

  const badgeTone = (status) =>
    status === "Verified" ? "tone-green" : status === "Missing" ? "tone-pink" : "tone-amber";

  return (
    <Layout>
      <div className="audit">
        <div className="audit-head">
          <h1>Asset Audit</h1>
          <p>Verify assets against expected location for the active audit cycle</p>
        </div>

        <div className="audit-scope-card">
          <ClipboardCheck size={16} />
          <div>
            <strong>Engineering dept — 1 to 15 Jul</strong>
            <span>Auditor: Iqbal</span>
          </div>
        </div>

        <div className="audit-table-card">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Expected location</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td>{a.id} {a.name}</td>
                  <td>{a.expectedLocation}</td>
                  <td>
                    {cycleClosed ? (
                      <span className={`audit-badge ${badgeTone(a.verification)}`}>
                        {a.verification}
                      </span>
                    ) : (
                      <select
                        value={a.verification}
                        onChange={(e) => updateVerification(a.id, e.target.value)}
                        className="audit-select"
                      >
                        <option value="Verified">Verified</option>
                        <option value="Missing">Missing</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {flaggedCount > 0 && (
          <div className="audit-discrepancy-banner">
            <AlertTriangle size={15} />
            {flaggedCount} asset{flaggedCount > 1 ? "s" : ""} flagged — discrepancy report generated automatically
          </div>
        )}

        <button
          className="qa-btn primary"
          disabled={cycleClosed}
          onClick={() => setCycleClosed(true)}
        >
          {cycleClosed ? "Audit cycle closed" : "Close audit cycle"}
        </button>
      </div>
    </Layout>
  );
}