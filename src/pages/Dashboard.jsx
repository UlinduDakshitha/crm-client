import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await API.get("/dashboard");
    setData(res.data);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2>Total Leads</h2>
          <p className="text-3xl font-bold">
            {data.totalLeads}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2>Won Leads</h2>
          <p className="text-3xl font-bold">
            {data.wonLeads}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2>Total Value</h2>
          <p className="text-3xl font-bold">
            Rs. {data.totalValue}
          </p>
        </div>
      </div>
    </div>
  );
}