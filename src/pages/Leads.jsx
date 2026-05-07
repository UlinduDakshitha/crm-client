import { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import { leadsAPI } from "../services/api";

const leadStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];
const leadSources = [
  "Website",
  "Phone",
  "Email",
  "Referral",
  "Social Media",
  "Event",
  "Other",
];

const statusStyles = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-sky-100 text-sky-700",
  Qualified: "bg-amber-100 text-amber-700",
  "Proposal Sent": "bg-violet-100 text-violet-700",
  Won: "bg-emerald-100 text-emerald-700",
  Lost: "bg-rose-100 text-rose-700",
};

const emptyLeadForm = () => ({
  name: "",
  companyName: "",
  email: "",
  phoneNumber: "",
  leadSource: "Website",
  assignedSalesperson: "",
  status: "New",
  estimatedDealValue: "",
});

function formatCurrency(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function normalizeLead(lead) {
  if (!lead) return null;

  const companyName = lead.companyName || lead.company || "";

  const phoneNumber = lead.phoneNumber || lead.phone || "";

  const leadSource = lead.leadSource || lead.source || "";

  const estimatedDealValue = lead.estimatedDealValue ?? lead.value ?? 0;

  let assignedSalesperson = "Unassigned";
  if (typeof lead.assignedSalesperson === "string") {
    assignedSalesperson = lead.assignedSalesperson || "Unassigned";
  } else if (
    lead.assignedSalesperson &&
    typeof lead.assignedSalesperson === "object"
  ) {
    assignedSalesperson =
      lead.assignedSalesperson.name ||
      lead.assignedSalesperson.email ||
      "Unassigned";
  }

  return {
    ...lead,
    companyName,
    phoneNumber,
    leadSource,
    estimatedDealValue,
    assignedSalesperson,
    createdDate: lead.createdDate || lead.createdAt,
    lastUpdatedDate: lead.lastUpdatedDate || lead.updatedAt,
    notes: Array.isArray(lead.notes) ? lead.notes : [],
  };
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterSalesperson, setFilterSalesperson] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const [form, setForm] = useState(emptyLeadForm());
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await leadsAPI.getLeads();
      const data = Array.isArray(res.data) ? res.data : [];
      setLeads(data.map(normalizeLead));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchLeads();
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const filteredLeads = useMemo(() => {
    let result = leads;
    const q = query.trim().toLowerCase();

    if (q) {
      result = result.filter((lead) => {
        const haystack = [
          lead.name,
          lead.companyName,
          lead.email,
          lead.phoneNumber,
          lead.leadSource,
          lead.assignedSalesperson,
          lead.status,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });
    }

    if (filterStatus)
      result = result.filter((lead) => lead.status === filterStatus);
    if (filterSource)
      result = result.filter((lead) => lead.leadSource === filterSource);
    if (filterSalesperson) {
      result = result.filter(
        (lead) => lead.assignedSalesperson === filterSalesperson,
      );
    }

    return result;
  }, [leads, query, filterStatus, filterSource, filterSalesperson]);

  const openCreate = () => {
    setSelectedLead(null);
    setForm(emptyLeadForm());
    setFormOpen(true);
  };

  const openEdit = (lead) => {
    setSelectedLead(lead);
    setForm({
      name: lead.name || "",
      companyName: lead.companyName || "",
      email: lead.email || "",
      phoneNumber: lead.phoneNumber || "",
      leadSource: lead.leadSource || "Website",
      assignedSalesperson: lead.assignedSalesperson || "",
      status: lead.status || "New",
      estimatedDealValue: lead.estimatedDealValue ?? "",
    });
    setFormOpen(true);
  };

  const openDetails = async (lead) => {
    try {
      const res = await leadsAPI.getLead(lead._id);
      const fullLead = normalizeLead(res.data);
      setDetailLead(fullLead);
      setDetailOpen(true);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not load lead details.");
    }
  };

  const closeAll = () => {
    setFormOpen(false);
    setDetailOpen(false);
    setNoteOpen(false);
    setSelectedLead(null);
    setDetailLead(null);
    setNoteText("");
    setNoteAuthor("");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveLead = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      companyName: form.companyName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      leadSource: form.leadSource,
      assignedSalesperson: form.assignedSalesperson.trim(),
      status: form.status,
      estimatedDealValue: Number(form.estimatedDealValue) || 0,
    };

    try {
      if (selectedLead?._id) {
        await leadsAPI.updateLead(selectedLead._id, payload);
      } else {
        await leadsAPI.createLead(payload);
      }

      await fetchLeads();
      closeAll();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not save the lead.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLead = async (lead) => {
    const confirmed = window.confirm(
      `Delete ${lead.name || "this lead"}? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await leadsAPI.deleteLead(lead._id);
      await fetchLeads();

      if (detailLead?._id === lead._id) {
        closeAll();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not delete the lead.");
    }
  };

  const changeStatus = async (lead, status) => {
    try {
      await leadsAPI.updateLeadStatus(lead._id, status);
      await fetchLeads();

      if (detailLead?._id === lead._id) {
        const res = await leadsAPI.getLead(lead._id);
        setDetailLead(normalizeLead(res.data));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not update status.");
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!detailLead?._id || !noteText.trim()) return;

    try {
      await leadsAPI.addLeadNote(
        detailLead._id,
        noteText.trim(),
        noteAuthor.trim() || "Sales Team",
      );

      const res = await leadsAPI.getLead(detailLead._id);
      setDetailLead(normalizeLead(res.data));
      setNoteText("");
      setNoteAuthor("");
      setNoteOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not add note.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg md:flex md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
              Lead Management
            </p>
            <h1 className="mt-2 text-3xl font-black">Leads</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Create, track, update, and review every lead from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="mt-4 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 md:mt-0"
          >
            + New Lead
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company, email..."
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white md:col-span-2"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="">All Statuses</option>
              {leadStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="">All Sources</option>
              {leadSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterSalesperson}
              onChange={(e) => setFilterSalesperson(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 md:col-span-2"
            >
              <option value="">All Salespeople</option>
              {Array.from(new Set(leads.map((l) => l.assignedSalesperson)))
                .filter((v) => v && v !== "Unassigned")
                .sort()
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              {leads.some(
                (lead) => lead.assignedSalesperson === "Unassigned",
              ) && <option value="Unassigned">Unassigned</option>}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilterStatus("");
                setFilterSource("");
                setFilterSalesperson("");
              }}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:col-span-2"
            >
              Clear filters
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">No leads found</h3>
            <p className="mt-2 text-slate-500">
              Try different filters or add a new lead.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {lead.name || "Untitled Lead"}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[lead.status] || "bg-slate-100 text-slate-700"}`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {lead.companyName || "No company name added"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDetails(lead)}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    View Details
                  </button>
                </div>

                <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-900">Email:</span>{" "}
                    {lead.email || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Phone:</span>{" "}
                    {lead.phoneNumber || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Source:
                    </span>{" "}
                    {lead.leadSource || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Assigned:
                    </span>{" "}
                    {lead.assignedSalesperson || "Unassigned"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Estimated Value:
                    </span>{" "}
                    {formatCurrency(lead.estimatedDealValue)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Created:
                    </span>{" "}
                    {formatDate(lead.createdDate)}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <label className="block text-sm font-medium text-slate-600">
                    Update Status
                  </label>
                  <select
                    value={lead.status}
                    onChange={(e) => changeStatus(lead, e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                  >
                    {leadStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(lead)}
                    className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLead(lead)}
                    className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedLead ? "Edit Lead" : "Create Lead"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the lead information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAll}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={saveLead} className="grid gap-5 p-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Lead Name
                </span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Company Name
                </span>
                <input
                  required
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Phone Number
                </span>
                <input
                  required
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Lead Source
                </span>
                <select
                  value={form.leadSource}
                  onChange={(e) => handleChange("leadSource", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                >
                  {leadSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Assigned Salesperson
                </span>
                <input
                  type="text"
                  value={form.assignedSalesperson}
                  onChange={(e) =>
                    handleChange("assignedSalesperson", e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Status
                </span>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                >
                  {leadStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Estimated Deal Value
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.estimatedDealValue}
                  onChange={(e) =>
                    handleChange("estimatedDealValue", e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </label>

              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Lead"}
                </button>
                <button
                  type="button"
                  onClick={closeAll}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {detailOpen && detailLead ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Lead Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review the full lead record and notes.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAll}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {detailLead.name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[detailLead.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {detailLead.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">
                    {detailLead.companyName}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Email
                    </p>
                    <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
                      {detailLead.email || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Phone
                    </p>
                    <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
                      {detailLead.phoneNumber || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Lead Source
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {detailLead.leadSource || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Assigned
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {detailLead.assignedSalesperson || "Unassigned"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Estimated Deal Value
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatCurrency(detailLead.estimatedDealValue)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Created
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatDate(detailLead.createdDate)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Updated
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatDate(detailLead.lastUpdatedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailOpen(false);
                      openEdit(detailLead);
                    }}
                    className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Edit Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteOpen(true);
                      setNoteText("");
                      setNoteAuthor("");
                    }}
                    className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
                  >
                    Add Note
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLead(detailLead)}
                    className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Delete Lead
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Lead Notes
                    </h3>
                    <p className="text-sm text-slate-500">
                      Notes added to this lead over time.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNoteOpen(true);
                      setNoteText("");
                      setNoteAuthor("");
                    }}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    + Note
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {detailLead.notes.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                      No notes added yet.
                    </div>
                  ) : (
                    detailLead.notes.map((note, index) => {
                      const content = note.content || note.noteContent || "";
                      const createdBy =
                        note.createdBy?.name || note.createdBy || "Sales Team";
                      const createdDate = note.createdDate || note.createdAt;

                      return (
                        <div
                          key={`${createdDate || index}-${index}`}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <p className="text-sm leading-6 text-slate-700">
                            {content}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>By {createdBy}</span>
                            <span>{formatDate(createdDate)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {noteOpen && detailLead ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Add Note</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Attach a note to {detailLead.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNoteOpen(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={saveNote} className="space-y-4 p-6">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Note Content
                </span>
                <textarea
                  required
                  rows="5"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                  placeholder="Write your note here..."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Created By
                </span>
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                  placeholder="Sales Team"
                />
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Save Note
                </button>
                <button
                  type="button"
                  onClick={() => setNoteOpen(false)}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
