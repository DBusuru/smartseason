/**
 * Field Status Logic
 *
 * Status is computed based on:
 * - stage: planted, growing, ready, harvested
 * - days since planting
 * - last update recency
 *
 * Rules:
 *   Completed  → stage is 'harvested'
 *   At Risk    → stage is 'ready' but no update in 7+ days (overdue harvest)
 *              OR stage is 'planted' but 60+ days have passed with no progression
 *              OR stage is 'growing' but 90+ days with no update
 *   Active     → everything else
 */

function computeStatus(field) {
  if (field.stage === "harvested") return "completed";

  const plantDate = new Date(field.planting_date);
  const now = new Date();
  const daysSincePlanting = Math.floor((now - plantDate) / (1000 * 60 * 60 * 24));

  const lastUpdate = field.last_update_at ? new Date(field.last_update_at) : plantDate;
  const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

  if (field.stage === "ready" && daysSinceUpdate >= 7) return "at_risk";
  if (field.stage === "planted" && daysSincePlanting >= 60) return "at_risk";
  if (field.stage === "growing" && daysSinceUpdate >= 90) return "at_risk";

  return "active";
}

module.exports = { computeStatus };
