const bcrypt = require("bcryptjs");
const { getDb } = require("./database");

async function seed() {
  const db = getDb();

  const adminPassword = await bcrypt.hash("admin123", 10);
  const agentPassword = await bcrypt.hash("agent123", 10);

  db.exec(`DELETE FROM field_updates; DELETE FROM fields; DELETE FROM users;`);

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

  console.log("✅ Seed complete.");
  console.log("\nDemo credentials:");
  console.log("  Admin:  admin@smartseason.com / admin123");
  console.log("  Agent1: john@smartseason.com  / agent123");
  console.log("  Agent2: mary@smartseason.com  / agent123");
  console.log("  Agent3: peter@smartseason.com / agent123");
}

seed().catch(console.error);
