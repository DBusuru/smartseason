import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const STAGES = ["planted", "growing", "ready", "harvested"];
const STAGE_LABELS = { planted: "🌱 Planted", growing: "🌿 Growing", ready: "🌾 Ready", harvested: "📦 Harvested" };
const STATUS_LABELS = { active: "Active", at_risk: "At Risk", completed: "Completed" };

export default function FieldDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [newStage, setNewStage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function loadField() {
    return api.getField(id).then(setField).catch(() => navigate("/fields"));
  }

  useEffect(() => {
    loadField().finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    if (!notes.trim()) return;
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      await api.addFieldUpdate(id, { notes, stage: newStage || undefined });
      setSuccess("Update logged successfully.");
      setNotes(""); setNewStage("");
      await loadField();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${field.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteField(id);
      navigate("/fields");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Layout><div className="loading">Loading field…</div></Layout>;
  if (!field) return null;

  const canUpdate = user?.role === "admin" || field.assigned_agent_id === user?.id;

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <button className="btn-secondary btn-sm" onClick={() => navigate("/fields")} style={{ marginBottom: 16 }}>
          ← Back to fields
        </button>
        <div className="page-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: 26 }}>{field.name}</h1>
              <span className={`badge badge-${field.status}`}>{STATUS_LABELS[field.status]}</span>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {field.crop_type}
              {field.location && <> · {field.location}</>}
              {field.area_hectares && <> · {field.area_hectares} ha</>}
            </div>
          </div>
          {user?.role === "admin" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-secondary btn-sm" onClick={() => navigate(`/fields/${id}/edit`)}>
                Edit field
              </button>
              <button className="btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        {/* Left column */}
        <div>
          {/* Field info card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>Field Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: 14 }}>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 2 }}>CURRENT STAGE</div>
                <span className={`badge badge-${field.stage}`}>{STAGE_LABELS[field.stage]}</span>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 2 }}>PLANTING DATE</div>
                <div>{new Date(field.planting_date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 2 }}>ASSIGNED AGENT</div>
                <div>{field.agent_name || <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 2 }}>TOTAL UPDATES</div>
                <div>{field.updates?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Stage timeline */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>Growth Stage</h2>
            <div style={{ display: "flex", gap: 0 }}>
              {STAGES.map((stage, i) => {
                const stageIdx = STAGES.indexOf(field.stage);
                const isPast = i < stageIdx;
                const isCurrent = i === stageIdx;
                return (
                  <div key={stage} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      height: 6,
                      background: isPast || isCurrent ? "var(--green-500)" : "var(--border)",
                      borderRadius: i === 0 ? "99px 0 0 99px" : i === STAGES.length - 1 ? "0 99px 99px 0" : 0,
                      marginBottom: 8,
                      transition: "background 0.3s",
                    }} />
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", margin: "0 auto 6px",
                      background: isCurrent ? "var(--green-500)" : isPast ? "var(--green-100)" : "var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, border: isCurrent ? "2px solid var(--green-700)" : "none",
                    }}>
                      {isPast ? "✓" : STAGE_LABELS[stage].split(" ")[0]}
                    </div>
                    <div style={{ fontSize: 11, color: isCurrent ? "var(--green-700)" : "var(--text-muted)", fontWeight: isCurrent ? 500 : 400 }}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Update history */}
          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>Update History</h2>
            {(!field.updates || field.updates.length === 0) ? (
              <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "20px 0" }}>No updates yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {field.updates.map((u, i) => (
                  <div key={u.id} style={{
                    paddingBottom: 16,
                    marginBottom: 16,
                    borderBottom: i < field.updates.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: "var(--green-100)", color: "var(--green-700)",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 500, flexShrink: 0,
                        }}>
                          {u.agent_name?.charAt(0)}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{u.agent_name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {new Date(u.created_at).toLocaleString("en-KE")}
                          </div>
                        </div>
                      </div>
                      {u.stage && <span className={`badge badge-${u.stage}`}>{STAGE_LABELS[u.stage]}</span>}
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", paddingLeft: 36, margin: 0 }}>{u.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — update form */}
        {canUpdate && (
          <div>
            <div className="card" style={{ position: "sticky", top: 24 }}>
              <h2 style={{ fontSize: 16, marginBottom: 16 }}>Log an Update</h2>
              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Update stage (optional)</label>
                  <select value={newStage} onChange={e => setNewStage(e.target.value)}>
                    <option value="">— no change —</option>
                    {STAGES.map(s => (
                      <option key={s} value={s} disabled={s === field.stage}>
                        {STAGE_LABELS[s]}{s === field.stage ? " (current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes / Observations *</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Describe what you observed in the field…"
                    rows={4}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ width: "100%" }}>
                  {submitting ? "Saving…" : "Submit Update"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
