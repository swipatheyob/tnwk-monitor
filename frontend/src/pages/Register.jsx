import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FaArrowLeft, FaLock, FaSatelliteDish, FaShieldAlt, FaUserPlus} from "react-icons/fa";

import {useAuth} from "../context/authContext";
import {registerUser} from "../services/authService";
import logo from "../assets/logo_tnwk.png";

function Register() {
  const navigate = useNavigate();
  const {login} = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({...formData, [event.target.name]: event.target.value});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password minimal terdiri dari 8 karakter.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      login(response.user, response.token);
      navigate("/");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Pendaftaran administrator gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 p-4 text-slate-900 sm:p-7">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,.10)_1px,transparent_1px)] bg-size-[56px_56px]" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-300/30 blur-[120px]" />
      <div className="absolute -bottom-36 right-0 h-96 w-96 rounded-full bg-cyan-300/25 blur-[120px]" />

      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-[0_35px_100px_rgba(15,118,110,.16)] backdrop-blur-2xl sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700">
          <FaArrowLeft /> Kembali ke login
        </Link>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex h-15 w-15 items-center justify-center rounded-2xl border border-teal-100 bg-white shadow-[0_14px_30px_rgba(15,118,110,.12)]">
            <img src={logo} alt="TNWK" className="h-12 w-12 object-contain" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">TNWK Intelligence</p>
            <p className="mt-1 text-sm text-slate-500">Administrator Access</p>
          </div>
        </div>

        <div className="mt-8 flex h-13 w-13 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-xl text-teal-700">
          <FaSatelliteDish />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Administrator Registration</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.04em] text-slate-950">Buat akun admin.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Daftarkan administrator untuk mengelola sistem monitoring satwa TNWK.</p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Nama administrator</span>
            <input name="username" type="text" value={formData.username} onChange={handleChange} required autoComplete="name" placeholder="Nama lengkap" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Email</span>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="email" placeholder="admin@tnwk.id" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Password</span>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required minLength="8" autoComplete="new-password" placeholder="Minimal 8 karakter" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Konfirmasi password</span>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" placeholder="Ulangi password" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" />
          </label>

          <button type="submit" disabled={loading} className="premium-button flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60">
            <FaUserPlus /> {loading ? "Mendaftarkan..." : "Daftarkan Administrator"}
          </button>
        </form>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-600"><FaShieldAlt className="text-emerald-500" /> Akses terlindungi untuk lingkungan monitoring</div>
        <p className="mt-5 text-center text-sm text-slate-500">Sudah memiliki akun? <Link to="/login" className="font-bold text-teal-700 transition hover:text-teal-900">Masuk</Link></p>
      </section>
    </main>
  );
}

export default Register;
