const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const fieldRoutes = require("./routes/fields");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SmartSeason API", version: "1.0.0" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`SmartSeason API running on http://localhost:${PORT}`);
  console.log(`Run 'npm run seed' to populate demo data`);
});
