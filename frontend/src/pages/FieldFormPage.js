import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/api";
import Layout from "../components/Layout";

const STAGES = ["planted", "growing", "ready", "harvested"];

const CROP_SUGGESTIONS = [
  "Tea", "Maize", "Beans", "Tomatoes", "Kale", "Rice",
  "Coffee", "Sugarcane", "Wheat", "Sorghum", "Potatoes", "Onions",
];

export default function FieldFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    crop_type: "",
    planting_date: "",
    stage: "planted",
    location: "",
    area_hectares: "",
    assigned_agent_id: "",
  });

  useEffect(() => {
    const tasks = [api.getAgents().then(setAgents)];
    if (isEdit) {
      tasks.push(
        api.getField(id).then(field => {
          setForm({
            name: field.name,
            crop_type: field.crop_type,
            planting_date: field.planting_date,
            stage: field.stage,
            location: field.location || "",
            area_hectares: field.area_hectares || "",
            assigned_agent_id: field.assigned_agent_id || "",
          });
        })
      );
    }
    Promise.all(tasks).finally(() => setLoading(false));
  }, [id]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const payload = {
        ...form,
        area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null,
        assigned_agent_id: form.assigned_agent_id ? parseInt(form.assigned_agent_id) : null,
      };
      if (isEdit) {
        await api.updateField(id, payload);
        navigate(`/fields/${id}`);
      } else {
        const created = await api.createField(payload);
        navigate(`/fields/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Layout><div className="loading">Loading…</div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 600 }}>
        <button className="btn-secondary btn-sm" onClick={() => navigate(isEdit ? `/fields/${id}` : "/fields")} style={{ marginBottom: 20 }}>
          ← Back
        </button>
        <h1 style={{ marginBottom: 6 }}>{isEdit ? "Edit Field" : "New Field"}</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 14 }}>
          {isEdit ? "Update field details below." : "Fill in the details to register a new field."}
        </p>

        <div className="card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Field name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="e.g. Limuru North Plot"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Crop type *</label>
                <input
                  list="crop-suggestions"
                  value={form.crop_type}
                  onChange={e => set("crop_type", e.target.value)}
                  placeholder="e.g. Tea"
                  required
                />
                <datalist id="crop-suggestions">
                  {CROP_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>Planting date *</label>
                <input
                  type="date"
                  value={form.planting_date}
                  onChange={e => set("planting_date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Current stage</label>
                <select value={form.stage} onChange={e => set("stage", e.target.value)}>
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Area (hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.area_hectares}
                  onChange={e => set("area_hectares", e.target.value)}
                  placeholder="e.g. 3.5"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => set("location", e.target.value)}
                placeholder="e.g. Limuru, Kiambu"
              />
            </div>

            <div className="form-group">
              <label>Assign to agent</label>
              <select value={form.assigned_agent_id} onChange={e => set("assigned_agent_id", e.target.value)}>
                <option value="">— Unassigned —</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.field_count} field{a.field_count !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>

            <hr className="divider" />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(isEdit ? `/fields/${id}` : "/fields")}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Field"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
