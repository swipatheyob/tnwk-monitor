import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import MainLayout
  from "../layouts/MainLayout";

import {
  getCaptureById
} from "../services/captureService";

import {
  getCaptureDate,
  getDeviceDisplayName
} from "../utils/captureHelper";

function CaptureDetail() {

  const {
    id
  } = useParams();

  const [
    capture,
    setCapture
  ] = useState(null);

  const [
    error,
    setError
  ] = useState("");

  useEffect(() => {

    const loadCapture =
      async () => {

        try {

          const data =
            await getCaptureById(
              id
            );

          setCapture(
            data
          );

        } catch (requestError) {

          console.log(
            requestError
          );

          setError(
            "Capture tidak ditemukan"
          );

        }

      };

    loadCapture();

  }, [id]);

  const isEsp32Cam =
    capture?.source ===
    "esp32cam";

  const isVideo =
    capture?.mediaType ===
    "video";

  const mediaUrl =
    capture
      ? `http://localhost:5000/uploads/original/${capture.originalImage}`
      : "";

  return (

    <MainLayout>

      {/* BACK BUTTON */}

      <Link
        to="/captures"
        className="
        inline-flex
        items-center
        mb-6
        px-4
        py-2
        bg-white
        border
        rounded-xl
        shadow-sm
        hover:bg-slate-50
        transition
        "
      >
        ← Back to Gallery
      </Link>

      {
        error ? (

          <div
            className="
            bg-red-100
            text-red-700
            p-4
            rounded-xl
            "
          >
            {error}
          </div>

        ) : capture && (

          <div
            className="
            space-y-6
            "
          >

            {/* HEADER */}

            <div>

              <span className="page-kicker">
                Media Intelligence Viewer
              </span>

              <h1 className="page-title">
                Capture Detail
              </h1>

              <p className="page-description">
                Detail hasil tangkapan media
                perangkat monitoring satwa.
              </p>

            </div>

            {/* MEDIA */}

            <div
              className="
              bg-white
              rounded-2xl
              shadow-lg
              border
              overflow-hidden
              "
            >

              {
                isVideo ? (

                  <video
                    controls
                    className="
                    w-full
                    max-h-[75vh]
                    bg-black
                    "
                  >

                    <source
                      src={
                        mediaUrl
                      }
                      type="video/mp4"
                    />

                    Browser Anda tidak
                    mendukung video.

                  </video>

                ) : (

                  <img
                    src={
                      mediaUrl
                    }
                    alt={
                      getDeviceDisplayName(
                        capture
                      )
                    }
                    className="
                    w-full
                    max-h-[75vh]
                    object-contain
                    bg-black
                    "
                  />

                )
              }

            </div>

            {/* INFO */}

            <div
              className="
              bg-white
              rounded-2xl
              shadow-lg
              border
              p-6
              "
            >

              <div
                className="
                flex
                justify-between
                items-start
                flex-wrap
                gap-4
                "
              >

                <div>

                  <h2
                    className="
                    text-2xl
                    font-bold
                    text-slate-800
                    "
                  >
                    {
                      getDeviceDisplayName(
                        capture
                      )
                    }
                  </h2>

                  <p
                    className="
                    text-slate-500
                    mt-2
                    "
                  >
                    Capture ID:
                    {" "}
                    {capture._id}
                  </p>

                </div>

                <span
                  className={`
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  border

                  ${
                    isEsp32Cam
                      ? "border-blue-100 bg-blue-50 text-blue-700"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                  }
                  `}
                >

                  {
                    isEsp32Cam
                      ? "ESP32-CAM"
                      : "WEBCAM"
                  }

                </span>

              </div>

              <div
                className="
                mt-6
                grid
                grid-cols-1
                md:grid-cols-3
                gap-5
                "
              >

                <div
                  className="
                  bg-slate-50
                  rounded-xl
                  p-4
                  "
                >

                  <p
                    className="
                    text-sm
                    text-slate-500
                    "
                  >
                    Capture Date
                  </p>

                  <h3
                    className="
                    font-semibold
                    mt-1
                    "
                  >
                    {
                      getCaptureDate(
                        capture
                      )
                    }
                  </h3>

                </div>

                <div
                  className="
                  bg-slate-50
                  rounded-xl
                  p-4
                  "
                >

                  <p
                    className="
                    text-sm
                    text-slate-500
                    "
                  >
                    Source
                  </p>

                  <h3
                    className="
                    font-semibold
                    mt-1
                    "
                  >
                    {
                      isEsp32Cam
                        ? "ESP32-CAM"
                        : "Webcam Simulator"
                    }
                  </h3>

                </div>

                <div
                  className="
                  bg-slate-50
                  rounded-xl
                  p-4
                  "
                >

                  <p
                    className="
                    text-sm
                    text-slate-500
                    "
                  >
                    Media Type
                  </p>

                  <h3
                    className="
                    font-semibold
                    mt-1
                    "
                  >
                    {
                      isVideo
                        ? "Video"
                        : "Image"
                    }
                  </h3>

                </div>

              </div>

            </div>

          </div>

        )
      }

    </MainLayout>

  );

}

export default CaptureDetail;
