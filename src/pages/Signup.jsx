import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Boxes } from "lucide-react";
import "./Login.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup attempt:", { name, email });
    // TODO: connect to backend signup endpoint (role fixed to 'employee' server-side)
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
          <h2 className="form-heading">Create your account</h2>
          <p className="form-subheading">
            New accounts start as Employee — org admins grant elevated access later
          </p>

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="name">Full name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-btn" style={{ marginTop: "8px" }}>
              Create account
            </button>
          </form>

          <div className="divider">
            <span>Already registered</span>
          </div>

          <button type="button" className="secondary-btn" onClick={() => navigate("/")}>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}