import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleNavClick() {
    // Close mobile menu when a nav link is clicked
    setIsOpen(false);
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${isOpen ? " open" : ""}`}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Hamburger button - mobile only */}
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1001,
          display: "none",
        }}
        id="hamburger-btn"
      >
        ☰
      </button>

      {/* Sidebar */}
      <nav
        style={{
          ...navStyle,
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
        id="sidebar"
      >
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
            <NavLink to="/dashboard" style={linkStyle} onClick={handleNavClick}>
              {ICONS.dashboard} Dashboard
            </NavLink>
            <NavLink to="/fields" style={linkStyle} onClick={handleNavClick}>
              {ICONS.fields} Fields
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/agents" style={linkStyle} onClick={handleNavClick}>
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

      <style>{`
        @media (max-width: 767px) {
          #hamburger-btn { display: block !important; }
          #sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 220px;
            height: 100vh;
            background: #1a2e1a;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          #sidebar.open {
            transform: translateX(0);
          }
        }
        @media (min-width: 768px) {
          #hamburger-btn { display: none !important; }
          .sidebar-overlay { display: none !important; }
          #sidebar {
            position: static !important;
            width: 220px;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
