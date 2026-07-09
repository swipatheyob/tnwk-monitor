import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  FaEdit,
  FaMapMarkerAlt,
  FaMicrochip,
  FaPlus,
  FaSignal,
  FaTrash
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";

import {
  deleteDevice,
  getDevices
} from "../services/deviceService";

function DeviceList() {

  const [
    devices,
    setDevices
  ] = useState([]);

  useEffect(() => {

    const loadDevices =
      async () => {

        try {

          const data =
            await getDevices();

          setDevices(
            data
          );

        } catch (error) {

          console.log(
            error
          );

        }

      };

    loadDevices();

  }, []);

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Yakin ingin menghapus device?"
        );

      if (!confirmDelete)
        return;

      try {

        await deleteDevice(
          id
        );

        const data =
          await getDevices();

        setDevices(
          data
        );

      } catch (error) {

        console.log(
          error
        );

      }

    };

  const totalDevice =
    devices.length;

  const onlineDevice =
    devices.filter(
      device =>
        device.status ===
        "online"
    ).length;

  const offlineDevice =
    devices.filter(
      device =>
        device.status ===
        "offline"
    ).length;

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
          <span className="page-kicker">
            IoT Fleet Control
          </span>
          <h1 className="page-title">
            Device Management
          </h1>
          <p className="page-description">
            Kelola node monitoring satwa, konektivitas,
            dan koordinat penempatan perangkat lapangan.
          </p>
        </div>

        <Link
          to="/devices/add"
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
          <FaPlus />
          Register Device
        </Link>

      </div>

      <div
        className="
        mb-6
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-3
        "
      >

        {
          [
            ["Total Fleet", totalDevice, "text-teal-700", "bg-teal-50 border-teal-100"],
            ["Online Nodes", onlineDevice, "text-emerald-700", "bg-emerald-50 border-emerald-100"],
            ["Offline Nodes", offlineDevice, "text-orange-700", "bg-orange-50 border-orange-100"]
          ].map(
            ([label, value, color, surface]) => (

              <div
                key={label}
                className={`
                rounded-3xl
                border
                p-5
                backdrop-blur-xl
                ${surface}
                `}
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </p>
                <p className={`mt-2 text-3xl font-black ${color}`}>
                  {value}
                </p>
              </div>

            )
          )
        }

      </div>

      {
        devices.length > 0 ? (

          <div
            className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            2xl:grid-cols-3
            "
          >

            {
              devices.map(
                (
                  device
                ) => {

                  const isOnline =
                    device.status ===
                    "online";

                  return (

                    <article
                      key={device._id}
                      className="
                      group
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      p-6
                      shadow-[0_18px_45px_rgba(15,118,110,.08)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[0_24px_55px_rgba(15,118,110,.13)]
                      "
                    >

                      <div
                        className={`
                        absolute
                        -right-12
                        -top-12
                        h-36
                        w-36
                        rounded-full
                        blur-3xl
                        ${
                          isOnline
                            ? "bg-emerald-200/45"
                            : "bg-orange-200/45"
                        }
                        `}
                      />

                      <div
                        className="
                        relative
                        flex
                        items-start
                        justify-between
                        gap-4
                        "
                      >

                        <div
                          className="
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          border-teal-100
                          bg-teal-50
                          text-xl
                          text-teal-700
                          "
                        >
                          <FaMicrochip />
                        </div>

                        <span
                          className={`
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          px-3
                          py-1.5
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          ${
                            isOnline
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-orange-100 bg-orange-50 text-orange-700"
                          }
                          `}
                        >
                          <span className={isOnline ? "status-dot" : "h-2 w-2 rounded-full bg-orange-400"} />
                          {device.status}
                        </span>

                      </div>

                      <h2 className="relative mt-5 text-xl font-bold text-slate-900">
                        {device.deviceName}
                      </h2>

                      <p className="relative mt-1 font-mono text-xs text-teal-700">
                        {device.deviceCode}
                      </p>

                      <div
                        className="
                        relative
                        mt-5
                        grid
                        grid-cols-2
                        gap-3
                        "
                      >

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <FaMapMarkerAlt className="text-teal-600" />
                            Latitude
                          </div>
                          <p className="mt-2 truncate font-mono text-sm text-slate-800">
                            {device.latitude}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <FaSignal className="text-emerald-400" />
                            Longitude
                          </div>
                          <p className="mt-2 truncate font-mono text-sm text-slate-800">
                            {device.longitude}
                          </p>
                        </div>

                      </div>

                      <div
                        className="
                        relative
                        mt-5
                        flex
                        gap-3
                        border-t
                        border-slate-200
                        pt-5
                        "
                      >

                        <Link
                          to={`/devices/edit/${device._id}`}
                          className="
                          flex
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-teal-100
                          bg-teal-50
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-teal-700
                          transition
                          hover:bg-teal-100
                          "
                        >
                          <FaEdit />
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(
                              device._id
                            )
                          }
                          className="
                          flex
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-rose-100
                          bg-rose-50
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-rose-600
                          transition
                          hover:bg-rose-100
                          "
                        >
                          <FaTrash />
                          Delete
                        </button>

                      </div>

                    </article>

                  );

                }
              )
            }

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
            <FaMicrochip className="mx-auto text-4xl text-slate-600" />
            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Belum ada device terdaftar
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Register perangkat pertama untuk memulai monitoring.
            </p>
          </div>

        )
      }

    </MainLayout>

  );

}

export default DeviceList;
