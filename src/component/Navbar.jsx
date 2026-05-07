import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          CRM Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Manage your sales leads efficiently
        </p>
      </div>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-2xl transition"
      >
        Logout
      </button>
    </div>
  );
}