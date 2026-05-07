export const leadStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

export const leadSources = [
  "Website",
  "Referral",
  "Social Media",
  "Cold Call",
  "Email Campaign",
  "Event",
  "Other",
];

export const statusStyles = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-sky-100 text-sky-700",
  Qualified: "bg-emerald-100 text-emerald-700",
  "Proposal Sent": "bg-amber-100 text-amber-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-rose-100 text-rose-700",
};

export function emptyLeadForm() {
  return {
    name: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    leadSource: "Website",
    assignedSalesperson: "",
    status: "New",
    estimatedDealValue: "",
  };
}

export function normalizeLead(lead = {}) {
  const createdDate =
    lead.createdDate || lead.createdAt || new Date().toISOString();
  const updatedDate = lead.lastUpdatedDate || lead.updatedAt || createdDate;

  return {
    ...lead,
    _id: lead._id || lead.id,
    name: lead.name || "",
    companyName: lead.companyName || lead.company || "",
    email: lead.email || "",
    phoneNumber: lead.phoneNumber || lead.phone || "",
    leadSource: lead.leadSource || lead.source || "Website",
    assignedSalesperson:
      lead.assignedSalesperson || lead.salesperson || "Unassigned",
    status: lead.status || "New",
    estimatedDealValue: Number(lead.estimatedDealValue ?? lead.dealValue ?? 0),
    createdDate,
    lastUpdatedDate: updatedDate,
    notes: Array.isArray(lead.notes) ? lead.notes : [],
  };
}

export function formatCurrency(value) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
