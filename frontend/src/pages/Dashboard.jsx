import {
  useEffect,
  useState
} from "react";

import {Link} from "react-router-dom";

import MainLayout
  from "../layouts/MainLayout";

import StatCard
  from "../components/StatCard";

import {
  getDashboardStats
} from "../services/dashboardService";

import {
  FaBolt,
  FaBroadcastTower,
  FaCamera,
  FaCloudUploadAlt,
  FaProjectDiagram,
  FaPlay,
  FaShieldAlt
} from "react-icons/fa";

function Dashboard() {

  const [
    stats,
    setStats
  ] = useState({

    totalDevice: 0,

    onlineDevice: 0,

    offlineDevice: 0,

    totalCapture: 0

  });

  useEffect(() => {

    const loadData =
      async () => {

        try {

          const data =
            await getDashboardStats();

          setStats(
            data
          );

        } catch (error) {

          console.log(
            error
          );

        }

      };

    loadData();

    const interval =
      setInterval(
        loadData,
        5000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  return (

    <MainLayout>

      <div
        className="
        mb-8
        flex
        flex-col
        justify-between
        gap-5
        xl:flex-row
        xl:items-end
        "
      >

        <div>

          <span className="page-kicker">
            Operations Overview
          </span>

          <h1 className="page-title">
            Dashboard Administrator
          </h1>

          <p className="page-description">
            Kelola aliran data kamera lapangan dan gunakan hasilnya untuk
            pemantauan serta evaluasi observasi satwa.
          </p>

        </div>

        <div
          className="
          flex
          flex-wrap
          gap-3
          "
        >

          <div
            className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-emerald-100
            bg-emerald-50
            px-4
            py-3
            text-xs
            font-semibold
            text-emerald-700
            "
          >
            <FaShieldAlt />
            Secure Network
          </div>

          <div
            className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-teal-100
            bg-teal-50
            px-4
            py-3
            text-xs
            font-semibold
            text-teal-700
            "
          >
            <FaBroadcastTower />
            Live Telemetry
          </div>

        </div>

      </div>
      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-5
        "
      >

        <StatCard
          title="Total Device"
          value={
            stats.totalDevice
          }
        />

        <StatCard
          title="Online"
          value={
            stats.onlineDevice
          }
        />

        <StatCard
          title="Offline"
          value={
            stats.offlineDevice
          }
        />

        <StatCard
          title="Capture"
          value={
            stats.totalCapture
          }
        />

      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Link to="/architecture" className="group relative overflow-hidden rounded-3xl border border-teal-200 bg-linear-to-br from-teal-700 to-cyan-700 p-7 text-white shadow-[0_20px_45px_rgba(13,148,136,0.22)] transition hover:-translate-y-1">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><FaCamera /> ALUR 1 · DATA KAMERA</span>
          <h2 className="mt-5 text-2xl font-extrabold">Pengambilan Data Lapangan</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-teal-50">Kamera → jaringan → backend → penyimpanan → evaluasi citra. Pantau setiap tahap dari satu peta sistem.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Lihat alur sistem <FaProjectDiagram className="text-xs" /></span>
        </Link>
        <Link to="/upload-capture" className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-linear-to-br from-white to-amber-50 p-7 shadow-[0_20px_45px_rgba(180,83,9,0.10)] transition hover:-translate-y-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"><FaCloudUploadAlt /> ALUR 2 · APLIKASI WEB</span>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900">Ruang Kerja Administrator</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Gunakan data dari REST API untuk memantau kamera, mengunggah observasi, melihat galeri capture, dan menilai kualitas citra.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-700">Unggah observasi <FaPlay className="text-xs" /></span>
        </Link>
      </section>

      <div
        className="
        mt-6
        grid
        gap-5
        lg:grid-cols-[1.5fr_1fr]
        "
      >

        <div
          className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-7
          shadow-[0_18px_45px_rgba(15,118,110,0.08)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_24px_55px_rgba(15,118,110,0.13)]
          "
        >

          <div
            className="
            absolute
            right-0
            top-0
            h-52
            w-52
            rounded-full
            bg-teal-200/35
            blur-3xl
            "
          />

          <div className="relative">

            <div
              className="
              flex
              items-center
              justify-between
              gap-4
              "
            >

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-600">
                  Network Health
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Monitoring Infrastructure
                </h2>
              </div>

              <FaBolt className="text-2xl text-amber-300" />

            </div>

            <div
              className="
              mt-8
              grid
              gap-4
              sm:grid-cols-3
              "
            >

              {
                [
                  ["API Gateway", "Operational"],
                  ["MongoDB Storage", "Connected"],
                  ["Vision Pipeline", "Ready"]
                ].map(
                  ([label, status]) => (

                    <div
                      key={label}
                      className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-4
                      "
                    >
                      <div className="flex items-center gap-2">
                        <span className="status-dot" />
                        <span className="text-sm font-semibold text-slate-800">
                          {label}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {status}
                      </p>
                    </div>

                  )
                )
              }

            </div>

          </div>

        </div>

        <div
          className="
          rounded-3xl
          border
          border-teal-100
          bg-linear-to-br
          from-white
          to-teal-50
          p-7
          shadow-[0_18px_45px_rgba(15,118,110,0.08)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_24px_55px_rgba(15,118,110,0.13)]
          "
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
            Mission Status
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            System Ready
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Seluruh modul inti tersedia untuk pemantauan,
            akuisisi media, serta analisis citra secara realtime.
          </p>
          <div
            className="
            mt-6
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-emerald-100
            bg-emerald-50
            p-4
            "
          >
            <span className="status-dot" />
            <div>
              <p className="text-sm font-bold text-emerald-700">
                Operational
              </p>
              <p className="text-xs text-slate-500">
                Automatic refresh every 5 seconds
              </p>
            </div>
          </div>
        </div>

      </div>

    </MainLayout>

  );

}

export default Dashboard;
