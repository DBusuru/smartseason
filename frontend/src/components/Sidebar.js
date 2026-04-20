import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

const ICONS = { dashboard: "⊞", fields: "◫", agents: "◉" };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() { logout(); navigate("/login"); }
  function handleNavClick() { setIsOpen(false); }

  return (
    <>
      <style>{`
        #sidebar {
          width: 220px;
          min-height: 100vh;
          background: #1a2e1a;
          display: flex;
          flex-direction: column;
          padding: 0 0 24px 0;
          flex-shrink: 0;
        }
        #hamburger-btn {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 1001;
          background: #1a2e1a;
          border: none;
          color: #fff;
          font-size: 22px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
          min-height: auto;
          line-height: 1;
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }
        @media (max-width: 767px) {
          #hamburger-btn { display: block; }
          .sidebar-overlay.open { display: block; }
          #sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          #sidebar.open { transform: translateX(0); }
        }
        @media (min-width: 768px) {
          #sidebar { position: sticky; top: 0; height: 100vh; }
        }
      `}</style>

      <div className={`sidebar-overlay${isOpen ? " open" : ""}`} onClick={() => setIsOpen(false)} />

      <button id="hamburger-btn" onClick={() => setIsOpen(o => !o)} aria-label="Toggle menu">
        {isOpen ? "✕" : "☰"}
      </button>

      <nav id="sidebar" className={isOpen ? "open" : ""}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#fff", lineHeight: 1.2 }}>
            🌿 SmartSeason
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Field Monitoring
          </div>
        </div>

        <div style={{ flex: 1, padding: "4px 0" }}>
          <NavLink to="/dashboard" style={linkStyle} onClick={handleNavClick}>{ICONS.dashboard} Dashboard</NavLink>
          <NavLink to="/fields" style={linkStyle} onClick={handleNavClick}>{ICONS.fields} Fields</NavLink>
          {user?.role === "admin" && (
            <NavLink to="/agents" style={linkStyle} onClick={handleNavClick}>{ICONS.agents} Agents</NavLink>
          )}
        </div>

        <div style={{ padding: "16px 20px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{user?.name}</div>
          <div style={{
            display: "inline-block", fontSize: 11,
            background: user?.role === "admin" ? "rgba(106,173,56,0.25)" : "rgba(255,255,255,0.1)",
            color: user?.role === "admin" ? "#6aad38" : "rgba(255,255,255,0.6)",
            padding: "2px 8px", borderRadius: 99, marginBottom: 12, textTransform: "capitalize",
          }}>
            {user?.role}
          </div>
          <button onClick={handleLogout} style={{
            display: "block", width: "100%", background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.6)", border: "none", borderRadius: 8,
            padding: "7px 12px", fontSize: 13, cursor: "pointer", textAlign: "left",
          }}>
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}
