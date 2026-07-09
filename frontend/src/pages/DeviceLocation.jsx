import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

import {
  useEffect,
  useState
} from "react";

import MainLayout from "../layouts/MainLayout";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import {
  getDevices
} from "../services/deviceService";

function DeviceLocation() {

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
        "
      >

        <span className="page-kicker">
          Geospatial Operations
        </span>

        <h1 className="page-title">
          Device Location
        </h1>

        <p className="page-description">
          Monitoring lokasi perangkat
          ESP32-CAM pada area
          Taman Nasional Way Kambas.
        </p>

      </div>

      {/* SUMMARY CARD */}

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
        mb-6
        "
      >

        <div
          className="
          bg-white
          rounded-3xl
          p-6
          shadow-[0_18px_45px_rgba(15,118,110,0.08)]
          border
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_22px_55px_rgba(15,118,110,0.12)]
          "
        >

          <p
            className="
            text-slate-500
            text-sm
            "
          >
            Total Device
          </p>

          <h2
            className="
            text-4xl
            font-bold
            text-teal-700
            mt-2
            "
          >
            {totalDevice}
          </h2>

        </div>

        <div
          className="
          bg-white
          rounded-3xl
          p-6
          shadow-[0_18px_45px_rgba(15,118,110,0.08)]
          border
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_22px_55px_rgba(15,118,110,0.12)]
          "
        >

          <p
            className="
            text-slate-500
            text-sm
            "
          >
            Online Device
          </p>

          <h2
            className="
            text-4xl
            font-bold
            text-emerald-600
            mt-2
            "
          >
            {onlineDevice}
          </h2>

        </div>

        <div
          className="
          bg-white
          rounded-3xl
          p-6
          shadow-[0_18px_45px_rgba(15,118,110,0.08)]
          border
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_22px_55px_rgba(15,118,110,0.12)]
          "
        >

          <p
            className="
            text-slate-500
            text-sm
            "
          >
            Offline Device
          </p>

          <h2
            className="
            text-4xl
            font-bold
            text-orange-600
            mt-2
            "
          >
            {offlineDevice}
          </h2>

        </div>

      </div>

      {/* MAP */}

      <div
        className="
        bg-white
        rounded-3xl
        shadow-[0_18px_45px_rgba(15,118,110,0.08)]
        border
        overflow-hidden
        "
      >

        <div
          className="
          px-6
          py-4
          border-b
          "
        >

          <h3
            className="
            text-lg
            font-semibold
            "
          >
            Device Monitoring Map
          </h3>

        </div>

        <MapContainer
          center={[
            -5.12345,
            105.67890
          ]}
          zoom={8}
          style={{
            height: "650px",
            width: "100%"
          }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {
            devices.map(
              (
                device
              ) => (

                <Marker
                  key={
                    device._id
                  }
                  position={[
                    device.latitude,
                    device.longitude
                  ]}
                >

                  <Popup>

                    <div
                      className="
                      min-w-55
                      "
                    >

                      <h3
                        className="
                        font-bold
                        text-lg
                        mb-2
                        "
                      >
                        {
                          device.deviceName
                        }
                      </h3>

                      <div
                        className="
                        text-sm
                        space-y-1
                        "
                      >

                        <p>
                          <strong>
                            Code:
                          </strong>
                          {" "}
                          {
                            device.deviceCode
                          }
                        </p>

                        <p>
                          <strong>
                            Latitude:
                          </strong>
                          {" "}
                          {
                            device.latitude
                          }
                        </p>

                        <p>
                          <strong>
                            Longitude:
                          </strong>
                          {" "}
                          {
                            device.longitude
                          }
                        </p>

                        <p>

                          <strong>
                            Status:
                          </strong>

                          <span
                            className={`
                            ml-2
                            px-2
                            py-1
                            rounded-full
                            text-xs
                            font-medium

                            ${
                              device.status ===
                              "online"

                                ? `
                                bg-emerald-100
                                text-emerald-700
                                `

                                : `
                                bg-red-100
                                text-red-700
                                `
                            }
                            `}
                          >

                            {
                              device.status
                            }

                          </span>

                        </p>

                      </div>

                    </div>

                  </Popup>

                </Marker>

              )
            )
          }

        </MapContainer>

      </div>

    </MainLayout>

  );

}

export default DeviceLocation;
