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
          IoT Node Configuration
        </span>

        <h1 className="page-title">

          {
            id
              ? "Edit Device"
              : "Add Device"
          }

        </h1>

        <p className="page-description">

          {
            id
              ? "Perbarui informasi perangkat monitoring."
              : "Tambahkan perangkat monitoring baru ke dalam sistem."
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
              Device Name
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
              placeholder="Device Name"
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
              Device Code
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
              placeholder="Device Code"
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
              Device Status
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

              Save Device

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

              Cancel

            </button>

          </div>

        </form>

      </div>

    </MainLayout>

  );

}

export default DeviceForm;
