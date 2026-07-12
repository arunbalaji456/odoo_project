// Shared localStorage data layer for AssetFlow.
// Every screen reads/writes through these helpers so keys stay consistent.

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getAssets = () => read("af_assets");
export const saveAssets = (list) => write("af_assets", list);

export const getAllocations = () => read("af_allocations");
export const saveAllocations = (list) => write("af_allocations", list);

export const getBookings = () => read("af_bookings");
export const saveBookings = (list) => write("af_bookings", list);

export const getTransfers = () => read("af_transfers");
export const saveTransfers = (list) => write("af_transfers", list);

export const getMaintenance = () => read("af_maintenance");
export const saveMaintenance = (list) => write("af_maintenance", list);

export const getActivity = () => read("af_activity");

// Call logActivity("Laptop AF-0114 allocated to Priya Shah") from any screen —
// the Dashboard feed and Notifications screen both read from this.
export const logActivity = (text) => {
  const list = read("af_activity");
  list.unshift({ id: Date.now(), text, time: new Date().toISOString() });
  write("af_activity", list.slice(0, 50));
};

export const timeAgo = (iso) => {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};