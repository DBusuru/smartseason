const express = require("express");
const { getDb } = require("../db/database");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET all agents (admin only)
router.get("/agents", authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const agents = db.prepare(`
    SELECT id, name, email, role, created_at,
      (SELECT COUNT(*) FROM fields WHERE assigned_agent_id = users.id) as field_count
    FROM users WHERE role = 'agent'
    ORDER BY name
  `).all();
  res.json(agents);
});

module.exports = router;
