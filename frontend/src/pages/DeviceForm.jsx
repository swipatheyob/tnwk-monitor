import {
  useState,
  useEffect
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  createDevice,
  updateDevice,
  getDeviceById
} from "../services/deviceService";

function DeviceForm() {

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const [
    formData,
    setFormData
  ] = useState({
    deviceName: "",
    deviceCode: "",
    macAddress: "",
    latitude: "",
    longitude: "",
    status: "offline"
  });

  useEffect(() => {

    if (id) {

      const fetchDevice =
        async () => {

          try {

            const data =
              await getDeviceById(
                id
              );

            setFormData(
              data
            );

          } catch (error) {

            console.log(
              error
            );

          }

        };

      fetchDevice();

    }

  }, [id]);

  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value

      });

    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        if (id) {

          await updateDevice(
            id,
            formData
          );

        } else {

          await createDevice(
            formData
          );

        }

        navigate(
          "/devices"
        );

      } catch (error) {

        console.log(
          error
        );

      }

    };

  return (

    <MainLayout>

      {/* HEADER */}

      <div
        className="
        mb-8
        "
      >

        <span className="page-kicker">
          Alur 1 · Konfigurasi Kamera
        </span>

        <h1 className="page-title">

          {
            id
              ? "Ubah Kamera"
              : "Daftarkan Kamera"
          }

        </h1>

        <p className="page-description">

          {
            id
              ? "Perbarui identitas, lokasi, dan konektivitas kamera lapangan."
              : "Tambahkan kamera baru agar dapat mengirim data ke sistem."
          }

        </p>

      </div>

      {/* FORM CARD */}

      <div
        className="
        bg-white
        rounded-2xl
        shadow-lg
        border
        border-slate-200
        p-8
        max-w-4xl
        "
      >

        <form
          onSubmit={
            handleSubmit
          }
          className="
          space-y-5
          "
        >

          {/* DEVICE NAME */}

          <div>

            <label
              className="
              block
              text-sm
              font-medium
              text-slate-700
              mb-2
              "
            >
              Nama Kamera
            </label>

            <input
              type="text"
              name="deviceName"
              value={
                formData.deviceName
              }
              onChange={
                handleChange
              }
              placeholder="Contoh: Kamera Blok A-01"
              className="
              w-full
              px-4
              py-3
              border
              border-slate-300
              rounded-xl
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              "
              required
            />

          </div>

          {/* DEVICE CODE */}

          <div>

            <label
              className="
              block
              text-sm
              font-medium
              text-slate-700
              mb-2
              "
            >
              Kode Kamera
            </label>

            <input
              type="text"
              name="deviceCode"
              value={
                formData.deviceCode
              }
              onChange={
                handleChange
              }
              placeholder="Contoh: TNWK-CAM-001"
              className="
              w-full
              px-4
              py-3
              border
              border-slate-300
              rounded-xl
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              "
              required
            />

          </div>

          {/* CAMERA MAC ADDRESS */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              MAC Address Kamera <span className="text-slate-400">(untuk live stream)</span>
            </label>

            <input
              type="text"
              name="macAddress"
              value={formData.macAddress || ""}
              onChange={handleChange}
              placeholder="Contoh: A4:F0:0F:74:EC:20"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <p className="mt-2 text-xs text-slate-500">Isi MAC address ESP32-CAM agar kamera ini dapat tampil pada pusat pantau multi-kamera.</p>

          </div>

          {/* LATITUDE */}

          <div>

            <label
              className="
              block
              text-sm
              font-medium
              text-slate-700
              mb-2
              "
            >
              Latitude
            </label>

            <input
              type="number"
              step="any"
              name="latitude"
              value={
                formData.latitude
              }
              onChange={
                handleChange
              }
              placeholder="Latitude"
              className="
              w-full
              px-4
              py-3
              border
              border-slate-300
              rounded-xl
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              "
              required
            />

          </div>

          {/* LONGITUDE */}

          <div>

            <label
              className="
              block
              text-sm
              font-medium
              text-slate-700
              mb-2
              "
            >
              Longitude
            </label>

            <input
              type="number"
              step="any"
              name="longitude"
              value={
                formData.longitude
              }
              onChange={
                handleChange
              }
              placeholder="Longitude"
              className="
              w-full
              px-4
              py-3
              border
              border-slate-300
              rounded-xl
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              "
              required
            />

          </div>

          {/* STATUS */}

          <div>

            <label
              className="
              block
              text-sm
              font-medium
              text-slate-700
              mb-2
              "
            >
              Status Kamera
            </label>

            <select
              name="status"
              value={
                formData.status
              }
              onChange={
                handleChange
              }
              className="
              w-full
              px-4
              py-3
              border
              border-slate-300
              rounded-xl
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              "
            >

              <option value="online">
                Online
              </option>

              <option value="offline">
                Offline
              </option>

            </select>

          </div>

          {/* BUTTONS */}

          <div
            className="
            flex
            gap-3
            pt-4
            "
          >

            <button
              type="submit"
              className="
              premium-button
              px-6
              py-3
              rounded-2xl
              font-bold
              transition-all
              "
            >

              Simpan Kamera

            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/devices"
                )
              }
              className="
              bg-slate-200
              hover:bg-slate-300
              text-slate-700
              px-6
              py-3
              rounded-xl
              font-medium
              transition
              "
            >

              Batal

            </button>

          </div>

        </form>

      </div>

    </MainLayout>

  );

}

export default DeviceForm;
