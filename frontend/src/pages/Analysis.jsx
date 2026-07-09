import {
  useEffect,
  useState,
  useRef
} from "react";

import MainLayout
  from "../layouts/MainLayout";

import {
  getCaptures
} from "../services/captureService";

import {
  getCaptureDate,
  getDeviceDisplayName
} from "../utils/captureHelper";

import {
  processHistogram,
  getMetrics,
  getHistogramData
} from "../services/analysisService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Analysis() {

  const [
    captures,
    setCaptures
  ] = useState([]);

  const [
    selectedCapture,
    setSelectedCapture
  ] = useState(null);


  const [
    selectedDeviceFilter,
    setSelectedDeviceFilter
  ] = useState("");

  const [
    selectedDateFilter,
    setSelectedDateFilter
  ] = useState("");
  const [
    metrics,
    setMetrics
  ] = useState(null);

  const getMSEDescription =
  mse => {

    if (mse < 100) {
      return {
        status: "good",
        text: "Perubahan citra HE Image sangat kecil sehingga kualitas visual hasil akhir masih sangat mendekati citra asli."
      };
    }

    if (mse < 1000) {
      return {
        status: "moderate",
        text: "Perubahan citra HE Image berada pada tingkat sedang dan masih dapat diterima untuk proses peningkatan kualitas citra."
      };
    }

    return {
      status: "poor",
      text: "Perubahan citra HE Image cukup besar akibat proses peningkatan kontras dan distribusi intensitas piksel."
    };

  };

const getPSNRDescription =
  psnr => {

    if (psnr > 40) {
      return {
        status: "good",
        text: "Kualitas HE Image sangat baik dengan tingkat distorsi yang sangat rendah."
      };
    }

    if (psnr >= 30) {
      return {
        status: "moderate",
        text: "Kualitas HE Image masih baik dan detail objek tetap dapat dipertahankan."
      };
    }

    return {
      status: "poor",
      text: "Terjadi penurunan kualitas HE Image akibat perubahan intensitas piksel yang cukup signifikan."
    };

  };

const getSSIMDescription =
  ssim => {

    if (ssim > 0.90) {
      return {
        status: "good",
        text: "Struktur HE Image sangat mirip dengan citra asli."
      };
    }

    if (ssim >= 0.75) {
      return {
        status: "moderate",
        text: "Struktur HE Image masih cukup terjaga meskipun terjadi perubahan kontras."
      };
    }

    return {
      status: "poor",
      text: "Perubahan struktur HE Image mulai terlihat akibat proses peningkatan kualitas citra."
    };

  };

const getStdDevDescription =
  (values) => {

    const original =
      Number(values.original);

    const he =
      Number(values.he);

    const enhanced =
      Number(values.enhanced);

    const almostSameThreshold =
      5;

    const allAlmostSame =
      Math.abs(he - original) <=
        almostSameThreshold &&
      Math.abs(enhanced - he) <=
        almostSameThreshold &&
      Math.abs(enhanced - original) <=
        almostSameThreshold;

    if (allAlmostSame) {
      return {
        status: "moderate",
        text: "Peningkatan kontras citra relatif kecil karena distribusi intensitas citra awal sudah cukup baik."
      };
    }

    if (enhanced > he) {
      return {
        status: "good",
        text: "Histogram Equalization berhasil meningkatkan penyebaran intensitas piksel sehingga kontras citra meningkat. Tahap Image Enhancement memberikan peningkatan kontras tambahan dibandingkan hasil Histogram Equalization."
      };
    }

    if (he > original) {
      return {
        status: "good",
        text: "Histogram Equalization berhasil meningkatkan penyebaran intensitas piksel sehingga kontras citra meningkat."
      };
    }

    return {
      status: "poor",
      text: "Peningkatan kontras citra belum menunjukkan kenaikan penyebaran intensitas piksel yang signifikan."
    };

  };

