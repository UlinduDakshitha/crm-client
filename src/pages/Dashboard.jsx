import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Layout from "../component/Layout";
import { formatCurrency, normalizeLead } from "../utils/leads";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "New").length;
    const qualifiedLeads = leads.filter(
      (lead) => lead.status === "Qualified",
    ).length;
    const wonLeads = leads.filter((lead) => lead.status === "Won").length;
    const lostLeads = leads.filter((lead) => lead.status === "Lost").length;
    const totalEstimatedDealValue = leads.reduce(
      (total, lead) => total + Number(lead.estimatedDealValue || 0),
      0,
    );
    const totalWonDealValue = leads
      .filter((lead) => lead.status === "Won")
      .reduce((total, lead) => total + Number(lead.estimatedDealValue || 0), 0);

    return [
      {
        title: "Total Leads",
        value: totalLeads,
        tone: "from-slate-900 to-slate-700",
      },
      { title: "New Leads", value: newLeads, tone: "from-sky-500 to-cyan-400" },
      {
        title: "Qualified Leads",
        value: qualifiedLeads,
        tone: "from-emerald-500 to-green-400",
      },
      {
        title: "Won Leads",
        value: wonLeads,
        tone: "from-teal-500 to-emerald-400",
      },
      {
        title: "Lost Leads",
        value: lostLeads,
        tone: "from-rose-500 to-pink-400",
      },
      {
        title: "Total Estimated Deal Value",
        value: formatCurrency(totalEstimatedDealValue),
        tone: "from-amber-500 to-orange-400",
      },
      {
        title: "Total Value of Won Deals",
        value: formatCurrency(totalWonDealValue),
        tone: "from-indigo-500 to-violet-400",
      },
    ];
  }, [leads]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="rounded-[28px] bg-linear-to-r from-slate-900 to-slate-700 p-6 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            Dashboard Overview
          </p>
          <h1 className="mt-2 text-3xl font-black">Lead Performance</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            A quick view of lead volume, status distribution, and pipeline
            value.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading dashboard metrics...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((card) => (
              <div
                key={card.title}
                className="overflow-hidden rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="h-1.5 w-24 rounded-full bg-slate-900" />
                <h2 className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                  {card.title}
                </h2>
                <p className="mt-3 text-4xl font-black text-slate-900">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
