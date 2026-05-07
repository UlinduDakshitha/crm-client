import { useEffect, useMemo, useState, useRef } from "react";
import API from "../services/api";
import Layout from "../component/Layout";
import {
  emptyLeadForm,
  formatCurrency,
  formatDate,
  leadSources,
  leadStatuses,
  normalizeLead,
  statusStyles,
} from "../utils/leads";

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-4xl",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className={`w-full ${maxWidth} rounded-[28px] bg-white shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterSalesperson, setFilterSalesperson] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [form, setForm] = useState(emptyLeadForm());
  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");
  const [saving, setSaving] = useState(false);

  const refreshRef = useRef(null);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await API.get("/leads");
        const normalizedLeads = Array.isArray(res.data)
          ? res.data.map(normalizeLead)
          : [];
        setLeads(normalizedLeads);
      } catch (err) {
        console.log(err);
        setError("Unable to load leads right now.");
      } finally {
        setLoading(false);
      }
    };

    // expose refresh function to other handlers
    refreshRef.current = fetchLeads;

    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    let results = leads;
    const search = query.trim().toLowerCase();

    if (search) {
      results = results.filter((lead) => {
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

        return haystack.includes(search);
      });
    }

    if (filterStatus) {
      results = results.filter((lead) => lead.status === filterStatus);
    }

    if (filterSource) {
      results = results.filter((lead) => lead.leadSource === filterSource);
    }

    if (filterSalesperson) {
      results = results.filter(
        (lead) => lead.assignedSalesperson === filterSalesperson,
      );
    }

    return results;
  }, [leads, query, filterStatus, filterSource, filterSalesperson]);

  const openCreateLead = () => {
    setSelectedLead(null);
    setForm(emptyLeadForm());
    setIsFormOpen(true);
  };

  const openEditLead = (lead) => {
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
    setIsFormOpen(true);
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const closeAllModals = () => {
    setIsFormOpen(false);
    setIsDetailOpen(false);
    setIsNoteOpen(false);
    setSelectedLead(null);
    setNoteText("");
    setNoteAuthor("");
  };

  const handleFormChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStatusChange = async (lead, status) => {
    const payload = {
      ...lead,
      status,
    };

    try {
      await API.put(`/leads/${lead._id}`, payload);
      await refreshRef.current?.();
    } catch (err) {
      console.log(err);
      setError("Could not update the lead status.");
    }
  };

  const handleDeleteLead = async (lead) => {
    const confirmed = window.confirm(
      `Delete ${lead.name || "this lead"}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/leads/${lead._id}`);
      await refreshRef.current?.();
      if (selectedLead?._id === lead._id) {
        closeAllModals();
      }
    } catch (err) {
      console.log(err);
      setError("Could not delete the lead.");
    }
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      company: form.companyName.trim(),
      companyName: form.companyName.trim(),
      email: form.email.trim(),
      phone: form.phoneNumber.trim(),
      phoneNumber: form.phoneNumber.trim(),
      leadSource: form.leadSource,
      source: form.leadSource,
      assignedSalesperson: form.assignedSalesperson.trim(),
      salesperson: form.assignedSalesperson.trim(),
      status: form.status,
      estimatedDealValue: Number(form.estimatedDealValue) || 0,
    };

    try {
      if (selectedLead?._id) {
        await API.put(`/leads/${selectedLead._id}`, payload);
      } else {
        await API.post("/leads", payload);
      }

      setIsFormOpen(false);
      setSelectedLead(null);
      setForm(emptyLeadForm());
      await refreshRef.current?.();
    } catch (err) {
      console.log(err);
      setError("Could not save the lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();

    if (!selectedLead?._id || !noteText.trim()) {
      return;
    }

    try {
      await API.post(`/leads/${selectedLead._id}/notes`, {
        content: noteText.trim(),
        createdBy: noteAuthor.trim() || "Sales Team",
      });

      setNoteText("");
      setNoteAuthor("");
      setIsNoteOpen(false);
      await refreshRef.current?.();
    } catch (err) {
      console.log(err);
      setError("Could not add the note.");
    }
  };

  const detailLead = selectedLead
    ? leads.find((lead) => lead._id === selectedLead._id) || selectedLead
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] bg-linear-to-r from-slate-900 to-slate-700 p-6 text-white shadow-lg md:flex-row md:items-end md:justify-between">
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
            onClick={openCreateLead}
            className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            + New Lead
          </button>
        </div>

        <div className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Leads</h2>
              <p className="text-sm text-slate-500">
                Search, filter, edit, update status, delete, and open details.
              </p>
            </div>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company, email, status..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white md:max-w-sm"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
            >
              <option value="">All Statuses</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
            >
              <option value="">All Lead Sources</option>
              {leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <select
              value={filterSalesperson}
              onChange={(e) => setFilterSalesperson(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
            >
              <option value="">All Salespeople</option>
              {Array.from(
                new Set(leads.map((lead) => lead.assignedSalesperson)),
              )
                .filter((sp) => sp && sp !== "Unassigned")
                .sort()
                .map((salesperson) => (
                  <option key={salesperson} value={salesperson}>
                    {salesperson}
                  </option>
                ))}
              {leads.some(
                (lead) => lead.assignedSalesperson === "Unassigned",
              ) && <option value="Unassigned">Unassigned</option>}
            </select>
          </div>

          {(filterStatus || filterSource || filterSalesperson || query) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilterStatus("");
                setFilterSource("");
                setFilterSalesperson("");
              }}
              className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">No leads found</h3>
            <p className="mt-2 text-slate-500">
              Try a different search or filter, or add your first lead.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {lead.name || "Untitled Lead"}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[lead.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
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
                    onClick={() => openLeadDetails(lead)}
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
                      Lead Source:
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
                    onChange={(e) => handleStatusChange(lead, e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
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
                    onClick={() => openEditLead(lead)}
                    className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(lead)}
                    className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => openLeadDetails(lead)}
                    className="rounded-2xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    Notes & Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen ? (
        <ModalShell
          title={selectedLead ? "Edit Lead" : "Create Lead"}
          subtitle="Fill in the lead information below."
          onClose={closeAllModals}
        >
          <form onSubmit={handleSaveLead} className="grid gap-5 md:grid-cols-2">
            <Field label="Lead Name">
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </Field>

            <Field label="Company Name">
              <input
                required
                type="text"
                value={form.companyName}
                onChange={(e) =>
                  handleFormChange("companyName", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </Field>

            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </Field>

            <Field label="Phone Number">
              <input
                required
                type="text"
                value={form.phoneNumber}
                onChange={(e) =>
                  handleFormChange("phoneNumber", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </Field>

            <Field label="Lead Source">
              <select
                value={form.leadSource}
                onChange={(e) => handleFormChange("leadSource", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400"
              >
                {leadSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Assigned Salesperson">
              <input
                type="text"
                value={form.assignedSalesperson}
                onChange={(e) =>
                  handleFormChange("assignedSalesperson", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400"
              >
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Estimated Deal Value">
              <input
                type="number"
                min="0"
                value={form.estimatedDealValue}
                onChange={(e) =>
                  handleFormChange("estimatedDealValue", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </Field>

            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Lead"}
              </button>
              <button
                type="button"
                onClick={closeAllModals}
                className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {isDetailOpen && detailLead ? (
        <ModalShell
          title="Lead Details"
          subtitle="Review the full lead record and activity notes."
          onClose={closeAllModals}
          maxWidth="max-w-5xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {detailLead.name}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[detailLead.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {detailLead.status}
                  </span>
                </div>
                <p className="mt-1 text-slate-500">{detailLead.companyName}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Email" value={detailLead.email} />
                <InfoCard label="Phone" value={detailLead.phoneNumber} />
                <InfoCard label="Lead Source" value={detailLead.leadSource} />
                <InfoCard
                  label="Assigned Salesperson"
                  value={detailLead.assignedSalesperson}
                />
                <InfoCard
                  label="Estimated Deal Value"
                  value={formatCurrency(detailLead.estimatedDealValue)}
                />
                <InfoCard
                  label="Created Date"
                  value={formatDate(detailLead.createdDate)}
                />
                <InfoCard
                  label="Last Updated Date"
                  value={formatDate(detailLead.lastUpdatedDate)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailOpen(false);
                    openEditLead(detailLead);
                  }}
                  className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Edit Lead
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNoteOpen(true);
                    setNoteText("");
                    setNoteAuthor("");
                  }}
                  className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
                >
                  Add Note
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLead(detailLead)}
                  className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
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
                    setIsNoteOpen(true);
                    setNoteText("");
                    setNoteAuthor("");
                  }}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
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
                    const createdBy = note.createdBy || "Sales Team";
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
        </ModalShell>
      ) : null}

      {isNoteOpen && detailLead ? (
        <ModalShell
          title="Add Note"
          subtitle={`Attach a note to ${detailLead.name}.`}
          onClose={() => setIsNoteOpen(false)}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveNote} className="space-y-4">
            <Field label="Note Content">
              <textarea
                required
                rows="5"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                placeholder="Write your note here..."
              />
            </Field>

            <Field label="Created By">
              <input
                type="text"
                value={noteAuthor}
                onChange={(e) => setNoteAuthor(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                placeholder="Sales Team"
              />
            </Field>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Save Note
              </button>
              <button
                type="button"
                onClick={() => setIsNoteOpen(false)}
                className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </Layout>
  );
}
