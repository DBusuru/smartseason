import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    if (role === "admin") { setEmail("admin@smartseason.com"); setPassword("admin123"); }
    else { setEmail("john@smartseason.com"); setPassword("agent123"); }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a2e1a 0%, #2d5016 60%, #4d8526 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "#fff", marginBottom: 6 }}>SmartSeason</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Field Monitoring System</p>
        </div>

        <div className="card" style={{ padding: "28px 32px" }}>
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@smartseason.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "10px", fontSize: 15, marginTop: 4 }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <hr className="divider" />

          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Quick demo login:</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => fillDemo("admin")}>
              Admin user
            </button>
            <button className="btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => fillDemo("agent")}>
              Field agent
            </button>
          </div>
        </div>
        <style>{`
          @media (max-width: 480px) {
            .login-card { padding: 20px 16px !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
