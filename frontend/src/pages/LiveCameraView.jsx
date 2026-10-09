import {useEffect, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {FaArrowLeft, FaCamera} from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";
import {getDeviceById} from "../services/deviceService";
import {getWebcamDeviceId, isWebcamDevice, saveWebcamDeviceId} from "../utils/webcamStorage";

const HISTOGRAM_LEVELS = Array.from({length: 256}, (_, level) => level);
const FRAME_INTERVAL_MS = 350;
const HISTOGRAM_INTERVAL_MS = 1400;
const MAX_FRAME_WIDTH = 640;

const toHistogram = (counts) =>
  HISTOGRAM_LEVELS.map((level) => ({level, count: counts[level]}));

function Histogram({data, color}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{top: 8, right: 8, bottom: 4, left: 0}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="level"
            interval={31}
            tick={{fontSize: 10}}
            tickFormatter={(level) => (level === 255 ? "255" : `${level}`)}
          />
          <YAxis width={42} tick={{fontSize: 10}} />
          <Tooltip
            formatter={(value) => [value, "Jumlah piksel"]}
            labelFormatter={(level) => `Intensitas ${level}`}
          />
          <Bar dataKey="count" fill={color} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LiveCameraView() {
  const {deviceId} = useParams();
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const enhancedCanvasRef = useRef(null);
  const equalizedCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const [device, setDevice] = useState(null);
  const [histograms, setHistograms] = useState({
    original: toHistogram(Array(256).fill(0)),
    enhanced: toHistogram(Array(256).fill(0)),
    equalized: toHistogram(Array(256).fill(0)),
  });
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [streamStatus, setStreamStatus] = useState("Menghubungkan...");

  const panels = [
    {title: "Original", description: "Frame asli dari webcam", color: "#3b82f6", data: histograms.original},
    {title: "Enhanced", description: "Peningkatan kontras dan saturasi", color: "#22c55e", data: histograms.enhanced},
    {title: "Grayscale · Histogram Equalization", description: "Citra grayscale dengan distribusi intensitas diratakan", color: "#a855f7", data: histograms.equalized},
  ];

  useEffect(() => {
    let active = true;
    let frameTimer;
    let connectionTimer;
    let histogramTimer;
    let stream;
    let lastFrameUrl = "";
    const videoElement = videoRef.current;
    const imageElement = imageRef.current;
    let sourceElement = null;

    const stopStream = () => {
      stream?.getTracks().forEach((track) => track.stop());
      if (streamRef.current === stream) streamRef.current = null;
      socketRef.current?.close();
      socketRef.current = null;
      if (imageElement) imageElement.removeAttribute("src");
      if (lastFrameUrl) URL.revokeObjectURL(lastFrameUrl);
    };

    const connect = async () => {
      setError("");
      setStreamStatus("Mengambil konfigurasi kamera...");

      try {
        const registeredDevice = await getDeviceById(deviceId);
        if (!active) return;
        setDevice(registeredDevice);

        const renderFrame = () => {
          const sourceCanvas = sourceCanvasRef.current;
          const enhancedCanvas = enhancedCanvasRef.current;
          const equalizedCanvas = equalizedCanvasRef.current;
          const source = sourceElement;
          const sourceWidth = source instanceof HTMLVideoElement
            ? source.videoWidth
            : source?.naturalWidth || 0;
          const sourceHeight = source instanceof HTMLVideoElement
            ? source.videoHeight
            : source?.naturalHeight || 0;
          if (
            !sourceCanvas ||
            !enhancedCanvas ||
            !equalizedCanvas ||
            !source ||
            sourceWidth === 0 ||
            sourceHeight === 0
          ) return;

          const scale = Math.min(1, MAX_FRAME_WIDTH / sourceWidth);
          const width = Math.max(1, Math.round(sourceWidth * scale));
          const height = Math.max(1, Math.round(sourceHeight * scale));
          sourceCanvas.width = width;
          sourceCanvas.height = height;
          enhancedCanvas.width = width;
          enhancedCanvas.height = height;
          equalizedCanvas.width = width;
          equalizedCanvas.height = height;

          const sourceContext = sourceCanvas.getContext("2d", {willReadFrequently: true});
          sourceContext.drawImage(source, 0, 0, width, height);
          const sourceImage = sourceContext.getImageData(0, 0, width, height);
          const enhancedImage = new ImageData(
            new Uint8ClampedArray(sourceImage.data),
            width,
            height,
          );
          const grayCounts = Array(256).fill(0);

          for (let index = 0; index < sourceImage.data.length; index += 4) {
            const red = sourceImage.data[index];
            const green = sourceImage.data[index + 1];
            const blue = sourceImage.data[index + 2];
            const gray = Math.round((red + green + blue) / 3);
            grayCounts[gray] += 1;

            const contrast = 1.3;
            const saturation = 1.2;
            const adjusted = [
              red + 25,
              green + 25,
              blue + 25,
            ].map((value) => (value - 128) * contrast + 128);
            const average = (adjusted[0] + adjusted[1] + adjusted[2]) / 3;
            for (let channel = 0; channel < 3; channel += 1) {
              enhancedImage.data[index + channel] = Math.max(
                0,
                Math.min(255, average + (adjusted[channel] - average) * saturation),
              );
            }
          }

          const cumulative = Array(256).fill(0);
          cumulative[0] = grayCounts[0];
          for (let level = 1; level < 256; level += 1) {
            cumulative[level] = cumulative[level - 1] + grayCounts[level];
          }
          const pixelCount = width * height;
          const equalizedImage = new ImageData(width, height);
          const originalHistogram = Array(256).fill(0);
          const enhancedHistogram = Array(256).fill(0);
          const equalizedHistogram = Array(256).fill(0);

          for (let index = 0; index < sourceImage.data.length; index += 4) {
            const originalGray = Math.round(
              (sourceImage.data[index] + sourceImage.data[index + 1] + sourceImage.data[index + 2]) / 3,
            );
            const enhancedGray = Math.round(
              (enhancedImage.data[index] + enhancedImage.data[index + 1] + enhancedImage.data[index + 2]) / 3,
            );
            const equalizedGray = Math.round(
              (cumulative[originalGray] * 255) / pixelCount,
            );

            originalHistogram[originalGray] += 1;
            enhancedHistogram[enhancedGray] += 1;
            equalizedHistogram[equalizedGray] += 1;
            equalizedImage.data[index] = equalizedGray;
            equalizedImage.data[index + 1] = equalizedGray;
            equalizedImage.data[index + 2] = equalizedGray;
            equalizedImage.data[index + 3] = 255;
          }

          enhancedCanvas.getContext("2d").putImageData(enhancedImage, 0, 0);
          equalizedCanvas.getContext("2d").putImageData(equalizedImage, 0, 0);

          if (Date.now() - histogramTimer >= HISTOGRAM_INTERVAL_MS) {
            histogramTimer = Date.now();
            setHistograms({
              original: toHistogram(originalHistogram),
              enhanced: toHistogram(enhancedHistogram),
              equalized: toHistogram(equalizedHistogram),
            });
          }
        };

        const startFrameProcessing = () => {
          if (frameTimer) return;
          window.clearTimeout(connectionTimer);
          histogramTimer = 0;
          frameTimer = window.setInterval(renderFrame, FRAME_INTERVAL_MS);
          renderFrame();
        };

        const webcamDevice = isWebcamDevice(registeredDevice);
        if (webcamDevice) {
          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Browser tidak mendukung webcam. Buka aplikasi melalui localhost atau HTTPS.");
          }

          setStreamStatus("Meminta izin webcam laptop...");
          const browserDeviceId = getWebcamDeviceId(deviceId);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: browserDeviceId
                ? {
                  deviceId: {exact: browserDeviceId},
                  width: {ideal: 1280},
                  height: {ideal: 720},
                }
                : {width: {ideal: 1280}, height: {ideal: 720}},
            });
          } catch (cameraError) {
            if (!browserDeviceId || !["OverconstrainedError", "NotFoundError"].includes(cameraError.name)) {
              throw cameraError;
            }
            stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {width: {ideal: 1280}, height: {ideal: 720}},
            });
          }
          if (!active) {
            stopStream();
            return;
          }
          streamRef.current = stream;
          const activeDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId;
          if (activeDeviceId) saveWebcamDeviceId(deviceId, activeDeviceId);
          if (!videoElement) throw new Error("Elemen preview webcam belum siap.");
          videoElement.srcObject = stream;
          sourceElement = videoElement;
          await videoElement.play();
          setStreamStatus("Webcam laptop tersambung");
          startFrameProcessing();
        } else {
          const macAddress = String(
            registeredDevice.macAddress || registeredDevice.deviceCode || "",
          ).replace(/:/g, "");
          if (!macAddress) throw new Error("Kamera ini belum memiliki MAC address atau kode perangkat.");
          if (!imageElement) throw new Error("Elemen preview stream belum siap.");

          setStreamStatus("Menghubungkan stream kamera...");
          const socket = new WebSocket(
            `wss://satwa-monitoring.psti-ubl.id/ws/viewer?mac=${encodeURIComponent(macAddress)}`,
          );
          socket.binaryType = "blob";
          socketRef.current = socket;
          sourceElement = imageElement;

          socket.onopen = () => {
            if (active) setStreamStatus("Stream kamera tersambung, menunggu frame...");
          };
          socket.onmessage = (event) => {
            if (!active || !(event.data instanceof Blob)) return;
            const nextFrameUrl = URL.createObjectURL(event.data);
            const previousFrameUrl = lastFrameUrl;
            lastFrameUrl = nextFrameUrl;
            imageElement.src = nextFrameUrl;
            if (previousFrameUrl) {
              window.setTimeout(() => URL.revokeObjectURL(previousFrameUrl), 1000);
            }
            setStreamStatus("Stream kamera aktif");
            startFrameProcessing();
          };
          socket.onerror = () => {
            if (active) {
              setError("Gagal terhubung ke stream kamera. Pastikan kamera online dan MAC address benar.");
              setStreamStatus("Stream kamera tidak tersedia");
            }
          };
          socket.onclose = () => {
            if (active) {
              setError("Koneksi stream kamera terputus.");
              setStreamStatus("Stream terputus");
            }
          };
          connectionTimer = window.setTimeout(() => {
            if (active && !frameTimer) {
              setError("Kamera tidak mengirim frame. Periksa status kamera dan koneksi jaringan.");
              setStreamStatus("Tidak ada frame dari kamera");
            }
          }, 10000);
        }
      } catch (connectionError) {
        if (active) {
          stopStream();
          setError(connectionError.message || "Gagal menghubungkan webcam laptop.");
          setStreamStatus("Kamera tidak terhubung");
        }
      }
    };

    connect();
    return () => {
      active = false;
      window.clearInterval(frameTimer);
      window.clearTimeout(connectionTimer);
      stopStream();
      if (videoElement) videoElement.srcObject = null;
      if (lastFrameUrl) URL.revokeObjectURL(lastFrameUrl);
    };
  }, [deviceId, retry]);

  return (
    <MainLayout>
      <div className="mb-8">
        <Link to="/monitoring" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900">
          <FaArrowLeft /> Kembali ke Live Monitoring
        </Link>
        <span className="page-kicker block">Live Monitoring · {device && isWebcamDevice(device) ? "Webcam Laptop" : "Kamera Lapangan"}</span>
        <h1 className="page-title">{device?.deviceName || "Stream Kamera"}</h1>
        <p className="page-description">
          {streamStatus} · Preview Original, Enhanced, grayscale dengan histogram equalization, dan distribusi intensitas piksel.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-semibold">Kamera belum terhubung</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="mt-4 rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
          >
            Coba hubungkan lagi
          </button>
        </div>
      )}

      <canvas ref={sourceCanvasRef} className="hidden" />

      <section className="grid gap-5 xl:grid-cols-3">
        {panels.map((panel, index) => (
          <article key={panel.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <h2 className="font-bold text-slate-800">{panel.title}</h2>
              <p className="mt-1 text-xs text-slate-500">{panel.description}</p>
            </div>
            <div className="aspect-video bg-slate-950">
              {index === 0 ? (
                device && isWebcamDevice(device)
                  ? <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
                  : <img ref={imageRef} alt={`Stream ${device?.deviceName || "kamera"}`} className="h-full w-full object-contain" />
              ) : (
                <canvas
                  ref={index === 1 ? enhancedCanvasRef : equalizedCanvasRef}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Histogram dari Ketiga Citra</h2>
        <div className="grid gap-5 xl:grid-cols-3">
          {panels.map((panel) => (
            <article key={panel.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-1 font-semibold text-slate-800">{panel.title}</h3>
              <p className="mb-2 text-xs text-slate-500">Histogram intensitas grayscale (0–255)</p>
              <Histogram data={panel.data} color={panel.color} />
            </article>
          ))}
        </div>
      </section>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
        <FaCamera /> {device && isWebcamDevice(device)
          ? "Webcam lokal aktif hanya di browser dan laptop tempat kamera ini didaftarkan."
          : "Stream menampilkan feed dari kamera yang dipilih, berdasarkan identitas perangkatnya."}
      </div>
    </MainLayout>
  );
}

export default LiveCameraView;
