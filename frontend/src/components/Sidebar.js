import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navStyle = {
  width: 220,
  minHeight: "100vh",
  background: "#1a2e1a",
  display: "flex",
  flexDirection: "column",
  padding: "0 0 24px 0",
  flexShrink: 0,
};

const logoStyle = {
  padding: "24px 20px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 12,
};

const linkStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 20px",
  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
  borderRadius: 0,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
  transition: "background 0.15s, color 0.15s",
  borderLeft: isActive ? "3px solid #6aad38" : "3px solid transparent",
});

const ICONS = {
  dashboard: "⊞",
  fields: "◫",
  agents: "◉",
  profile: "○",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#fff", lineHeight: 1.2 }}>
          🌿 SmartSeason
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Field Monitoring
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ padding: "4px 0" }}>
          <NavLink to="/dashboard" style={linkStyle}>
            {ICONS.dashboard} Dashboard
          </NavLink>
          <NavLink to="/fields" style={linkStyle}>
            {ICONS.fields} Fields
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/agents" style={linkStyle}>
              {ICONS.agents} Agents
            </NavLink>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 20px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{user?.name}</div>
        <div style={{
          display: "inline-block",
          fontSize: 11,
          background: user?.role === "admin" ? "rgba(106,173,56,0.25)" : "rgba(255,255,255,0.1)",
          color: user?.role === "admin" ? "#6aad38" : "rgba(255,255,255,0.6)",
          padding: "2px 8px",
          borderRadius: 99,
          marginBottom: 12,
          textTransform: "capitalize",
        }}>
          {user?.role}
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "block",
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.6)",
            border: "none",
            borderRadius: 8,
            padding: "7px 12px",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