const getConclusionDescription =
  (
    metricValues,
    stdDevValues
  ) => {

    const mse =
      Number(metricValues.mse);

    const psnr =
      Number(metricValues.psnr);

    const ssim =
      Number(metricValues.ssim);

    const original =
      Number(stdDevValues.original);

    const he =
      Number(stdDevValues.he);

    const enhanced =
      Number(stdDevValues.enhanced);

    const contrastImproved =
      he > original ||
      enhanced > original;

    const structurePreserved =
      ssim >= 0.75;

    const qualityPreserved =
      mse < 1000 &&
      psnr >= 30;

    if (
      contrastImproved &&
      structurePreserved &&
      qualityPreserved
    ) {
      return {
        status: "good",
        text: "Berdasarkan hasil akhir HE Image, nilai MSE, PSNR, SSIM, dan Standard Deviation menunjukkan bahwa Histogram Equalization berhasil meningkatkan kontras citra tanpa mengubah struktur utama objek secara signifikan. Peningkatan nilai Standard Deviation menunjukkan distribusi intensitas piksel HE Image menjadi lebih merata sehingga objek pada citra lebih mudah diamati."
      };
    }

    if (
      contrastImproved &&
      structurePreserved
    ) {
      return {
        status: "moderate",
        text: "Berdasarkan hasil akhir HE Image, nilai MSE, PSNR, SSIM, dan Standard Deviation menunjukkan bahwa proses Histogram Equalization mampu memperbaiki kontras, namun perubahan intensitas piksel masih perlu diperhatikan karena berpengaruh terhadap kualitas visual HE Image."
      };
    }

    return {
      status: "poor",
      text: "Berdasarkan hasil akhir HE Image, nilai MSE, PSNR, SSIM, dan Standard Deviation menunjukkan bahwa hasil Histogram Equalization belum optimal karena perubahan visual cukup besar atau peningkatan kontras belum diikuti dengan kestabilan struktur citra yang memadai."
    };

  };

const getInterpretationIconClass =
  status => {

    if (status === "good")
      return "bg-emerald-100 text-emerald-700 border-emerald-200";

    if (status === "moderate")
      return "bg-amber-100 text-amber-700 border-amber-200";

    return "bg-red-100 text-red-700 border-red-200";

  };

const getInterpretationIcon =
  status => {

    if (status === "good")
      return "✓";

    if (status === "moderate")
      return "!";

    return "×";

  };

const formatMetricValue =
  value => {

    const numberValue =
      Number(value);

    if (
      Number.isFinite(
        numberValue
      )
    ) {
      return numberValue.toFixed(4);
    }

    return value ??
      "-";

  };

const getProcessedImageUrl =
  filename =>
    `http://localhost:5000/uploads/processed/${filename}`;

const sanitizeFileNamePart =
  value =>
    String(
      value ||
      "capture"
    )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
    "capture";

const getDownloadFileName =
  (
    prefix,
    capture,
    filename
  ) => {

    const extension =
      filename?.split(".")
        .pop() ||
      "png";

    return [
      prefix,
      sanitizeFileNamePart(
        getDeviceDisplayName(
          capture
        )
      ),
      capture?._id ||
        "capture"
    ].join("-") +
      `.${extension}`;

  };
const renderInterpretationRow =
  (
    label,
    interpretation
  ) => (

    <div
      className="
      flex
      items-start
      gap-3
      "
      key={label}
    >

      <span
        className={`
        mt-0.5
        flex
        h-6
        w-6
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        text-sm
        font-bold
        ${getInterpretationIconClass(
          interpretation.status
        )}
        `}
      >
        {
          getInterpretationIcon(
            interpretation.status
          )
        }
      </span>

      <p>
        <span className="font-semibold text-slate-800">
          {label}
          {" : "}
        </span>
        {interpretation.text}
      </p>

    </div>

  );

const getEnhancedMetrics =
  metricValues =>
    metricValues?.enhanced ||
    metricValues;

const getHeMetrics =
  metricValues =>
    metricValues?.he ||
    (!metricValues?.enhanced
      ? metricValues
      : null);

const getFinalMetrics =
  metricValues =>
    getHeMetrics(metricValues) ||
    getEnhancedMetrics(metricValues);

