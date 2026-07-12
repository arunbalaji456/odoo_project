import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", email);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">AssetFlow — login</h1>

        <div className="login-logo">AF</div>

        <form onSubmit={handleSubmit}>
          <label className="login-label">Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            placeholder="••••••••••"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <a href="#" className="forgot-link">Forgot password</a>

          <hr className="divider" />

          <p className="signup-heading">New here?</p>
          <p className="signup-note">
            Sign up creates an employee account — admin roles assigned later
          </p>

          <button type="submit" className="create-account-btn">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}