import {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FaArrowLeft, FaCamera, FaPlus} from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";
import {createDevice} from "../services/deviceService";
import {saveWebcamDeviceId} from "../utils/webcamStorage";

function AddWebcam() {
  const navigate = useNavigate();
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [saving, setSaving] = useState(false);
  const temporaryStreamRef = useRef(null);

  useEffect(() => () => {
    temporaryStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const discoverCameras = async () => {
    setError("");
    setLoadingCameras(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser tidak mendukung akses webcam. Gunakan localhost atau HTTPS.");
      }

      const permissionStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      temporaryStreamRef.current = permissionStream;

      const availableCameras = (await navigator.mediaDevices.enumerateDevices())
        .filter((device) => device.kind === "videoinput");
      permissionStream.getTracks().forEach((track) => track.stop());
      temporaryStreamRef.current = null;

      if (availableCameras.length === 0) {
        throw new Error("Tidak ada webcam yang terdeteksi pada laptop ini.");
      }

      setCameraDevices(availableCameras);
      setSelectedCameraId((current) =>
        availableCameras.some((camera) => camera.deviceId === current)
          ? current
          : availableCameras[0].deviceId,
      );
      setStatus(`${availableCameras.length} kamera terdeteksi. Pilih webcam yang akan didaftarkan.`);
    } catch (requestError) {
      temporaryStreamRef.current?.getTracks().forEach((track) => track.stop());
      temporaryStreamRef.current = null;
      setError(requestError.message || "Gagal mengakses webcam laptop.");
      setStatus("");
    } finally {
      setLoadingCameras(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const createdDevice = await createDevice({
        cameraType: "webcam",
        deviceCode: `WEBCAM-${suffix}`,
        deviceName: deviceName.trim(),
        status: "online",
      });

      saveWebcamDeviceId(createdDevice._id, selectedCameraId);
      navigate(`/monitoring/camera/${createdDevice._id}`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Gagal mendaftarkan webcam laptop.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <Link to="/monitoring" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900">
          <FaArrowLeft /> Kembali ke Live Monitoring
        </Link>
        <span className="page-kicker block">Alur 1 · Tambah Kamera Lokal</span>
        <h1 className="page-title">Hubungkan Webcam Laptop</h1>
        <p className="page-description">
          Izinkan akses kamera, pilih webcam, lalu daftarkan agar tampil di Live Monitoring.
          Webcam ini terhubung langsung dari browser dan laptop yang sama.
        </p>
      </div>

      <section className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,118,110,0.08)] md:p-8">
        <div className="mb-6 flex items-start gap-4">
          <span className="rounded-2xl bg-teal-50 p-4 text-2xl text-teal-700"><FaCamera /></span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pilih kamera laptop</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Browser akan meminta izin webcam. Kamera tidak merekam atau mengirim gambar sebelum stream dibuka.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={discoverCameras}
          disabled={loadingCameras || saving}
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {loadingCameras ? "Mendeteksi webcam..." : "Izinkan akses & deteksi webcam"}
        </button>

        {status && <p className="mt-4 text-sm text-emerald-700">{status}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        {cameraDevices.length > 0 && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5 border-t border-slate-100 pt-6">
            <div>
              <label htmlFor="webcamName" className="mb-2 block text-sm font-semibold text-slate-700">
                Nama kamera
              </label>
              <input
                id="webcamName"
                required
                maxLength={80}
                value={deviceName}
                onChange={(event) => setDeviceName(event.target.value)}
                placeholder="Contoh: Webcam Uji Coba"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label htmlFor="webcamDevice" className="mb-2 block text-sm font-semibold text-slate-700">
                Perangkat webcam
              </label>
              <select
                id="webcamDevice"
                required
                value={selectedCameraId}
                onChange={(event) => setSelectedCameraId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {cameraDevices.map((camera, index) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Webcam ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving || !selectedCameraId || !deviceName.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              <FaPlus /> {saving ? "Mendaftarkan..." : "Daftarkan & buka stream"}
            </button>
          </form>
        )}
      </section>
    </MainLayout>
  );
}

export default AddWebcam;
