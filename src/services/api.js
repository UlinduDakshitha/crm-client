import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Leads helper wrappers
export const leadsAPI = {
  getLeads: (params) => API.get("/leads", { params }),
  getLead: (id) => API.get(`/leads/${id}`),
  createLead: (data) => API.post("/leads", data),
  updateLead: (id, data) => API.put(`/leads/${id}`, data),
  updateLeadStatus: (id, status) =>
    API.patch(`/leads/${id}/status`, { status }),
  deleteLead: (id) => API.delete(`/leads/${id}`),
};

// Notes helper wrappers
export const notesAPI = {
  addNote: (leadId, content) => API.post("/notes", { leadId, content }),
  getNotesForLead: (leadId) => API.get(`/notes/lead/${leadId}`),
  getNote: (id) => API.get(`/notes/${id}`),
  updateNote: (id, content) => API.put(`/notes/${id}`, { content }),
  deleteNote: (id) => API.delete(`/notes/${id}`),
};

// Dashboard helper
export const dashboardAPI = {
  getStats: () => API.get("/dashboard"),
};

export default API;
