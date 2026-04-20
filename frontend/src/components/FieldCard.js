import { useNavigate } from "react-router-dom";

const STAGE_LABELS = {
  planted: "🌱 Planted",
  growing: "🌿 Growing",
  ready: "🌾 Ready",
  harvested: "📦 Harvested",
};

const STATUS_LABELS = {
  active: "Active",
  at_risk: "At Risk",
  completed: "Completed",
};

export default function FieldCard({ field }) {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      onClick={() => navigate(`/fields/${field.id}`)}
      style={{ cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(28,16,8,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, marginBottom: 2 }}>{field.name}</h3>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{field.crop_type}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
          <span className={`badge badge-${field.status}`}>{STATUS_LABELS[field.status]}</span>
          <span className={`badge badge-${field.stage}`}>{STAGE_LABELS[field.stage]}</span>
        </div>
      </div>

      <hr className="divider" style={{ margin: "12px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 13 }}>
        {field.location && (
          <div>
            <span style={{ color: "var(--text-muted)" }}>Location: </span>
            {field.location}
          </div>
        )}
        {field.area_hectares && (
          <div>
            <span style={{ color: "var(--text-muted)" }}>Area: </span>
            {field.area_hectares} ha
          </div>
        )}
        <div>
          <span style={{ color: "var(--text-muted)" }}>Planted: </span>
          {new Date(field.planting_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
        </div>
        <div>
          <span style={{ color: "var(--text-muted)" }}>Updates: </span>
          {field.update_count || 0}
        </div>
      </div>

      {field.agent_name && (
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
          Agent: <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{field.agent_name}</span>
        </div>
      )}
    </div>
  );
}
