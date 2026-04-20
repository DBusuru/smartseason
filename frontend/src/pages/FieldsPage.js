import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FieldCard from "../components/FieldCard";

const STAGES = ["all", "planted", "growing", "ready", "harvested"];
const STATUSES = ["all", "active", "at_risk", "completed"];

export default function FieldsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getFields()
      .then(setFields)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = fields.filter(f => {
    if (stageFilter !== "all" && f.stage !== stageFilter) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
        !f.crop_type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Layout><div className="loading">Loading fields…</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Fields</h1>
          <p>{fields.length} field{fields.length !== 1 ? "s" : ""} total</p>
        </div>
        {user?.role === "admin" && (
          <button className="btn-primary" onClick={() => navigate("/fields/new")}>
            + New Field
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name or crop…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ width: "auto" }}>
          {STAGES.map(s => (
            <option key={s} value={s}>{s === "all" ? "All stages" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: "auto" }}>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : s === "at_risk" ? "At Risk" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {(stageFilter !== "all" || statusFilter !== "all" || search) && (
          <button className="btn-secondary btn-sm" onClick={() => { setStageFilter("all"); setStatusFilter("all"); setSearch(""); }}>
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>{fields.length === 0 ? "No fields yet" : "No matching fields"}</h3>
          <p style={{ marginTop: 8 }}>
            {fields.length === 0
              ? user?.role === "admin" ? "Create your first field to get started." : "No fields assigned to you yet."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Showing {filtered.length} of {fields.length} fields
          </div>
          <div className="grid-2">
            {filtered.map(f => <FieldCard key={f.id} field={f} />)}
          </div>
        </>
      )}
    </Layout>
  );
}
