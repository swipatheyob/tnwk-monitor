import {Link} from "react-router-dom";
import {
  FaArrowRight,
  FaCamera,
  FaChartLine,
  FaDatabase,
  FaServer,
  FaUpload,
  FaUsersCog,
  FaVideo,
  FaWifi,
} from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";

const flowOne = [
  {icon: FaCamera, title: "Kamera Lapangan", text: "Kamera 1 hingga N mengirim foto, video, dan status perangkat.", to: "/devices"},
  {icon: FaWifi, title: "Jaringan", text: "Wi-Fi atau internet meneruskan data dari lokasi kamera.", to: "/locations"},
  {icon: FaServer, title: "Backend & REST API", text: "API menerima data, mengatur perangkat, dan menyediakan data untuk web.", to: "/monitoring"},
  {icon: FaDatabase, title: "Penyimpanan", text: "Media, metadata, dan hasil analisis tersimpan sebagai riwayat observasi.", to: "/captures"},
  {icon: FaChartLine, title: "Pengolahan Citra", text: "Kualitas citra dievaluasi sebelum hasilnya digunakan untuk observasi.", to: "/analysis"},
];

function SystemArchitecture() {
  return <MainLayout>
    <div className="mb-8">
      <span className="page-kicker">Peta Sistem</span>
      <h1 className="page-title">Dua Alur Operasional</h1>
      <p className="page-description">Satu alur mengelola data yang datang dari banyak kamera lapangan. Alur kedua membantu administrator menggunakan data tersebut melalui aplikasi web.</p>
    </div>

    <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,118,110,.08)] sm:p-8">
      <div className="flex items-start gap-4"><div className="rounded-2xl bg-teal-600 p-3 text-white"><FaCamera /></div><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal-700">Alur 1</p><h2 className="mt-1 text-2xl font-extrabold text-slate-900">Pengambilan data dari banyak kamera</h2><p className="mt-2 text-sm leading-6 text-slate-600">Dari perangkat di lokasi berbeda sampai media siap dipantau dan dievaluasi.</p></div></div>
      <div className="mt-8 grid gap-3 lg:grid-cols-9 lg:items-stretch">
        {flowOne.map(({icon: Icon, title, text, to}, index) => <div key={title} className="contents">
          <Link to={to} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-teal-300 hover:bg-teal-50 lg:col-span-1">
            <Icon className="text-xl text-teal-600" /><h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
          </Link>
          {index < flowOne.length - 1 && <div className="flex items-center justify-center py-1 text-teal-500 lg:col-span-1"><FaArrowRight className="rotate-90 lg:rotate-0" /></div>}
        </div>)}
      </div>
    </section>

    <section className="mt-6 rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-6 shadow-[0_18px_45px_rgba(37,99,235,.08)] sm:p-8">
      <div className="flex items-start gap-4"><div className="rounded-2xl bg-blue-600 p-3 text-white"><FaUsersCog /></div><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-700">Alur 2</p><h2 className="mt-1 text-2xl font-extrabold text-slate-900">Penggunaan sistem melalui aplikasi web</h2><p className="mt-2 text-sm leading-6 text-slate-600">Administrator mengakses data Alur 1 lewat REST API untuk memantau, mengunggah, dan mengevaluasi observasi.</p></div></div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <Link to="/" className="rounded-2xl border border-blue-100 bg-white p-5 transition hover:border-blue-300"><FaUsersCog className="text-2xl text-blue-600" /><h3 className="mt-3 font-bold">Administrator</h3><p className="mt-2 text-sm text-slate-500">Mengakses seluruh modul operasional sesuai kebutuhan.</p></Link>
        <Link to="/monitoring" className="rounded-2xl border border-blue-100 bg-white p-5 transition hover:border-blue-300"><FaVideo className="text-2xl text-blue-600" /><h3 className="mt-3 font-bold">Aplikasi Web</h3><p className="mt-2 text-sm text-slate-500">Dashboard, monitoring langsung, lokasi, galeri, dan laporan analisis.</p></Link>
        <Link to="/upload-capture" className="rounded-2xl border border-blue-100 bg-white p-5 transition hover:border-blue-300"><FaUpload className="text-2xl text-blue-600" /><h3 className="mt-3 font-bold">Unggah Media</h3><p className="mt-2 text-sm text-slate-500">Tambahkan foto atau video observasi yang tidak berasal dari kamera aktif.</p></Link>
      </div>
    </section>
  </MainLayout>;
}

export default SystemArchitecture;
