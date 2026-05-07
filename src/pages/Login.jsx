import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 text-white"
      style={{
        background:
          "radial-gradient(circle at top, rgba(96, 165, 250, 0.35) 0%, rgba(15, 23, 42, 0.95) 42%, #020617 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="absolute left-10 top-10 h-44 w-44 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 h-28 w-28 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-2xl" />

      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="hidden lg:block">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-sky-200/80">
            Customer Hub
          </p>
          <h1 className="max-w-xl text-5xl font-black leading-tight text-white">
            Manage leads with a clean, focused workspace.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            Track conversations, follow up faster, and keep your CRM data in one
            polished dashboard.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full rounded-4xl border border-white/15 bg-white/10 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10"
        >
          <div className="mb-8">
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-sky-200/80">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold text-white">CRM Login</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Sign in to continue to your dashboard.
            </p>
          </div>

          <input
            type="email"
            placeholder="Email"
            className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-sky-300/60 focus:ring-2 focus:ring-sky-300/20"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="mb-6 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-sky-300/60 focus:ring-2 focus:ring-sky-300/20"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="w-full rounded-2xl bg-linear-to-r from-sky-400 to-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 active:scale-[0.99]">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
