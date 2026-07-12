import { useState } from "react";
import {
  CalendarPlus, AlertTriangle, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import Layout from "../components/Layout";
import { getAssets, getBookings, saveBookings, logActivity } from "../utils/appData";
import { getCurrentUser } from "../utils/auth";
import "./Booking.css";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 → 18:00

const fmt = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

// Live status derived from time — no manual flipping needed
const liveStatus = (b) => {
  if (b.status === "Cancelled") return "Cancelled";
  const now = new Date();
  const start = new Date(`${b.date}T${b.start}`);
  const end = new Date(`${b.date}T${b.end}`);
  if (now < start) return "Upcoming";
  if (now >= start && now < end) return "Ongoing";
  return "Completed";
};

export default function Booking() {
  const [bookings, setBookings] = useState(getBookings());
  const [resource, setResource] = useState("");
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState({ start: "", end: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const bookable = getAssets().filter((a) => a.bookable);
  const user = getCurrentUser();
  const userName = user?.name || user?.fullName || user?.email || "Unknown";

  const dayBookings = bookings
    .filter(
      (b) => b.resource === resource && b.date === date && b.status !== "Cancelled"
    )
    .sort((a, b) => a.start.localeCompare(b.start));

  // ---------- RULE B lives here ----------
  const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

  const bookSlot = () => {
    setError("");
    setNotice("");
    if (!resource) return setError("Select a resource first.");
    if (!form.start || !form.end) return setError("Pick a start and end time.");
    if (form.end <= form.start)
      return setError("End time must be after start time.");

    // Re-check storage at save time — never trust UI state alone
    const conflict = getBookings().find(
      (b) =>
        b.resource === resource &&
        b.date === date &&
        b.status !== "Cancelled" &&
        overlaps(form.start, form.end, b.start, b.end)
    );
    if (conflict) {
      setError(
        `Conflict: requested ${fmt(form.start)}–${fmt(form.end)} overlaps the ${fmt(
          conflict.start
        )}–${fmt(conflict.end)} booking by ${conflict.bookedBy}. Slot is unavailable.`
      );
      return;
    }

    const asset = bookable.find((a) => a.tag === resource);
    const record = {
      id: Date.now(),
      resource,
      resourceName: asset?.name || resource,
      date,
      start: form.start,
      end: form.end,
      bookedBy: userName,
      status: "Upcoming",
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...bookings];
    setBookings(updated);
    saveBookings(updated);
    logActivity(
      `Booking confirmed: ${record.resourceName} ${fmt(form.start)}–${fmt(form.end)} by ${userName}`
    );
    setNotice(
      `Booked ${record.resourceName} on ${date}, ${fmt(form.start)}–${fmt(form.end)}.`
    );
    setForm({ start: "", end: "" });
  };

  const cancelBooking = (b) => {
    const updated = bookings.map((bk) =>
      bk.id === b.id ? { ...bk, status: "Cancelled" } : bk
    );
    setBookings(updated);
    saveBookings(updated);
    logActivity(`Booking cancelled: ${b.resourceName} ${fmt(b.start)}–${fmt(b.end)}`);
  };

  // Timeline geometry: 8:00 = top, each hour = 48px
  const toY = (t) => {
    const [h, m] = t.split(":").map(Number);
    return (h - 8) * 48 + (m / 60) * 48;
  };

  const myUpcoming = bookings
    .filter((b) => liveStatus(b) === "Upcoming" || liveStatus(b) === "Ongoing")
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));

  return (
    <Layout>
      <div className="booking">
        <div className="booking-head">
          <h1>Resource Booking</h1>
          <p>Reserve rooms, vehicles and shared equipment — no overlaps allowed</p>
        </div>

        <div className="panel">
          <div className="row">
            <label className="field">
              Resource
              <select value={resource} onChange={(e) => { setResource(e.target.value); setError(""); setNotice(""); }}>
                <option value="">Select a bookable resource…</option>
                {bookable.map((a) => (
                  <option key={a.tag} value={a.tag}>
                    {a.tag} — {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Date
              <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setError(""); setNotice(""); }} />
            </label>
          </div>
          {bookable.length === 0 && (
            <p className="hint">
              No bookable resources yet — register an asset with the “Bookable
              resource” checkbox ticked.
            </p>
          )}
        </div>

        {notice && (
          <div className="banner banner-green"><CheckCircle2 size={15} /> {notice}</div>
        )}
        {error && (
          <div className="banner banner-red"><AlertTriangle size={15} /> {error}</div>
        )}

        {resource && (
          <div className="booking-grid">
            {/* ---- Day timeline ---- */}
            <div className="panel timeline-panel">
              <div className="panel-title"><Clock size={15} /> Day view — {date}</div>
              <div className="timeline" style={{ height: HOURS.length * 48 }}>
                {HOURS.map((h) => (
                  <div key={h} className="hour-line" style={{ top: (h - 8) * 48 }}>
                    <span className="hour-label">
                      {h % 12 === 0 ? 12 : h % 12}:00 {h >= 12 ? "PM" : "AM"}
                    </span>
                  </div>
                ))}
                {dayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="slot"
                    style={{ top: toY(b.start), height: Math.max(toY(b.end) - toY(b.start), 22) }}
                  >
                    <span>
                      {fmt(b.start)}–{fmt(b.end)} · {b.bookedBy}
                    </span>
                    <button className="slot-cancel" onClick={() => cancelBooking(b)} title="Cancel booking">
                      <XCircle size={13} />
                    </button>
                  </div>
                ))}
                {dayBookings.length === 0 && (
                  <p className="timeline-empty">No bookings this day — all slots free.</p>
                )}
              </div>
            </div>

            {/* ---- Book a slot ---- */}
            <div className="panel">
              <div className="panel-title"><CalendarPlus size={15} /> Book a slot</div>
              <label className="field">
                Start time
                <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </label>
              <label className="field">
                End time
                <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </label>
              <button className="btn-primary" onClick={bookSlot}>Book slot</button>
              <p className="hint">
                Booking as <strong>{userName}</strong>. A slot may start exactly
                when another ends.
              </p>
            </div>
          </div>
        )}

        {/* ---- All upcoming bookings ---- */}
        {myUpcoming.length > 0 && (
          <div className="panel">
            <div className="panel-title"><Clock size={15} /> Upcoming &amp; ongoing bookings</div>
            <ul className="booking-list">
              {myUpcoming.map((b) => (
                <li key={b.id}>
                  <span className={`b-status ${liveStatus(b).toLowerCase()}`}>
                    {liveStatus(b)}
                  </span>
                  <span className="b-info">
                    <strong>{b.resourceName}</strong> · {b.date} ·{" "}
                    {fmt(b.start)}–{fmt(b.end)} · {b.bookedBy}
                  </span>
                  <button className="btn-mini reject" onClick={() => cancelBooking(b)}>
                    <XCircle size={13} /> Cancel
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}