import { Link, useLocation } from "react-router-dom";
import { FaChartPie, FaUsers } from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const navItem = (path) =>
    location.pathname === path
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100";

  return (
    <div className="w-64 min-h-screen bg-white border-r border-slate-200 p-5 hidden md:block">
      <h1 className="text-2xl font-bold text-slate-900 mb-10">
        CRM System
      </h1>

      <div className="space-y-2">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 p-3 rounded-2xl transition ${navItem(
            "/dashboard"
          )}`}
        >
          <FaChartPie />
          Dashboard
        </Link>

        <Link
          to="/leads"
          className={`flex items-center gap-3 p-3 rounded-2xl transition ${navItem(
            "/leads"
          )}`}
        >
          <FaUsers />
          Leads
        </Link>
      </div>
    </div>
  );
}