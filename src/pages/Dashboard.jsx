 import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const cards = [
    {
      title: "Total Leads",
      value: data.totalLeads || 0,
    },
    {
      title: "New Leads",
      value: data.newLeads || 0,
    },
    {
      title: "Qualified Leads",
      value: data.qualifiedLeads || 0,
    },
    {
      title: "Won Leads",
      value: data.wonLeads || 0,
    },
    {
      title: "Lost Leads",
      value: data.lostLeads || 0,
    },
    {
      title: "Total Deal Value",
      value: `Rs. ${data.totalValue || 0}`,
    },
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition"
            >
              <h2 className="text-slate-500 text-sm mb-3">
                {card.title}
              </h2>

              <p className="text-4xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}