const express = require("express");
const { getDb } = require("../db/database");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { computeStatus } = require("../middleware/status");

const router = express.Router();

function enrichField(field) {
  return { ...field, status: computeStatus(field) };
}

// GET all fields (admin sees all, agent sees assigned only)
router.get("/", authenticate, (req, res) => {
  const db = getDb();
  let fields;

  const query = `
    SELECT f.*, 
           u.name as agent_name, u.email as agent_email,
           (SELECT created_at FROM field_updates WHERE field_id = f.id ORDER BY created_at DESC LIMIT 1) as last_update_at,
           (SELECT COUNT(*) FROM field_updates WHERE field_id = f.id) as update_count
    FROM fields f
    LEFT JOIN users u ON f.assigned_agent_id = u.id
    {WHERE}
    ORDER BY f.created_at DESC
  `;

  if (req.user.role === "admin") {
    fields = db.prepare(query.replace("{WHERE}", "")).all();
  } else {
    fields = db.prepare(query.replace("{WHERE}", "WHERE f.assigned_agent_id = ?")).all(req.user.id);
  }

  res.json(fields.map(enrichField));
});

// GET single field
router.get("/:id", authenticate, (req, res) => {
  const db = getDb();
  const field = db.prepare(`
    SELECT f.*, 
           u.name as agent_name, u.email as agent_email,
           (SELECT created_at FROM field_updates WHERE field_id = f.id ORDER BY created_at DESC LIMIT 1) as last_update_at,
           (SELECT COUNT(*) FROM field_updates WHERE field_id = f.id) as update_count
    FROM fields f
    LEFT JOIN users u ON f.assigned_agent_id = u.id
    WHERE f.id = ?
  `).get(req.params.id);

  if (!field) return res.status(404).json({ error: "Field not found" });
  if (req.user.role === "agent" && field.assigned_agent_id !== req.user.id) {
    return res.status(403).json({ error: "Access denied" });
  }

  const updates = db.prepare(`
    SELECT fu.*, u.name as agent_name
    FROM field_updates fu
    JOIN users u ON fu.agent_id = u.id
    WHERE fu.field_id = ?
    ORDER BY fu.created_at DESC
  `).all(req.params.id);

  res.json({ ...enrichField(field), updates });
});

// POST create field (admin only)
router.post("/", authenticate, requireAdmin, (req, res) => {
  const { name, crop_type, planting_date, stage, location, area_hectares, assigned_agent_id } = req.body;
  if (!name || !crop_type || !planting_date) {
    return res.status(400).json({ error: "name, crop_type, and planting_date are required" });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO fields (name, crop_type, planting_date, stage, location, area_hectares, assigned_agent_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, crop_type, planting_date,
    stage || "planted",
    location || null,
    area_hectares || null,
    assigned_agent_id || null,
    req.user.id
  );

  const field = db.prepare("SELECT * FROM fields WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(enrichField(field));
});

// PUT update field (admin only for metadata, agent can update via /updates)
router.put("/:id", authenticate, requireAdmin, (req, res) => {
  const { name, crop_type, planting_date, stage, location, area_hectares, assigned_agent_id } = req.body;
  const db = getDb();
  const field = db.prepare("SELECT * FROM fields WHERE id = ?").get(req.params.id);
  if (!field) return res.status(404).json({ error: "Field not found" });

  db.prepare(`
    UPDATE fields SET
      name = ?, crop_type = ?, planting_date = ?, stage = ?,
      location = ?, area_hectares = ?, assigned_agent_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name ?? field.name,
    crop_type ?? field.crop_type,
    planting_date ?? field.planting_date,
    stage ?? field.stage,
    location ?? field.location,
    area_hectares ?? field.area_hectares,
    assigned_agent_id !== undefined ? assigned_agent_id : field.assigned_agent_id,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM fields WHERE id = ?").get(req.params.id);
  res.json(enrichField(updated));
});

// DELETE field (admin only)
router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM fields WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Field not found" });
  res.json({ message: "Field deleted" });
});

// POST field update/observation (agents and admins)
router.post("/:id/updates", authenticate, (req, res) => {
  const { notes, stage } = req.body;
  if (!notes) return res.status(400).json({ error: "notes are required" });

  const db = getDb();
  const field = db.prepare("SELECT * FROM fields WHERE id = ?").get(req.params.id);
  if (!field) return res.status(404).json({ error: "Field not found" });

  if (req.user.role === "agent" && field.assigned_agent_id !== req.user.id) {
    return res.status(403).json({ error: "You are not assigned to this field" });
  }

  // If stage is changing, update the field
  if (stage && stage !== field.stage) {
    db.prepare("UPDATE fields SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(stage, req.params.id);
  }

  const result = db.prepare(`
    INSERT INTO field_updates (field_id, agent_id, stage, notes)
    VALUES (?, ?, ?, ?)
  `).run(req.params.id, req.user.id, stage || field.stage, notes);

  const update = db.prepare(`
    SELECT fu.*, u.name as agent_name FROM field_updates fu
    JOIN users u ON fu.agent_id = u.id
    WHERE fu.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(update);
});

// GET dashboard stats
router.get("/meta/stats", authenticate, (req, res) => {
  const db = getDb();
  let fields;

  if (req.user.role === "admin") {
    fields = db.prepare(`
      SELECT f.*,
        (SELECT created_at FROM field_updates WHERE field_id = f.id ORDER BY created_at DESC LIMIT 1) as last_update_at
      FROM fields f
    `).all();
  } else {
    fields = db.prepare(`
      SELECT f.*,
        (SELECT created_at FROM field_updates WHERE field_id = f.id ORDER BY created_at DESC LIMIT 1) as last_update_at
      FROM fields f WHERE f.assigned_agent_id = ?
    `).all(req.user.id);
  }

  const enriched = fields.map(enrichField);
  const stats = {
    total: enriched.length,
    by_stage: {
      planted: enriched.filter(f => f.stage === "planted").length,
      growing: enriched.filter(f => f.stage === "growing").length,
      ready: enriched.filter(f => f.stage === "ready").length,
      harvested: enriched.filter(f => f.stage === "harvested").length,
    },
    by_status: {
      active: enriched.filter(f => f.status === "active").length,
      at_risk: enriched.filter(f => f.status === "at_risk").length,
      completed: enriched.filter(f => f.status === "completed").length,
    },
    total_area: enriched.reduce((sum, f) => sum + (f.area_hectares || 0), 0),
  };

  res.json(stats);
});

module.exports = router;
