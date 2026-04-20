import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Layout from "../components/Layout";

export default function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading">Loading agents…</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Field Agents</h1>
          <p>{agents.length} registered agent{agents.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="empty-state">
          <h3>No agents yet</h3>
          <p>Agents will appear here once they register.</p>
        </div>
      ) : (
        <div className="grid-2">
          {agents.map(agent => (
            <div key={agent.id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--green-100)", color: "var(--green-700)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 500, flexShrink: 0,
                }}>
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 16 }}>{agent.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{agent.email}</div>
                </div>
              </div>

              <hr className="divider" style={{ margin: "12px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 24, fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
                    {agent.field_count}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    field{agent.field_count !== 1 ? "s" : ""} assigned
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Joined {new Date(agent.created_at).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                </div>
              </div>

              <button
                className="btn-secondary btn-sm"
                style={{ marginTop: 14, width: "100%" }}
                onClick={() => navigate(`/fields?agent=${agent.id}`)}
              >
                View assigned fields
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
