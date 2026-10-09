import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {FaBroadcastTower, FaExpand, FaMapMarkerAlt, FaPlus, FaVideo} from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";
import {getDevices} from "../services/deviceService";
import {isWebcamDevice} from "../utils/webcamStorage";

function CameraTile({device}) {
  const [frameUrl, setFrameUrl] = useState("");
  const [streamState, setStreamState] = useState("connecting");
  const isWebcam = isWebcamDevice(device);
  const canOpen = isWebcam || device.status === "online";

  useEffect(() => {
    if (isWebcam || !canOpen) return undefined;

    const cameraCode = String(device.macAddress || device.deviceCode || "").replace(/:/g, "");
    if (!cameraCode) return undefined;

    let previousUrl = "";
    const socket = new WebSocket(`wss://satwa-monitoring.psti-ubl.id/ws/viewer?mac=${cameraCode}`);
    socket.binaryType = "blob";
    socket.onopen = () => setStreamState("live");
    socket.onerror = () => setStreamState("unavailable");
    socket.onclose = () => setStreamState((current) => current === "live" ? "reconnecting" : current);
    socket.onmessage = (event) => {
      if (!(event.data instanceof Blob)) return;
      const nextUrl = URL.createObjectURL(event.data);
      setFrameUrl(nextUrl);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      previousUrl = nextUrl;
    };

    return () => {
      socket.close();
      if (previousUrl) URL.revokeObjectURL(previousUrl);
    };
  }, [canOpen, device.cameraType, device.deviceCode, device.macAddress, device.status, isWebcam]);

  const isLive = !isWebcam && streamState === "live" && frameUrl;
  const label = isWebcam
    ? "WEBCAM LAPTOP"
    : device.status === "online"
    ? streamState === "live" ? "LIVE" : streamState === "reconnecting" ? "MENYAMBUNG ULANG" : streamState === "unavailable" ? "STREAM TIDAK TERSEDIA" : "MENGHUBUNGKAN"
    : "OFFLINE";
  const cardContent = (
    <>
      <div className="relative aspect-video bg-slate-950">
        {isLive ? <img src={frameUrl} alt={`Live feed ${device.deviceName}`} className="h-full w-full object-cover" /> : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
            <FaVideo className="text-3xl text-slate-600" />
            <span className="text-sm">{isWebcam ? "Klik untuk menghubungkan webcam laptop" : canOpen ? "Klik untuk membuka stream dan evaluasi citra" : "Kamera sedang tidak terhubung"}</span>
          </div>
        )}
        <span className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider ${isWebcam || device.status === "online" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-200"}`}>
          <i className={`h-2 w-2 rounded-full ${isWebcam || device.status === "online" ? "bg-white animate-pulse" : "bg-slate-400"}`} /> {label}
        </span>
        {canOpen && <span className="absolute right-4 top-4 rounded-xl bg-black/50 p-2.5 text-white backdrop-blur"><FaExpand /></span>}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0"><h2 className="truncate font-bold text-slate-800">{device.deviceName}</h2><p className="mt-1 text-xs text-slate-500">{isWebcam ? "Webcam lokal · browser/laptop ini" : device.deviceCode || "Kode kamera belum diatur"}</p></div>
        <div className="shrink-0 text-right text-xs text-slate-500"><FaMapMarkerAlt className="mb-1 ml-auto text-teal-600" />{Number(device.latitude).toFixed(3)}, {Number(device.longitude).toFixed(3)}</div>
      </div>
      <div className="border-t border-slate-100 px-4 py-3 text-sm font-bold text-teal-700">
        {canOpen ? "Buka stream dan evaluasi citra →" : "Kamera offline"}
      </div>
    </>
  );

  const cardClassName = "block overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-[0_18px_40px_rgba(15,118,110,0.08)] transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
  const cameraLink = `/monitoring/camera/${device._id}`;

  return canOpen
    ? <Link to={cameraLink} aria-label={`Buka stream kamera ${device.deviceName}`} className={cardClassName}>{cardContent}</Link>
    : <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,118,110,0.08)]">{cardContent}</article>;
}

function LiveMonitoring() {
  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setDevices(await getDevices()); } finally { setLoading(false); }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const visibleDevices = useMemo(() => filter === "all" ? devices : devices.filter((device) => device.status === filter), [devices, filter]);
  const online = devices.filter((device) => device.status === "online" || isWebcamDevice(device)).length;

  return <MainLayout>
    <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div><span className="page-kicker">Alur 1 · Monitoring Langsung</span><h1 className="page-title">Pusat Pantau Multi-Kamera</h1><p className="page-description">Pantau seluruh node kamera lapangan dari satu layar. Setiap kamera online mencoba tersambung ke stream-nya secara otomatis.</p></div>
      <div className="flex flex-wrap gap-3">
        <Link to="/monitoring/add-webcam" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-5 py-3 text-sm font-bold text-teal-700 hover:bg-teal-50"><FaVideo /> Tambah Webcam Laptop</Link>
        <Link to="/devices/add" className="premium-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold"><FaPlus /> Tambah ESP32-CAM</Link>
      </div>
    </div>
    <section className="mb-6 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5"><FaBroadcastTower className="mb-3 text-xl text-teal-600" /><p className="text-3xl font-extrabold text-slate-800">{online}</p><p className="mt-1 text-sm text-slate-500">Kamera tersedia (termasuk webcam lokal)</p></div>
      <div className="rounded-2xl border bg-white p-5"><p className="text-3xl font-extrabold text-slate-800">{devices.length}</p><p className="mt-1 text-sm text-slate-500">Total node kamera</p></div>
      <div className="rounded-2xl border bg-white p-5"><p className="font-bold text-slate-800">Auto refresh aktif</p><p className="mt-2 text-sm text-slate-500">Status perangkat diperbarui setiap 30 detik.</p></div>
    </section>
    <div className="mb-5 flex flex-wrap gap-2">{[["all", "Semua kamera"], ["online", "Sedang online"], ["offline", "Offline"]].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${filter === value ? "bg-teal-600 text-white" : "border bg-white text-slate-600"}`}>{label}</button>)}</div>
    {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">Memuat daftar kamera…</div> : visibleDevices.length ? <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{visibleDevices.map((device) => <CameraTile key={device._id} device={device} />)}</div> : <div className="rounded-2xl border bg-white p-10 text-center"><p className="font-semibold">Belum ada kamera pada daftar ini.</p><Link to="/monitoring/add-webcam" className="mt-3 inline-block text-teal-700">Tambahkan webcam laptop</Link></div>}
  </MainLayout>;
}

export default LiveMonitoring;
