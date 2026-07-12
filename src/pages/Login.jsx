import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Boxes } from "lucide-react";
import { login } from "../utils/auth";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    try {
      login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="brand-side">
          <div className="brand-mark">
            <Boxes size={28} strokeWidth={2} />
          </div>
          <h1 className="brand-name">AssetFlow</h1>
          <p className="brand-tagline">
            Track every asset, allocation, and booking — in one place.
          </p>
        </div>

        <div className="form-side">
          <h2 className="form-heading">Welcome back</h2>
          <p className="form-subheading">Sign in to your workspace</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="row-end">
              <a href="#" className="link-muted">Forgot password?</a>
            </div>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <button type="submit" className="primary-btn">
              Sign in
            </button>
          </form>

          <div className="divider">
            <span>New here</span>
          </div>

          <p className="signup-note">
            Signing up creates a standard employee account.
            Admin and manager access is granted later by your organization's admin.
          </p>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/signup")}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}