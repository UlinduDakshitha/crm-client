 import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const leadsAPI = {
  getLeads: (params) => API.get("/leads", { params }),
  getLead: (id) => API.get(`/leads/${id}`),
  createLead: (data) => API.post("/leads", data),
  updateLead: (id, data) => API.put(`/leads/${id}`, data),
  updateLeadStatus: (id, status) => API.patch(`/leads/${id}/status`, { status }),
  deleteLead: (id) => API.delete(`/leads/${id}`),
  addLeadNote: (leadId, content, createdBy) =>
    API.post(`/leads/${leadId}/notes`, { content, createdBy }),
};

export default API;