import {useEffect, useState} from "react";

import {Link} from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCamera,
  FaEye,
  FaImage,
  FaTrash,
  FaVideo,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";

import {deleteCapture, getCaptures} from "../services/captureService";

import {getDevices} from "../services/deviceService";

import {getCaptureDate, getDeviceDisplayName} from "../utils/captureHelper";
import {BACKEND_BASE_URL} from "../config/apiConfig";

const ITEMS_PER_PAGE = 12;

function Capture() {
  const [captures, setCaptures] = useState([]);

  const [devices, setDevices] = useState([]);

  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const [deletingCaptureId, setDeletingCaptureId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadCaptures = async () => {
      try {
        const data = await getCaptures();

        setCaptures(data.captures);
      } catch (error) {
        console.log(error);
      }
    };

    const loadDevices = async () => {
      try {
        const data = await getDevices();

        setDevices(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadCaptures();
    loadDevices();

    const interval = setInterval(loadCaptures, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredCaptures = selectedDeviceId
    ? captures.filter((capture) => {
        const captureDeviceId = capture?.deviceId?._id || capture?.deviceId;

        return captureDeviceId === selectedDeviceId;
      })
    : captures;

  const totalItems = filteredCaptures.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const activePage = Math.min(currentPage, totalPages);

  const indexOfLastItem = activePage * ITEMS_PER_PAGE;

  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentItems = filteredCaptures.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const showingStart = totalItems === 0 ? 0 : indexOfFirstItem + 1;

  const showingEnd = Math.min(indexOfLastItem, totalItems);

  const pageNumbers = Array.from(
    {
      length: totalPages,
    },
    (_, index) => index + 1,
  );

  const handleDeviceFilterChange = (event) => {
    setSelectedDeviceId(event.target.value);

    setCurrentPage(1);
  };

  const handleDeleteCapture = async (capture) => {
    const confirmed = window.confirm(
      `Hapus capture dari ${getDeviceDisplayName(capture)}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCaptureId(capture._id);

      await deleteCapture(capture._id);

      setCaptures((previousCaptures) =>
        previousCaptures.filter((item) => item._id !== capture._id),
      );
    } catch (error) {
      console.log(error);

      window.alert("Gagal menghapus capture");
    } finally {
      setDeletingCaptureId("");
    }
  };

  return (
    <MainLayout>
      <div
        className="
        mb-8
        flex
        flex-col
        justify-between
        gap-5
        lg:flex-row
        lg:items-end
        "
      >
        <div>
          <span className="page-kicker">Visual Intelligence Archive</span>
          <h1 className="page-title">Capture Gallery</h1>
          <p className="page-description">
            Arsip media lapangan dari ESP32-CAM dan Webcam Simulator, diperbarui
            secara otomatis setiap lima detik.
          </p>
        </div>

        <div
          className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          "
        >
          <label
            className="
            flex
            flex-col
            gap-2
            text-xs
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-500
            "
          >
            Filter perangkat
            <select
              value={selectedDeviceId}
              onChange={handleDeviceFilterChange}
              className="
              min-w-56
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              normal-case
              tracking-normal
              text-slate-700
              outline-none
              transition
              focus:border-teal-400
              focus:ring-4
              focus:ring-teal-100
              "
            >
              <option value="">Semua perangkat</option>
              {devices.map((device) => (
                <option key={device._id} value={device._id}>
                  {device.deviceName}
                </option>
              ))}
            </select>
          </label>

          <Link
            to="/upload-capture"
            className="
            premium-button
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            px-5
            py-3
            text-sm
            font-bold
            transition-all
            "
          >
            <FaCamera />
            New Capture
          </Link>
        </div>
      </div>

      {currentItems.length > 0 ? (
        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            2xl:grid-cols-3
            "
        >
          {currentItems.map((capture) => {
            const isEsp32Cam = capture.source === "esp32cam";

            const isVideo = capture.mediaType === "video";

            const isDeleting = deletingCaptureId === capture._id;

            const mediaUrl = `${BACKEND_BASE_URL}/uploads/original/${capture.originalImage}`;

            return (
              <article
                key={capture._id}
                className="
                      group
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      shadow-[0_18px_45px_rgba(15,118,110,.08)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[0_24px_55px_rgba(15,118,110,.13)]
                      "
              >
                <div
                  className="
                        relative
                        h-72
                        overflow-hidden
                        bg-slate-950
                        "
                >
                  {isVideo ? (
                    <video
                      controls
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    >
                      <source src={mediaUrl} />
                    </video>
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={getDeviceDisplayName(capture)}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                  )}

                  <div
                    className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-linear-to-t
                          from-slate-950/80
                          via-transparent
                          to-transparent
                          opacity-70
                          "
                  />

                  <div
                    className="
                          absolute
                          left-4
                          top-4
                          flex
                          gap-2
                          "
                  >
                    <span
                      className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-white/70
                            bg-white/85
                            px-3
                            py-1.5
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-800
                            backdrop-blur-xl
                            "
                    >
                      {isVideo ? (
                        <FaVideo className="text-blue-600" />
                      ) : (
                        <FaImage className="text-teal-600" />
                      )}
                      {isVideo ? "Video" : "Image"}
                    </span>

                    <span
                      className={`
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            backdrop-blur-xl
                            ${
                              isEsp32Cam
                                ? "border-blue-100 bg-blue-50 text-blue-700"
                                : "border-emerald-100 bg-emerald-50 text-emerald-700"
                            }
                            `}
                    >
                      {isEsp32Cam ? "ESP32-CAM" : "Webcam"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                    Monitoring Capture
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {getDeviceDisplayName(capture)}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {getCaptureDate(capture)}
                  </p>

                  <div
                    className="
                          mt-5
                          grid
                          grid-cols-1
                          gap-3
                          sm:grid-cols-[1fr_auto]
                          "
                  >
                    <Link
                      to={`/captures/${capture._id}`}
                      className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-teal-100
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
                      <FaEye />
                      Open Media Intelligence
                    </Link>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDeleteCapture(capture)}
                      className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-red-100
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            font-bold
                            text-red-700
                            transition
                            hover:bg-red-100
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            "
                    >
                      <FaTrash />
                      {isDeleting ? "Deleting" : "Hapus"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          className="
            rounded-3xl
            border
            border-dashed
            border-slate-300
            bg-white/80
            p-16
            text-center
            "
        >
          <FaCamera className="mx-auto text-4xl text-slate-600" />
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            {captures.length > 0
              ? "Tidak ada capture untuk perangkat ini"
              : "Belum ada capture"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {captures.length > 0
              ? "Pilih perangkat lain atau tampilkan semua perangkat."
              : "Media baru akan tampil otomatis pada galeri."}
          </p>
        </div>
      )}

      {currentItems.length > 0 && (
        <div
          className="
            mt-10
            flex
            flex-col
            items-center
            justify-between
            gap-5
            rounded-3xl
            border
            border-slate-200
            bg-white/85
            p-4
            shadow-[0_18px_45px_rgba(15,118,110,.08)]
            sm:flex-row
            "
        >
          <p className="text-sm font-semibold text-slate-500">
            Showing {showingStart}&ndash;{showingEnd} of {totalItems} captures
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
              "
          >
            <button
              disabled={activePage === 1}
              onClick={() => setCurrentPage(Math.max(activePage - 1, 1))}
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:border-teal-200
                hover:text-teal-700
                disabled:cursor-not-allowed
                disabled:opacity-35
                "
            >
              <FaArrowLeft />
              Previous
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`
                      min-w-12
                      rounded-2xl
                      border
                      px-4
                      py-3
                      text-sm
                      font-bold
                      transition
                      ${
                        activePage === pageNumber
                          ? "border-teal-600 bg-teal-600 text-white shadow-[0_12px_25px_rgba(13,148,136,.28)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700"
                      }
                      `}
              >
                {pageNumber}
              </button>
            ))}

            <button
              disabled={activePage === totalPages}
              onClick={() =>
                setCurrentPage(Math.min(activePage + 1, totalPages))
              }
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:border-teal-200
                hover:text-teal-700
                disabled:cursor-not-allowed
                disabled:opacity-35
                "
            >
              Next
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Capture;
