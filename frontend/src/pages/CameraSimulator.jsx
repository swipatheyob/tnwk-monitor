import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  Bar
} from "react-chartjs-2";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip
} from "chart.js";

import MainLayout
  from "../layouts/MainLayout";

import {
  uploadCapture
} from "../services/captureService";

import {
  getDevices
} from "../services/deviceService";

import {
  getApiUrl
} from "../config/apiConfig";

const PROCESS_INTERVAL_MS = 150;
const HISTOGRAM_INTERVAL_MS = 2000;
const ESP32_PROCESS_INTERVAL_MS = 300;
const ESP32_HISTOGRAM_INTERVAL_MS = 3500;
const AUTO_CAPTURE_INTERVAL_MS = 30000;
const ESP_CONNECTION_TIMEOUT_MS = 10000;
const DEFAULT_ESP32_PROXY_STREAM_URL =
  getApiUrl("/esp32/stream");
const EMPTY_HISTOGRAM =
  () =>
    Array(256).fill(0);

const HISTOGRAM_LABELS =
  Array.from(
    {
      length: 256
    },
    (_, index) =>
      index
  );

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

const histogramOptions = {
  animation: false,
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      border: {
        color: "rgba(203, 213, 225, 0.9)"
      },
      grid: {
        color: "rgba(203, 213, 225, 0.72)"
      },
      title: {
        display: true,
        text: "Pixel Intensity (0-255)",
        color: "#6b7280"
      },
      ticks: {
        color: "#6b7280",
        autoSkip: false,
        callback(value, index) {
          return index % 32 === 0 || index === 255
            ? index
            : "";
        },
        maxRotation: 0
      }
    },
    y: {
      beginAtZero: true,
      border: {
        color: "rgba(203, 213, 225, 0.9)"
      },
      grid: {
        color: "rgba(203, 213, 225, 0.72)"
      },
      title: {
        display: true,
        text: "Pixel Count",
        color: "#6b7280"
      },
      ticks: {
        color: "#6b7280"
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

function calculateStandardDeviation(
  sum,
  squaredSum,
  pixelCount
) {

  if (pixelCount === 0) {
    return 0;
  }

  const mean =
    sum / pixelCount;

  const variance =
    Math.max(
      0,
      (squaredSum / pixelCount) -
        (mean * mean)
    );

  return Math.sqrt(
    variance
  );

}

function getSourceSize(
  source
) {

  if (source instanceof HTMLVideoElement) {
    return {
      height:
        source.videoHeight,
      width:
        source.videoWidth
    };
  }

  return {
    height:
      source?.naturalHeight || 0,
    width:
      source?.naturalWidth || 0
  };

}

function CameraSimulator() {

  const videoRef =
    useRef(null);

  const espImageRef =
    useRef(null);

  const captureCanvasRef =
    useRef(null);

  const enhancedCanvasRef =
    useRef(null);

  const histogramCanvasRef =
    useRef(null);

  const autoCaptureIntervalRef =
    useRef(null);

  const processIntervalRef =
    useRef(null);

  const histogramIntervalRef =
    useRef(null);

  const espReadyIntervalRef =
    useRef(null);

  const espTimeoutRef =
    useRef(null);

  const rafIdRef =
    useRef(null);

  const lastProcessTimeRef =
    useRef(0);

  const cameraActiveRef =
    useRef(false);

  const activeSourceTypeRef =
    useRef("webcam");

  const selectedDeviceIdRef =
    useRef("");

  const [
    cameraSource,
    setCameraSource
  ] = useState("webcam");

  const [
    devices,
    setDevices
  ] = useState([]);

  const [
    selectedDeviceId,
    setSelectedDeviceId
  ] = useState("");

  const [
    espStreamUrl,
    setEspStreamUrl
  ] = useState(
    DEFAULT_ESP32_PROXY_STREAM_URL
  );

  const [
    connectedEspUrl,
    setConnectedEspUrl
  ] = useState("");

  const [
    running,
    setRunning
  ] = useState(false);

  const [
    status,
    setStatus
  ] = useState(
    "Camera not started"
  );

  const [
    originalStandardDeviation,
    setOriginalStandardDeviation
  ] = useState(0);

  const [
    enhancedStandardDeviation,
    setEnhancedStandardDeviation
  ] = useState(0);

  const [
    originalHistogram,
    setOriginalHistogram
  ] = useState(
    EMPTY_HISTOGRAM
  );

  const [
    enhancedHistogram,
    setEnhancedHistogram
  ] = useState(
    EMPTY_HISTOGRAM
  );

  const originalHistogramData =
    useMemo(
      () => ({
        labels:
          HISTOGRAM_LABELS,
        datasets: [
          {
            backgroundColor:
              "rgba(59, 130, 246, 0.78)",
            borderWidth: 0,
            data:
              originalHistogram
          }
        ]
      }),
      [
        originalHistogram
      ]
    );

  const enhancedHistogramData =
    useMemo(
      () => ({
        labels:
          HISTOGRAM_LABELS,
        datasets: [
          {
            backgroundColor:
              "rgba(34, 197, 94, 0.78)",
            borderWidth: 0,
            data:
              enhancedHistogram
          }
        ]
      }),
      [
        enhancedHistogram
      ]
    );

  const getActiveFrameSource =
    useCallback(() => {

      if (
        activeSourceTypeRef.current ===
        "esp32"
      ) {
        return espImageRef.current;
      }

      return videoRef.current;

    }, []);

  const clearIntervals =
    useCallback(() => {

      clearInterval(
        autoCaptureIntervalRef.current
      );

      clearInterval(
        processIntervalRef.current
      );

      clearInterval(
        histogramIntervalRef.current
      );

      clearInterval(
        espReadyIntervalRef.current
      );

      clearTimeout(
        espTimeoutRef.current
      );

      if (rafIdRef.current) {
        cancelAnimationFrame(
          rafIdRef.current
        );
      }

      autoCaptureIntervalRef.current =
        null;

      processIntervalRef.current =
        null;

      histogramIntervalRef.current =
        null;

      espReadyIntervalRef.current =
        null;

      espTimeoutRef.current =
        null;

      rafIdRef.current =
        null;

      lastProcessTimeRef.current =
        0;

    }, []);

  const stopMediaStream =
    useCallback(() => {

      const video =
        videoRef.current;

      if (!video?.srcObject) {
        return;
      }

      video.srcObject
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );

      video.srcObject =
        null;

    }, []);

  const resetMetrics =
    useCallback(() => {

      setOriginalStandardDeviation(
        0
      );

      setEnhancedStandardDeviation(
        0
      );

      setOriginalHistogram(
        EMPTY_HISTOGRAM()
      );

      setEnhancedHistogram(
        EMPTY_HISTOGRAM()
      );

      const enhancedCanvas =
        enhancedCanvasRef.current;

      if (enhancedCanvas) {

        enhancedCanvas
          .getContext("2d")
          .clearRect(
            0,
            0,
            enhancedCanvas.width,
            enhancedCanvas.height
          );

      }

    }, []);

  const captureAndUpload =
    useCallback(async () => {

      try {

        if (!cameraActiveRef.current) {
          return;
        }

        if (!selectedDeviceIdRef.current) {
          setStatus(
            "Pilih device sebelum mengambil capture"
          );

          return;
        }

        const source =
          getActiveFrameSource();

        const canvas =
          captureCanvasRef.current;

        const {
          height,
          width
        } = getSourceSize(source);

        if (
          !source ||
          !canvas ||
          width === 0 ||
          height === 0
        ) {
          return;
        }

        canvas.width =
          width;

        canvas.height =
          height;

        canvas
          .getContext("2d")
          .drawImage(
            source,
            0,
            0,
            width,
            height
          );

        const blob =
          await new Promise(
            resolve =>
              canvas.toBlob(
                resolve,
                "image/jpeg"
              )
          );

        if (!blob) {
          throw new Error(
            "Failed to create capture image"
          );
        }

        const formData =
          new FormData();

        formData.append(
          "image",
          blob,
          `${Date.now()}.jpg`
        );

        formData.append(
          "deviceId",
          selectedDeviceIdRef.current
        );

        formData.append(
          "source",
          activeSourceTypeRef.current ===
            "esp32"
            ? "esp32cam"
            : "webcam"
        );

        await uploadCapture(
          formData
        );

        if (cameraActiveRef.current) {

          setStatus(
            `Capture uploaded: ${new Date().toLocaleTimeString()}`
          );

        }

      } catch (error) {

        console.log(
          error
        );

        if (cameraActiveRef.current) {

          setStatus(
            activeSourceTypeRef.current ===
              "esp32"
              ? "ESP32-CAM processing failed. Check the backend proxy."
              : "Upload failed"
          );

        }

      }

    }, [
      getActiveFrameSource
    ]);

  const processRealtime =
    useCallback(() => {

      clearInterval(
        processIntervalRef.current
      );

      if (rafIdRef.current) {
        cancelAnimationFrame(
          rafIdRef.current
        );
      }

      const interval =
        activeSourceTypeRef.current ===
          "esp32"
          ? ESP32_PROCESS_INTERVAL_MS
          : PROCESS_INTERVAL_MS;

      processIntervalRef.current =
        setInterval(() => {

          try {

            const source =
              getActiveFrameSource();

            const canvas =
              enhancedCanvasRef.current;

            const {
              height,
              width
            } = getSourceSize(source);

              if (
                !source ||
                !canvas ||
                width === 0 ||
                height === 0
              ) {
                return;
              }

              canvas.width =
                width;

              canvas.height =
                height;

              const ctx =
                canvas.getContext(
                  "2d",
                  {
                    willReadFrequently:
                      true
                  }
                );

              ctx.drawImage(
                source,
                0,
                0,
                width,
                height
              );

              const imageData =
                ctx.getImageData(
                  0,
                  0,
                  width,
                  height
                );

              const data =
                imageData.data;

              let originalSum = 0;
              let originalSquaredSum = 0;
              let enhancedSum = 0;
              let enhancedSquaredSum = 0;

              const pixelCount =
                data.length / 4;

              for (
                let i = 0;
                i < data.length;
                i += 4
              ) {

                const gray =
                (
                  data[i] +
                  data[i + 1] +
                  data[i + 2]
                ) / 3;

                originalSum += gray;

                originalSquaredSum +=
                  gray * gray;

                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                r += 20;
                g += 20;
                b += 20;

                const contrast = 1.25;

                r =
                  ((r - 128) * contrast) +
                  128;

                g =
                  ((g - 128) * contrast) +
                  128;

                b =
                  ((b - 128) * contrast) +
                  128;

                const avg =
                  (r + g + b) / 3;

                const saturation = 1.15;

                r =
                  avg +
                  (r - avg) *
                  saturation;

                g =
                  avg +
                  (g - avg) *
                  saturation;

                b =
                  avg +
                  (b - avg) *
                  saturation;

                r =
                  Math.max(
                    0,
                    Math.min(
                      255,
                      r
                    )
                  );

                g =
                  Math.max(
                    0,
                    Math.min(
                      255,
                      g
                    )
                  );

                b =
                  Math.max(
                    0,
                    Math.min(
                      255,
                      b
                    )
                  );

                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;

                const enhancedGray =
                  (
                    r +
                    g +
                    b
                  ) / 3;

                enhancedSum +=
                  enhancedGray;

                enhancedSquaredSum +=
                  enhancedGray *
                  enhancedGray;

              }

              ctx.putImageData(
                imageData,
                0,
                0
              );

              setOriginalStandardDeviation(
                calculateStandardDeviation(
                  originalSum,
                  originalSquaredSum,
                  pixelCount
                )
              );

              setEnhancedStandardDeviation(
                calculateStandardDeviation(
                  enhancedSum,
                  enhancedSquaredSum,
                  pixelCount
                )
              );

            } catch (error) {

              console.log(
                error
              );

              clearInterval(
                processIntervalRef.current
              );

              setStatus(
                "ESP32-CAM processing failed. Check the backend proxy."
              );

            }

          }, interval);

    }, [
      getActiveFrameSource
    ]);

  const processHistograms =
    useCallback(() => {

      clearInterval(
        histogramIntervalRef.current
      );

      const interval =
        activeSourceTypeRef.current ===
          "esp32"
          ? ESP32_HISTOGRAM_INTERVAL_MS
          : HISTOGRAM_INTERVAL_MS;

      histogramIntervalRef.current =
        setInterval(() => {

          try {

            const source =
              getActiveFrameSource();

            const originalCanvas =
              histogramCanvasRef.current;

            const enhancedCanvas =
              enhancedCanvasRef.current;

            const {
              height,
              width
            } = getSourceSize(source);

            if (
              !source ||
              !originalCanvas ||
              !enhancedCanvas ||
              width === 0 ||
              height === 0 ||
              enhancedCanvas.width === 0
            ) {
              return;
            }

            originalCanvas.width =
              width;

            originalCanvas.height =
              height;

            const originalCtx =
              originalCanvas.getContext(
                "2d",
                {
                  willReadFrequently:
                    true
                }
              );

            originalCtx.drawImage(
              source,
              0,
              0,
              width,
              height
            );

            const originalData =
              originalCtx.getImageData(
                0,
                0,
                width,
                height
              ).data;

            const enhancedData =
              enhancedCanvas
                .getContext(
                  "2d",
                  {
                    willReadFrequently:
                      true
                  }
                )
                .getImageData(
                  0,
                  0,
                  enhancedCanvas.width,
                  enhancedCanvas.height
                ).data;

            const nextOriginalHistogram =
              EMPTY_HISTOGRAM();

            const nextEnhancedHistogram =
              EMPTY_HISTOGRAM();

            for (
              let i = 0;
              i < originalData.length;
              i += 4
            ) {

              const gray =
                Math.round(
                  (
                    originalData[i] +
                    originalData[i + 1] +
                    originalData[i + 2]
                  ) / 3
                );

              nextOriginalHistogram[gray] +=
                1;

            }

            for (
              let i = 0;
              i < enhancedData.length;
              i += 4
            ) {

              const gray =
                Math.round(
                  (
                    enhancedData[i] +
                    enhancedData[i + 1] +
                    enhancedData[i + 2]
                  ) / 3
                );

              nextEnhancedHistogram[gray] +=
                1;

            }

            setOriginalHistogram(
              nextOriginalHistogram
            );

            setEnhancedHistogram(
              nextEnhancedHistogram
            );

          } catch (error) {

            console.log(
              error
            );

            clearInterval(
              histogramIntervalRef.current
            );

          }

        }, interval);

    }, [
      getActiveFrameSource
    ]);

  const startProcessing =
    useCallback((
      sourceType
    ) => {

      activeSourceTypeRef.current =
        sourceType;

      cameraActiveRef.current =
        true;

      processRealtime();
      processHistograms();

      autoCaptureIntervalRef.current =
        setInterval(
          captureAndUpload,
          AUTO_CAPTURE_INTERVAL_MS
        );

      captureAndUpload();

      setRunning(
        true
      );

    }, [
      captureAndUpload,
      processHistograms,
      processRealtime
    ]);

  const stopCamera =
    useCallback((
      nextStatus = "Camera stopped"
    ) => {

      cameraActiveRef.current =
        false;

      clearIntervals();
      stopMediaStream();
      setConnectedEspUrl("");
      resetMetrics();

      setRunning(
        false
      );

      setStatus(
        nextStatus
      );

    }, [
      clearIntervals,
      resetMetrics,
      stopMediaStream
    ]);

  const startCamera =
    async () => {

      if (!selectedDeviceIdRef.current) {
        setStatus(
          "Pilih device sebelum memulai kamera"
        );

        return;
      }

      try {

        stopCamera(
          "Connecting to webcam..."
        );

        activeSourceTypeRef.current =
          "webcam";

        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              video: true
            });

        const video =
          videoRef.current;

        if (!video) {

          stream
            .getTracks()
            .forEach(
              track =>
                track.stop()
            );

          return;

        }

        video.srcObject =
          stream;

        await video.play();

        startProcessing(
          "webcam"
        );

        setStatus(
          "Webcam connected - auto capture every 30 seconds"
        );

      } catch (error) {

        console.log(
          error
        );

        stopCamera(
          "Failed to access webcam"
        );

      }

    };

  const connectEspCamera =
    () => {

      if (!selectedDeviceIdRef.current) {
        setStatus(
          "Pilih device sebelum menghubungkan ESP32-CAM"
        );

        return;
      }

      stopCamera(
        "Connecting to ESP32-CAM..."
      );

      activeSourceTypeRef.current =
        "esp32";

      setConnectedEspUrl(
        `${espStreamUrl}?t=${Date.now()}`
      );

      espTimeoutRef.current =
        setTimeout(() => {

          if (!cameraActiveRef.current) {

            stopCamera(
              "Failed to connect to ESP32-CAM"
            );

          }

        }, ESP_CONNECTION_TIMEOUT_MS);

    };

  const handleSourceChange =
    event => {

      const nextSource =
        event.target.value;

      stopCamera(
        nextSource === "webcam"
          ? "Webcam selected"
          : "ESP32-CAM proxy selected"
      );

      activeSourceTypeRef.current =
        nextSource;

      setCameraSource(
        nextSource
      );

    };

  useEffect(() => {

    const loadDevices =
      async () => {

        try {

          const data =
            await getDevices();

          setDevices(
            data
          );

          if (
            data.length > 0 &&
            !selectedDeviceIdRef.current
          ) {
            selectedDeviceIdRef.current =
              data[0]._id;

            setSelectedDeviceId(
              data[0]._id
            );
          }

        } catch (error) {

          console.log(
            error
          );

          setStatus(
            "Failed to load devices"
          );

        }

      };

    loadDevices();

  }, []);

  useEffect(() => {

    return () => {

      cameraActiveRef.current =
        false;

      clearIntervals();
      stopMediaStream();

    };

  }, [
    clearIntervals,
    stopMediaStream
  ]);

  return (

    <MainLayout>

      <div className="mb-8">

        <span className="page-kicker">
          Realtime Vision Control
        </span>

        <h1 className="page-title">
          Live Camera Intelligence
        </h1>

        <p className="page-description">
          Simulasi perangkat monitoring satwa menggunakan Webcam dan ESP32-CAM secara realtime.
        </p>

      </div>

      <div
        className="
        bg-white
        rounded-2xl
        shadow-[0_18px_45px_rgba(15,118,110,0.08)]
        border
        p-6
        mb-6
        transition-all
        duration-300
        hover:shadow-[0_22px_55px_rgba(15,118,110,0.12)]
        "
      >

        <label
          className="
          block
          font-semibold
          mb-2
          "
          htmlFor="captureDevice"
        >
          Capture Device:
        </label>

        <select
          id="captureDevice"
          value={
            selectedDeviceId
          }
          onChange={
            event => {
              const deviceId =
                event.target.value;

              selectedDeviceIdRef.current =
                deviceId;

              setSelectedDeviceId(
                deviceId
              );
            }
          }
          disabled={running}
          className="
          w-full
          max-w-md
          border
          border-slate-300
          rounded-xl
          shadow-sm
          px-3
          py-2
          mb-4
          disabled:opacity-50
          "
        >
          <option value="">
            Select Device
          </option>
          {
            devices.map(
              device => (
                <option
                  key={
                    device._id
                  }
                  value={
                    device._id
                  }
                >
                  {
                    device.deviceName
                  }
                </option>
              )
            )
          }
        </select>

        <label
          className="
          block
          font-semibold
          mb-2
          "
          htmlFor="cameraSource"
        >
          Camera Source:
        </label>

        <select
          id="cameraSource"
          value={cameraSource}
          onChange={
            handleSourceChange
          }
          className="
          w-full
          max-w-md
          border
          border-slate-300
          rounded-xl
          shadow-sm
          px-3
          py-2
          "
        >
          <option value="webcam">
            Webcam Laptop
          </option>
          <option value="esp32">
            ESP32-CAM
          </option>
        </select>

        {
          cameraSource === "esp32" && (

            <div
              className="
              mt-4
              "
            >

              <label
                className="
                block
                font-semibold
                mb-2
                "
                htmlFor="espStreamUrl"
              >
                ESP32-CAM Proxy Stream:
              </label>

              <div
                className="
                flex
                flex-col
                sm:flex-row
                gap-3
                "
              >

                <input
                  id="espStreamUrl"
                  type="url"
                  value={espStreamUrl}
                  onChange={event => setEspStreamUrl(event.target.value)}
                  className="
                  w-full
                  max-w-xl
                  border
                  border-slate-300
                  rounded-xl
                  shadow-sm
                  px-3
                  py-2
                  "
                />

                <button
                  type="button"
                  onClick={
                    connectEspCamera
                  }
                  disabled={
                    !selectedDeviceId ||
                    running
                  }
                  className="
                  bg-teal-600
                  hover:bg-teal-700
                  text-white
                  px-4
                  py-2.5
                  rounded-2xl
                  shadow-md
                  transition-all
                  duration-300
                  disabled:opacity-50
                  "
                >
                  Connect
                </button>

              </div>

              <p
                className="
                mt-2
                text-sm
                text-gray-600
                "
              >
                Stream ESP32-CAM diteruskan melalui backend Express agar aman digunakan oleh canvas.
              </p>

            </div>

          )
        }

      </div>

      <div
        className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-5
        "
      >

        <div>

          <h3
            className="
            font-semibold
            mb-2
            "
          >
            Original Camera
          </h3>

          {
            cameraSource ===
              "webcam"
              ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="
                  w-full
                  rounded-2xl
                  shadow-[0_18px_45px_rgba(15,118,110,0.10)]
                  border
                  bg-black
                  "
                />
              )
              : connectedEspUrl
                ? (
                  <img
                    ref={espImageRef}
                    src={connectedEspUrl}
                    crossOrigin="anonymous"
                    alt="ESP32-CAM stream"
                    onLoad={() => {
                      if (
                        !cameraActiveRef.current &&
                        activeSourceTypeRef.current ===
                          "esp32"
                      ) {
                        clearTimeout(
                          espTimeoutRef.current
                        );
                        startProcessing(
                          "esp32"
                        );
                        setStatus(
                          "Connected to ESP32-CAM"
                        );
                      }
                    }}
                    onError={() =>
                      stopCamera(
                        "Failed to connect to ESP32-CAM"
                      )
                    }
                    className="
                    w-full
                    rounded-2xl
                    shadow-[0_18px_45px_rgba(15,118,110,0.10)]
                    border
                    bg-black
                    "
                  />
                )
                : (
                  <div
                    className="
                    aspect-video
                    w-full
                    rounded-2xl
                    shadow-[0_18px_45px_rgba(15,118,110,0.10)]
                    border
                    bg-black
                    text-slate-300
                    flex
                    items-center
                    justify-center
                    "
                  >
                    ESP32-CAM not connected
                  </div>
                )
          }

          <div
            className="
            mt-2
            text-gray-700
            "
          >
            Std Dev: {
              originalStandardDeviation
                .toFixed(2)
            }
          </div>

        </div>

        <div>

          <h3
            className="
            font-semibold
            mb-2
            "
          >
            Enhanced Camera
          </h3>

          <canvas
            ref={
              enhancedCanvasRef
            }
            className="
            w-full
            rounded-2xl
            shadow-[0_18px_45px_rgba(15,118,110,0.10)]
            border
            bg-black
            "
          />

          <div
            className="
            mt-2
            text-gray-700
            "
          >
            Std Dev: {
              enhancedStandardDeviation
                .toFixed(2)
            }
          </div>

        </div>

      </div>

      <div
        className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-5
        mt-5
        "
      >

        <div
          className="
          rounded-2xl
          bg-white
          p-6
          shadow-[0_18px_45px_rgba(15,118,110,0.08)]
          border
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_22px_55px_rgba(15,118,110,0.12)]
          "
        >

          <h3
            className="
            font-semibold
            mb-3
            "
          >
            Original Histogram
          </h3>

          <div className="h-72">
            <Bar
              data={
                originalHistogramData
              }
              options={
                histogramOptions
              }
            />
          </div>

        </div>

        <div
          className="
          rounded-2xl
          bg-white
          p-5
          shadow-[0_18px_45px_rgba(15,118,110,0.08)]
          border
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_22px_55px_rgba(15,118,110,0.12)]
          "
        >

          <h3
            className="
            font-semibold
            mb-3
            "
          >
            Enhanced Histogram
          </h3>

          <div className="h-72">
            <Bar
              data={
                enhancedHistogramData
              }
              options={
                histogramOptions
              }
            />
          </div>

        </div>

      </div>

      <canvas
        ref={captureCanvasRef}
        style={{
          display:
            "none"
        }}
      />

      <canvas
        ref={histogramCanvasRef}
        style={{
          display:
            "none"
        }}
      />

      <div
        className="
        flex
        gap-3
        mt-5
        "
      >

        <button
          type="button"
          onClick={
            startCamera
          }
          disabled={
            running ||
            !selectedDeviceId ||
            cameraSource !==
              "webcam"
          }
          className="
          premium-button
          transition-all
          px-4
          py-3
          rounded-2xl
          disabled:opacity-50
          "
        >
          Start Camera
        </button>

        <button
          type="button"
          onClick={
            () =>
              stopCamera()
          }
          disabled={
            !running &&
            !connectedEspUrl
          }
          className="
          bg-red-500
          hover:bg-red-600
          shadow-md
          transition-all
          duration-300
          text-white
          px-4
          py-3
          rounded-2xl
          disabled:opacity-50
          "
        >
          Stop Camera
        </button>

      </div>

      <div
        className="
        mt-6
        bg-white
        border
        rounded-xl
        p-4
        shadow-[0_12px_30px_rgba(15,118,110,0.08)]
        "
      >
        <span className="font-semibold">
          Status:
        </span>
        {" "}
        {status}
      </div>

    </MainLayout>

  );

}

export default CameraSimulator;


