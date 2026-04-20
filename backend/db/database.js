const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "smartseason.db");

let db;
let seeded = false;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    autoSeed();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'agent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      crop_type TEXT NOT NULL,
      planting_date TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'planted' CHECK(stage IN ('planted','growing','ready','harvested')),
      location TEXT,
      area_hectares REAL,
      assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS field_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
      agent_id INTEGER NOT NULL REFERENCES users(id),
      stage TEXT,
      notes TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function autoSeed() {
  if (seeded) return;
  
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (userCount > 0) {
    seeded = true;
    return;
  }

  console.log("🌱 Seeding database with demo data...");
  
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const agentPassword = bcrypt.hashSync("agent123", 10);

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`
  );

  const admin = insertUser.run("Alice Coordinator", "admin@smartseason.com", adminPassword, "admin");
  const agent1 = insertUser.run("John Kamau", "john@smartseason.com", agentPassword, "agent");
  const agent2 = insertUser.run("Mary Wanjiku", "mary@smartseason.com", agentPassword, "agent");
  const agent3 = insertUser.run("Peter Odhiambo", "peter@smartseason.com", agentPassword, "agent");

  const insertField = db.prepare(`
    INSERT INTO fields (name, crop_type, planting_date, stage, location, area_hectares, assigned_agent_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const fields = [
    ["Limuru North Plot", "Tea", "2025-11-01", "growing", "Limuru, Kiambu", 3.5, agent1.lastInsertRowid, admin.lastInsertRowid],
    ["Thika Road Farm", "Maize", "2025-12-15", "planted", "Thika, Kiambu", 5.0, agent1.lastInsertRowid, admin.lastInsertRowid],
    ["Ruiru Greenhouse A", "Tomatoes", "2026-01-10", "ready", "Ruiru, Kiambu", 0.8, agent2.lastInsertRowid, admin.lastInsertRowid],
    ["Kiambu Central Field", "Beans", "2025-10-20", "harvested", "Kiambu Town", 2.2, agent2.lastInsertRowid, admin.lastInsertRowid],
    ["Tigoni Tea Estate", "Tea", "2025-09-05", "growing", "Tigoni, Limuru", 8.0, agent3.lastInsertRowid, admin.lastInsertRowid],
    ["Ondiri Wetland Plot", "Rice", "2025-12-01", "planted", "Ondiri, Kikuyu", 1.5, agent3.lastInsertRowid, admin.lastInsertRowid],
    ["Kabete Horticulture", "Kale", "2026-02-01", "planted", "Kabete, Nairobi", 0.6, agent1.lastInsertRowid, admin.lastInsertRowid],
    ["Kahawa West Farm", "Maize", "2025-08-10", "harvested", "Kahawa, Nairobi", 4.1, agent2.lastInsertRowid, admin.lastInsertRowid],
  ];

  const insertUpdate = db.prepare(`
    INSERT INTO field_updates (field_id, agent_id, stage, notes)
    VALUES (?, ?, ?, ?)
  `);

  for (const f of fields) {
    const field = insertField.run(...f);
    insertUpdate.run(field.lastInsertRowid, f[6], f[3], "Initial observation logged. Soil moisture looks good.");
  }

  insertUpdate.run(1, agent1.lastInsertRowid, "growing", "Leaves showing healthy green color. No pest activity detected.");
  insertUpdate.run(3, agent2.lastInsertRowid, "ready", "Tomatoes ripening well. Recommending harvest within 5 days.");
  insertUpdate.run(5, agent3.lastInsertRowid, "growing", "Tea bushes growing vigorously. Pruning may be needed next month.");

  seeded = true;
  console.log("✅ Database seeded successfully!");
}

module.exports = { getDb };
