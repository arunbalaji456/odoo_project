import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OrgSetup from "./pages/OrgSetup";
import Assets from "./pages/Assets";
import Allocation from "./pages/Allocation";
import Booking from "./pages/Booking";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Maintenance from "./pages/Maintenance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/org-setup" element={<OrgSetup />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;