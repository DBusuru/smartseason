import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FieldCard from "../components/FieldCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getFields()])
      .then(([s, f]) => { setStats(s); setFields(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading">Loading dashboard…</div></Layout>;

  const atRiskFields = fields.filter(f => f.status === "at_risk");
  const recentFields = [...fields]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 4);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>
            {user?.role === "admin" ? "Farm Overview" : "My Fields"}
          </h1>
          <p>
            {user?.role === "admin"
              ? "Monitor all fields and agent activity"
              : `Welcome back, ${user?.name?.split(" ")[0]}`}
          </p>
        </div>
        {user?.role === "admin" && (
          <button className="btn-primary" onClick={() => navigate("/fields/new")}>
            + New Field
          </button>
        )}
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-label">Total Fields</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">{stats.total_area?.toFixed(1)} ha total area</div>
          </div>
          <div className="stat-card" style={{ borderLeft: "3px solid var(--green-400)" }}>
            <div className="stat-label">Active</div>
            <div className="stat-value" style={{ color: "var(--green-600)" }}>{stats.by_status.active}</div>
            <div className="stat-sub">growing well</div>
          </div>
          <div className="stat-card" style={{ borderLeft: "3px solid var(--amber-600)" }}>
            <div className="stat-label">At Risk</div>
            <div className="stat-value" style={{ color: "var(--amber-600)" }}>{stats.by_status.at_risk}</div>
            <div className="stat-sub">needs attention</div>
          </div>
          <div className="stat-card" style={{ borderLeft: "3px solid var(--soil-300)" }}>
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: "var(--soil-500)" }}>{stats.by_status.completed}</div>
            <div className="stat-sub">harvested</div>
          </div>
        </div>
      )}

      {/* Stage breakdown */}
      {stats && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Stage Breakdown</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            {[
              { key: "planted", label: "🌱 Planted", color: "var(--blue-600)" },
              { key: "growing", label: "🌿 Growing", color: "var(--green-600)" },
              { key: "ready",   label: "🌾 Ready",   color: "var(--amber-600)" },
              { key: "harvested", label: "📦 Harvested", color: "var(--soil-500)" },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ textAlign: "center", padding: "12px 8px", background: "var(--soil-50)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{label.split(" ")[0]}</div>
                <div style={{ fontSize: 24, fontFamily: "'Fraunces', serif", fontWeight: 500, color }}>{stats.by_stage[key]}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label.split(" ")[1]}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          {stats.total > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
                {[
                  { key: "planted", color: "var(--blue-600)" },
                  { key: "growing", color: "var(--green-500)" },
                  { key: "ready",   color: "var(--amber-600)" },
                  { key: "harvested", color: "var(--soil-300)" },
                ].map(({ key, color }) => {
                  const pct = (stats.by_stage[key] / stats.total) * 100;
                  return pct > 0 ? (
                    <div key={key} style={{ flex: pct, background: color, transition: "flex 0.4s" }} />
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* At Risk fields */}
      {atRiskFields.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>⚠️ Needs Attention</h2>
            <span className="badge badge-at_risk">{atRiskFields.length}</span>
          </div>
          <div className="grid-2">
            {atRiskFields.map(f => <FieldCard key={f.id} field={f} />)}
          </div>
        </div>
      )}

      {/* Recent fields */}
      <div>
        <div className="flex justify-between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18 }}>Recent Fields</h2>
          <button className="btn-secondary btn-sm" onClick={() => navigate("/fields")}>
            View all
          </button>
        </div>
        {recentFields.length === 0 ? (
          <div className="empty-state">
            <h3>No fields yet</h3>
            <p>
              {user?.role === "admin"
                ? "Create your first field to get started."
                : "You have no fields assigned yet."}
            </p>
          </div>
        ) : (
          <div className="grid-2">
            {recentFields.map(f => <FieldCard key={f.id} field={f} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
