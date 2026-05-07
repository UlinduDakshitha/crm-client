import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../component/Layout";

export default function Leads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const res = await API.get("/leads");
      setLeads(res.data);
    };
    fetchLeads();
  }, []);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Leads</h1>

        <div className="grid gap-4">
          {leads.map((lead) => (
            <div key={lead._id} className="bg-white p-5 rounded-2xl shadow">
              <h2 className="text-xl font-bold">{lead.name}</h2>

              <p>{lead.company}</p>

              <p className="text-sm text-gray-500">{lead.email}</p>

              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
