const BASE = process.env.REACT_APP_API_URL || "https://smartseason-wcdy.onrender.com/api";

function getToken() {
  return localStorage.getItem("ss_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  me: () => request("/auth/me"),

  getFields: () => request("/fields"),
  getField: (id) => request(`/fields/${id}`),
  createField: (data) => request("/fields", { method: "POST", body: JSON.stringify(data) }),
  updateField: (id, data) => request(`/fields/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteField: (id) => request(`/fields/${id}`, { method: "DELETE" }),
  addFieldUpdate: (id, data) => request(`/fields/${id}/updates`, { method: "POST", body: JSON.stringify(data) }),
  getStats: () => request("/fields/meta/stats"),

  getAgents: () => request("/users/agents"),
};