const renderMetricSummary =
  metricValues => {

    if (!metricValues) {
      return null;
    }

    const metricCards = [
      {
        label: "Nilai MSE",
        value: formatMetricValue(
          metricValues.mse
        )
      },
      {
        label: "Nilai PSNR",
        value: `${formatMetricValue(
          metricValues.psnr
        )} dB`
      },
      {
        label: "Nilai SSIM",
        value: formatMetricValue(
          metricValues.ssim
        )
      }
    ];

    return (
      <div
        className="
        grid
        grid-cols-1
        gap-3
        "
      >
        {
          metricCards.map(
            metric => (
              <div
                className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
                "
                key={metric.label}
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {metric.value}
                </p>
              </div>
            )
          )
        }
      </div>
    );

  };
  const [
  histogramData,
  setHistogramData
] = useState(null);

  const [
    imageVersion,
    setImageVersion
  ] = useState(0);

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const heCanvasRef =
    useRef(null);

  const enhancedCanvasRef =
    useRef(null);

  const [
    originalHistogram,
    setOriginalHistogram
  ] = useState([]);

  const [
    heHistogramRealtime,
    setHeHistogramRealtime
  ] = useState([]);

  const [
    enhancedHistogramRealtime,
    setEnhancedHistogramRealtime
  ] = useState([]);

  const [
    stdDeviation,
    setStdDeviation
  ] = useState({
    original: 0,
    he: 0,
    enhanced: 0
  });


  const resetSelectedAnalysis =
    () => {

      setSelectedCapture(
        null
      );

      setMetrics(
        null
      );

      setHistogramData(
        null
      );

      setStdDeviation({
        original: 0,
        he: 0,
        enhanced: 0
      });

    };

  const getCaptureDeviceId =
    capture =>
      capture?.deviceId?._id ||
      capture?.deviceId ||
      "";

  const getCaptureDateKey =
    capture => {

      const date =
        new Date(
          capture?.capturedAt ||
          capture?.createdAt
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      return [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0")
      ].join("-");

    };

  const getCaptureDateLabel =
    dateKey => {

      if (!dateKey) {
        return "Tanggal tidak tersedia";
      }

      const [
        year,
        month,
        day
      ] = dateKey.split("-");

      return [
        day,
        month,
        year
      ].join("/");

    };

  const deviceFilterOptions =
    Array.from(
      captures.reduce(
        (
          map,
          capture
        ) => {

          const deviceId =
            getCaptureDeviceId(
              capture
            );

          if (deviceId) {
            map.set(
              deviceId,
              getDeviceDisplayName(
                capture
              )
            );
          }

          return map;

        },
        new Map()
      )
    );

  const dateFilterOptions =
    Array.from(
      captures.reduce(
        (
          map,
          capture
        ) => {

          const dateKey =
            getCaptureDateKey(
              capture
            );

          if (dateKey) {
            map.set(
              dateKey,
              getCaptureDateLabel(
                dateKey
              )
            );
          }

          return map;

        },
        new Map()
      )
    );

  const filteredCaptures =
    captures.filter(
      capture => {

        const matchesDevice =
          !selectedDeviceFilter ||
          getCaptureDeviceId(
            capture
          ) === selectedDeviceFilter;

        const matchesDate =
          !selectedDateFilter ||
          getCaptureDateKey(
            capture
          ) === selectedDateFilter;

        return matchesDevice &&
          matchesDate;

      }
    );
  const calculateStdDeviation =
    (histogram) => {

      if (
        !histogram ||
        histogram.length === 0
      ) {
        return "0.00";
      }

      const pixelCount =
        histogram.reduce(
          (total, value) =>
            total + value,
          0
        );

      if (
        pixelCount === 0
      ) {
        return "0.00";
      }

      const mean =
        histogram.reduce(
          (total, value, intensity) =>
            total + (
              value * intensity
            ),
          0
        ) / pixelCount;

      const variance =
        histogram.reduce(
          (total, value, intensity) =>
            total + (
              value *
              Math.pow(
                intensity - mean,
                2
              )
            ),
          0
        ) / pixelCount;

      return Math.sqrt(
        variance
      ).toFixed(2);

    };

  const updateStdDeviationFromHistogram =
    (histogram) => {

      setStdDeviation({
        original:
          calculateStdDeviation(
            histogram?.originalHistogram
          ),
        he:
          calculateStdDeviation(
            histogram?.heHistogram
          ),
        enhanced:
          calculateStdDeviation(
            histogram?.enhancedHistogram
          )
      });

    };

  useEffect(() => {

    const fetchData =
      async () => {

        try {

          const data =
            await getCaptures();

          setCaptures(data.captures);

        } catch (error) {

          console.log(
            error
          );

        }

      };

    fetchData();

  }, []);


  const handleDownloadImage =
    async (
      filename,
      prefix
    ) => {

      if (!filename) {
        return;
      }

      try {

        const response =
          await fetch(
            getProcessedImageUrl(
              filename
            )
          );

        if (!response.ok) {
          throw new Error(
            "Download failed"
          );
        }

        const blob =
          await response.blob();

        const objectUrl =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = objectUrl;
        link.download =
          getDownloadFileName(
            prefix,
            selectedCapture,
            filename
          );

        document.body.appendChild(
          link
        );

        link.click();
        link.remove();

        URL.revokeObjectURL(
          objectUrl
        );

      } catch (error) {

        console.log(
          error
        );

        window.alert(
          "Gagal mengunduh gambar"
        );

      }

    };
  const handleProcess =
    async () => {

      try {

        await processHistogram(
          selectedCapture._id
        );

        const data =
          await getCaptures();

        setCaptures(
          data.captures
        );

        const updatedCapture =
          data.captures.find(
            (item) =>
              item._id ===
              selectedCapture._id
          );

        setSelectedCapture(
          updatedCapture
        );

        const metricsData =
          await getMetrics(
            selectedCapture._id
          );

        setMetrics(
          metricsData
        );

        const histogram =
          await getHistogramData(
            selectedCapture._id
          );

        setHistogramData(
          histogram
        );

        updateStdDeviationFromHistogram(
          histogram
        );

        setImageVersion(
          Date.now()
        );

        alert(
          "Histogram Equalization Success"
        );

      } catch (error) {

        console.log(
          error
        );

        alert(
          "Histogram Equalization Failed"
        );

      }

    };

  const analyzeVideoFrame =
  () => {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    const heCanvas =
      heCanvasRef.current;

    const enhancedCanvas =
      enhancedCanvasRef.current;

    if (
      !video ||
      !canvas ||
      !heCanvas ||
      !enhancedCanvas ||
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    const ctx =
      canvas.getContext(
        "2d",
        {
          willReadFrequently:
            true
        }
      );

    const heCtx =
      heCanvas.getContext(
        "2d"
      );

    const enhancedCtx =
      enhancedCanvas.getContext(
        "2d"
      );

    const width =
      video.videoWidth;

    const height =
      video.videoHeight;

    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {

      canvas.width =
        width;

      canvas.height =
        height;

      heCanvas.width =
        width;

      heCanvas.height =
        height;

      enhancedCanvas.width =
        width;

      enhancedCanvas.height =
        height;

    }

    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    const imageData =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const pixels =
      imageData.data;

    const originalHistogramValues =
      Array(256).fill(0);

    const grayValues =
      new Uint8ClampedArray(
        width * height
      );

    for (
      let i = 0, pixelIndex = 0;
      i < pixels.length;
      i += 4, pixelIndex++
    ) {

      const gray =
        Math.round(
          (0.299 * pixels[i]) +
          (0.587 * pixels[i + 1]) +
          (0.114 * pixels[i + 2])
        );

      grayValues[
        pixelIndex
      ] =
        gray;

      originalHistogramValues[
        gray
      ]++;

    }

    const pixelCount =
      grayValues.length;

    let cdf = 0;

    let cdfMin = 0;

    const equalizationMap =
      Array(256).fill(0);

    for (
      let intensity = 0;
      intensity < 256;
      intensity++
    ) {

      cdf +=
        originalHistogramValues[
          intensity
        ];

      if (
        cdfMin === 0 &&
        cdf > 0
      ) {
        cdfMin = cdf;
      }

      const denominator =
        pixelCount - cdfMin;

      equalizationMap[
        intensity
      ] =
        denominator > 0
          ? Math.round(
            (
              (cdf - cdfMin) /
              denominator
            ) * 255
          )
          : intensity;

    }

    const heImageData =
      heCtx.createImageData(
        width,
        height
      );

    const enhancedImageData =
      enhancedCtx.createImageData(
        width,
        height
      );

    const heHistogramValues =
      Array(256).fill(0);

    const enhancedHistogramValues =
      Array(256).fill(0);

    for (
      let pixelIndex = 0;
      pixelIndex < pixelCount;
      pixelIndex++
    ) {

      const originalGray =
        grayValues[
          pixelIndex
        ];

      const heGray =
        equalizationMap[
          originalGray
        ];

      const enhancedGray =
        Math.max(
          0,
          Math.min(
            255,
            Math.round(
              (
                (heGray - 128) *
                1.2
              ) +
              136
            )
          )
        );

      const dataIndex =
        pixelIndex * 4;

      const luminanceScale =
        originalGray > 0
          ? enhancedGray /
            originalGray
          : 0;

      const enhancedRed =
        Math.min(
          255,
          Math.round(
            pixels[
              dataIndex
            ] *
            luminanceScale
          )
        );

      const enhancedGreen =
        Math.min(
          255,
          Math.round(
            pixels[
              dataIndex + 1
            ] *
            luminanceScale
          )
        );

      const enhancedBlue =
        Math.min(
          255,
          Math.round(
            pixels[
              dataIndex + 2
            ] *
            luminanceScale
          )
        );

      const enhancedLuminance =
        Math.round(
          (0.299 * enhancedRed) +
          (0.587 * enhancedGreen) +
          (0.114 * enhancedBlue)
        );

      heImageData.data[
        dataIndex
      ] =
        heGray;

      heImageData.data[
        dataIndex + 1
      ] =
        heGray;

      heImageData.data[
        dataIndex + 2
      ] =
        heGray;

      heImageData.data[
        dataIndex + 3
      ] =
        255;

      enhancedImageData.data[
        dataIndex
      ] =
        enhancedRed;

      enhancedImageData.data[
        dataIndex + 1
      ] =
        enhancedGreen;

      enhancedImageData.data[
        dataIndex + 2
      ] =
        enhancedBlue;

      enhancedImageData.data[
        dataIndex + 3
      ] =
        255;

      heHistogramValues[
        heGray
      ]++;

      enhancedHistogramValues[
        enhancedLuminance
      ]++;

    }

    heCtx.putImageData(
      heImageData,
      0,
      0
    );

    enhancedCtx.putImageData(
      enhancedImageData,
      0,
      0
    );

    const toHistogramData =
      histogram =>
        histogram.map(
        (value, index) => ({
          intensity: index,
          value
        })
      );

    updateStdDeviationFromHistogram({
      originalHistogram:
        originalHistogramValues,
      heHistogram:
        heHistogramValues,
      enhancedHistogram:
        enhancedHistogramValues
    });

    setOriginalHistogram(
      toHistogramData(
        originalHistogramValues
      )
    );

    setHeHistogramRealtime(
      toHistogramData(
        heHistogramValues
      )
    );

    setEnhancedHistogramRealtime(
      toHistogramData(
        enhancedHistogramValues
      )
    );

  };

  useEffect(() => {

  if (
    selectedCapture?.mediaType !==
    "video"
  ) {
    return;
  }

  const interval =
    setInterval(
      analyzeVideoFrame,
      100
    );

  return () =>
    clearInterval(
      interval
    );

}, [
  selectedCapture
]);

  return (

    <MainLayout>

      <div className="mb-8">

        <span className="page-kicker">
          AI Image Processing Lab
        </span>

        <h1 className="page-title">
          Histogram Equalization Analysis
        </h1>

        <p className="page-description">
          Analisis citra menggunakan Histogram Equalization
          dan peningkatan kualitas visual untuk monitoring satwa.
        </p>

      </div>

      <div
        className="
        mb-4
        grid
        w-full
        max-w-5xl
        grid-cols-1
        gap-4
        md:grid-cols-2
        "
      >

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Filter Perangkat
          <select
            value={selectedDeviceFilter}
            onChange={(event) => {
              setSelectedDeviceFilter(
                event.target.value
              );
              resetSelectedAnalysis();
            }}
            className="
            w-full
            rounded-xl
            border
            border-slate-300
            bg-white
            px-4
            py-3
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            "
          >
            <option value="">
              Semua perangkat
            </option>
            {
              deviceFilterOptions.map(
                ([
                  deviceId,
                  deviceName
                ]) => (
                  <option
                    key={deviceId}
                    value={deviceId}
                  >
                    {deviceName}
                  </option>
                )
              )
            }
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Filter Tanggal Capture
          <select
            value={selectedDateFilter}
            onChange={(event) => {
              setSelectedDateFilter(
                event.target.value
              );
              resetSelectedAnalysis();
            }}
            className="
            w-full
            rounded-xl
            border
            border-slate-300
            bg-white
            px-4
            py-3
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            "
          >
            <option value="">
              Semua tanggal
            </option>
            {
              dateFilterOptions.map(
                ([
                  dateKey,
                  dateLabel
                ]) => (
                  <option
                    key={dateKey}
                    value={dateKey}
                  >
                    {dateLabel}
                  </option>
                )
              )
            }
          </select>
        </label>

      </div>

      <select
        value={selectedCapture?._id || ""}
        className="
        w-full
        max-w-xl
        bg-white
        border
        border-slate-300
        rounded-xl
        px-4
        py-3
        mb-6
        shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-500
        "
        onChange={async (e) => {

          const capture =
            captures.find(
              (item) =>
                item._id ===
                e.target.value
            );

          setSelectedCapture(
            capture
          );

          if (
            capture?.processedImage
          ) {

            try {

              const metricsData =
                await getMetrics(
                  capture._id
                );

              setMetrics(
                metricsData
              );

              const histogram =
                await getHistogramData(
                  capture._id
                );

              setHistogramData(
                histogram
              );

              updateStdDeviationFromHistogram(
                histogram
              );

            } catch (error) {

              console.log(
                error
              );

              setMetrics(
                null
              );

              setHistogramData(
                null
              );

              setStdDeviation({
                original: 0,
                he: 0,
                enhanced: 0
              });

            }

          } else {

            setMetrics(
              null
            );

            setHistogramData(
              null
             );

            setStdDeviation({
              original: 0,
              he: 0,
              enhanced: 0
            });

          }

        }}
      >

        <option value="">
          Select Capture
        </option>

        {
          filteredCaptures.length === 0 && (
            <option disabled>
              Tidak ada capture sesuai filter
            </option>
          )
        }

        {
          filteredCaptures.map(
            (capture) => (

              <option
                key={
                  capture._id
                }
                value={
                  capture._id
                }
              >
                {
                  getDeviceDisplayName(
                    capture
                  )
                }
                {" - "}
                {
                  getCaptureDate(
                    capture
                  )
                }
              </option>

            )
          )
        }

      </select>

      {
        selectedCapture && (

          <>

            <div
              className="
              flex
              items-center
              gap-3
              mb-5
              "
            >

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {
                  getDeviceDisplayName(
                    selectedCapture
                  )
                }
              </h2>

              <span
                className={`
                px-2
                py-1
                rounded-full
                text-xs
                font-semibold
                border
                ${
                  selectedCapture.source ===
                    "esp32cam"
                    ? "border-blue-100 bg-blue-50 text-blue-700"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                }
                `}
              >
                {
                  selectedCapture.source ===
                    "esp32cam"
                    ? "ESP32-CAM"
                    : "WEBCAM"
                }
              </span>

            </div>

            <div
              className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-5
              "
            >

              <div
                className="
                bg-white
                  p-5
                  rounded-2xl
                  shadow-lg
                  border
                "
              >

                <h3
                  className="
                  font-bold
                  mb-3
                  "
                >
                  Original Image
                </h3>

                {
                  selectedCapture.mediaType ===
                  "video"
                  ? (

                    <>

                      <video
                        ref={videoRef}
                        crossOrigin="anonymous"
                        controls
                        autoPlay
                        muted
                        className="
                        w-full
                        rounded
                        "
                      >
                        <source
                          src={
                            `http://localhost:5000/uploads/original/${selectedCapture.originalImage}`
                          }
                        />
                      </video>

                      <canvas
                        ref={canvasRef}
                        style={{
                          display:
                            "none"
                        }}
                      />

                    </>

                  )
                  : (

                    <img
                      src={
                        `http://localhost:5000/uploads/original/${selectedCapture.originalImage}`
                      }
                      alt="original"
                      className="
                      w-full
                      rounded
                      "
                    />

                  )
                }

              </div>

              <div
                className="
                bg-white
                p-5
                rounded-2xl
                shadow-lg
                border
                "
              >

                <h3
                  className="
                  font-bold
                  mb-3
                  "
                >
                  Enhanced Image
                </h3>

                {
                  selectedCapture.mediaType ===
                  "video" ? (

                    <canvas
                      ref={enhancedCanvasRef}
                      className="
                      w-full
                      rounded
                      "
                    />

                  ) : (

                    selectedCapture.processedImage ? (

                      <>
                        <img
                          src={
                            `${getProcessedImageUrl(selectedCapture.processedImage)}?v=${imageVersion}`
                          }
                          alt="processed"
                          className="
                          w-full
                          rounded
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadImage(
                              selectedCapture.processedImage,
                              "enhanced"
                            )
                          }
                          className="
                          mt-4
                          flex
                          w-full
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-teal-200
                          bg-teal-50
                          px-4
                          py-3
                          text-sm
                          font-bold
                          text-teal-700
                          transition
                          hover:bg-teal-100
                          "
                        >
                          Download Enhanced Image
                        </button>
                      </>

                    ) : (

                      <div className="text-gray-500">
                        No Processed Image
                      </div>

                    )
                  )
                }

              </div>

              <div className="bg-white p-5 rounded-2xl shadow-lg border">

                <h3 className="font-bold mb-3">
                  HE Image
                </h3>

                {
                  selectedCapture.mediaType ===
                  "video" ? (

                    <canvas
                      ref={heCanvasRef}
                      className="
                      w-full
                      rounded
                      "
                    />

                  ) : (

                    selectedCapture.heImage ? (

                      <>
                        <img
                          src={
                            `${getProcessedImageUrl(selectedCapture.heImage)}?v=${imageVersion}`
                          }
                          alt="he"
                          className="
                          w-full
                          rounded
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadImage(
                              selectedCapture.heImage,
                              "he"
                            )
                          }
                          className="
                          mt-4
                          flex
                          w-full
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-teal-200
                          bg-teal-50
                          px-4
                          py-3
                          text-sm
                          font-bold
                          text-teal-700
                          transition
                          hover:bg-teal-100
                          "
                        >
                          Download HE Image
                        </button>
                      </>

                    ) : (

                      <div className="text-gray-500">
                        No HE Image
                      </div>

                    )
                  )
                }

              </div>

              {
                metrics && (

                  <div
                    className="
                    bg-white
                    p-5
                    rounded-2xl
                    shadow-lg
                    border
                    md:col-start-2
                    "
                  >
                    <h3 className="font-bold mb-3">
                      Metrik Hasil Enhanced Image
                    </h3>
                    {renderMetricSummary(getEnhancedMetrics(metrics))}
                  </div>

                )
              }

              {
                metrics &&
                getHeMetrics(metrics) && (

                  <div
                    className="
                    bg-white
                    p-5
                    rounded-2xl
                    shadow-lg
                    border
                    md:col-start-3
                    "
                  >
                    <h3 className="font-bold mb-3">
                      Metrik Hasil HE Image
                    </h3>
                    {renderMetricSummary(getHeMetrics(metrics))}
                  </div>

                )
              }
            </div>

            <button
              onClick={
                handleProcess
              }
              className="
              premium-button
              mt-6
              px-6
              py-3
              rounded-2xl
              font-bold
              transition-all
              "
            >
              Process Histogram
            </button>

            {
              metrics && (

                <div
                  className="
                  mt-6
                  bg-white
                  rounded-2xl
                  shadow-lg
                  border
                  p-6
                  "
                >

                  <h3
                    className="
                    text-xl
                    font-bold
                    mb-4
                    "
                  >
                    Interpretasi Hasil
                  </h3>


                  <div
                    className="
                    space-y-3
                    text-slate-700
                    "
                  >

                    {
                      renderInterpretationRow(
                        "MSE",
                        getMSEDescription(
                          Number(
                            getFinalMetrics(metrics).mse
                          )
                        )
                      )
                    }

                    {
                      renderInterpretationRow(
                        "PSNR",
                        getPSNRDescription(
                          Number(
                            getFinalMetrics(metrics).psnr
                          )
                        )
                      )
                    }

                    {
                      renderInterpretationRow(
                        "SSIM",
                        getSSIMDescription(
                          Number(
                            getFinalMetrics(metrics).ssim
                          )
                        )
                      )
                    }

                    {
                      renderInterpretationRow(
                        "Standard Deviation",
                        getStdDevDescription(
                          stdDeviation
                        )
                      )
                    }

                    {
                      renderInterpretationRow(
                        "Kesimpulan Analisis",
                        getConclusionDescription(
                          getFinalMetrics(metrics),
                          stdDeviation
                        )
                      )
                    }

                  </div>

                </div>

              )
            }


            {
              selectedCapture?.mediaType ===
                "video" && (

                <div
                  className="
                  mt-8
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-5
                  "
                >

                  {/* ORIGINAL */}

                  <div
                    className="
                    bg-white
                    p-5
                    rounded-2xl
                    shadow-lg
                    border
                    "
                  >

                    <h3
                      className="
                      font-bold
                      mb-2
                      "
                    >
                      Original Histogram
                    </h3>

                    <p
                      className="
                      mb-3
                      "
                    >
                      Std Dev:
                      {" "}
                      {stdDeviation.original}
                    </p>

                    <ResponsiveContainer
                      width="100%"
                      height={300}
                    >

                      <BarChart
                        data={originalHistogram}
                      >

                        <XAxis
                          dataKey="intensity"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                          dataKey="value"
                          fill="#3B82F6"
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                  {/* ENHANCED */}

                  <div
                    className="
                    bg-white
                    p-5
                    rounded-2xl
                    shadow-lg
                    border
                    "
                  >

                    <h3
                      className="
                      font-bold
                      mb-2
                      "
                    >
                      Enhanced Histogram
                    </h3>

                    <p
                      className="
                      mb-3
                      "
                    >
                      Std Dev:
                      {" "}
                      {stdDeviation.enhanced}
                    </p>

                    <ResponsiveContainer
                      width="100%"
                      height={300}
                    >

                      <BarChart
                        data={
                          enhancedHistogramRealtime
                        }
                      >

                        <XAxis
                          dataKey="intensity"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                          dataKey="value"
                          fill="#22C55E"
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                  {/* HE */}

                  <div
                    className="
                    bg-white
                    p-5
                    rounded-2xl
                    shadow-lg
                    border
                    "
                  >

                    <h3
                      className="
                      font-bold
                      mb-2
                      "
                    >
                      HE Histogram
                    </h3>

                    <p
                      className="
                      mb-3
                      "
                    >
                      Std Dev:
                      {" "}
                      {stdDeviation.he}
                    </p>

                    <ResponsiveContainer
                      width="100%"
                      height={300}
                    >

                      <BarChart
                        data={heHistogramRealtime}
                      >

                        <XAxis
                          dataKey="intensity"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                          dataKey="value"
                          fill="#F59E0B"
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              )
            }

            
            {
            histogramData && (

              <div
                className="
                mt-8
                grid
                grid-cols-1
                md:grid-cols-3
                gap-5
                "
              >

                <div
                  className="
                  bg-white
                    p-5
                    rounded-2xl
                    shadow-lg
                    border
                  "
                >

                  <h3
                    className="
                    font-bold
                    mb-2
                    "
                  >
                    Original Histogram
                  </h3>

                  <p
                    className="
                    mb-3
                    "
                  >
                    Std Dev:
                    {" "}
                    {stdDeviation.original}
                  </p>

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <BarChart
                      data={
                        histogramData.originalHistogram.map(
                          (
                            value,
                            index
                          ) => ({
                            intensity:
                              index,
                            value
                          })
                        )
                      }
                    >

                      <XAxis
                        dataKey="intensity"
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        fill="#3B82F6"
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

                {
                  histogramData.enhancedHistogram && (

                    <div
                      className="
                      bg-white
                      p-5
                      rounded-2xl
                      shadow-lg
                      border
                      "
                    >

                      <h3
                        className="
                        font-bold
                        mb-2
                        "
                      >
                        Enhanced Histogram
                      </h3>

                      <p
                        className="
                        mb-3
                        "
                      >
                        Std Dev:
                        {" "}
                        {stdDeviation.enhanced}
                      </p>

                      <ResponsiveContainer
                        width="100%"
                        height={300}
                      >

                        <BarChart
                          data={
                            histogramData.enhancedHistogram.map(
                              (
                                value,
                                index
                              ) => ({
                                intensity:
                                  index,
                                value
                              })
                            )
                          }
                        >

                          <XAxis
                            dataKey="intensity"
                          />

                          <YAxis />

                          <Tooltip />

                          <Bar
                            dataKey="value"
                            fill="#22C55E"
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  )
                }

                {
                  histogramData.heHistogram && (

                    <div
                      className="
                      bg-white
                        p-5
                        rounded-2xl
                        shadow-lg
                        border
                      "
                    >

                      <h3
                        className="
                        font-bold
                        mb-2
                        "
                      >
                        HE Histogram
                      </h3>

                      <p
                        className="
                        mb-3
                        "
                      >
                        Std Dev:
                        {" "}
                        {stdDeviation.he}
                      </p>

                      <ResponsiveContainer
                        width="100%"
                        height={300}
                      >

                        <BarChart
                          data={
                            histogramData.heHistogram.map(
                              (
                                value,
                                index
                              ) => ({
                                intensity:
                                  index,
                                value
                              })
                            )
                          }
                        >

                          <XAxis
                            dataKey="intensity"
                          />

                          <YAxis />

                          <Tooltip />

                          <Bar
                            dataKey="value"
                            fill="#F59E0B"
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  )
                }

              </div>

            )
          }

          </>

        )
      }

    </MainLayout>

  );

}

export default Analysis;






