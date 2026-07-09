import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaCloudUploadAlt,
  FaEye,
  FaShieldAlt
} from "react-icons/fa";

import MainLayout
  from "../layouts/MainLayout";

import {
  getDevices
} from "../services/deviceService";

import {
  uploadCaptureFile
} from "../services/uploadCaptureService";

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "mp4",
  "mov",
  "avi"
];

const MIME_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/avi"
};

const MAX_FILE_SIZE =
  100 * 1024 * 1024;

const getFileExtension =
  (fileName = "") =>
    fileName
      .split(".")
      .pop()
      .toLowerCase();

function UploadCapture() {

  const navigate =
    useNavigate();

  const [
    devices,
    setDevices
  ] = useState([]);

  const [
    deviceId,
    setDeviceId
  ] = useState("");

  const [
    source,
    setSource
  ] = useState("webcam");

  const [
    file,
    setFile
  ] = useState(null);

  const [
    previewUrl,
    setPreviewUrl
  ] = useState("");

  const [
    loadingDevices,
    setLoadingDevices
  ] = useState(true);

  const [
    uploading,
    setUploading
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage
  ] = useState("");

  useEffect(() => {

    const loadDevices =
      async () => {

        try {

          const data =
            await getDevices();

          setDevices(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (error) {

          setErrorMessage(
            error.response?.data?.message ||
            "Device gagal dimuat"
          );

        } finally {

          setLoadingDevices(
            false
          );

        }

      };

    loadDevices();

  }, []);

  useEffect(() => {

    return () => {

      if (previewUrl) {

        URL.revokeObjectURL(
          previewUrl
        );

      }

    };

  }, [previewUrl]);

  const handleFileChange =
    (event) => {

      const selectedFile =
        event.target.files?.[0];

      setErrorMessage("");

      if (!selectedFile) {

        setFile(null);
        setPreviewUrl("");
        return;

      }

      const extension =
        getFileExtension(
          selectedFile.name
        );

      if (
        !ALLOWED_EXTENSIONS.includes(
          extension
        )
      ) {

        event.target.value = "";
        setFile(null);
        setPreviewUrl("");
        setErrorMessage(
          "Format file tidak didukung. Gunakan JPG, JPEG, PNG, MP4, MOV, atau AVI."
        );
        return;

      }

      if (
        selectedFile.size >
        MAX_FILE_SIZE
      ) {

        event.target.value = "";
        setFile(null);
        setPreviewUrl("");
        setErrorMessage(
          "Ukuran file maksimal 100 MB."
        );
        return;

      }

      setFile(
        selectedFile
      );

      setPreviewUrl(
        URL.createObjectURL(
          selectedFile
        )
      );

    };

  const handleSubmit =
    async (event) => {

      event.preventDefault();
      setErrorMessage("");

      if (
        !deviceId ||
        !source ||
        !file
      ) {

        setErrorMessage(
          "Device, source, dan file wajib diisi."
        );
        return;

      }

      const formData =
        new FormData();

      formData.append(
        "deviceId",
        deviceId
      );

      formData.append(
        "source",
        source
      );

      formData.append(
        "image",
        new File(
          [file],
          file.name,
          {
            type:
              MIME_TYPES[
                getFileExtension(
                  file.name
                )
              ]
          }
        )
      );

      try {

        setUploading(
          true
        );

        await uploadCaptureFile(
          formData
        );

        window.alert(
          "Capture berhasil diupload"
        );

        navigate(
          "/captures"
        );

      } catch (error) {

        setErrorMessage(
          error.response?.data?.message ||
          "Capture gagal diupload"
        );

      } finally {

        setUploading(
          false
        );

      }

    };

  const isVideo =
    file?.type.startsWith(
      "video/"
    ) ||
    ["mp4", "mov", "avi"].includes(
      getFileExtension(
        file?.name
      )
    );

  return (

    <MainLayout>

      <div className="mb-8">

        <span className="page-kicker">
          Secure Media Ingestion
        </span>

        <h1 className="page-title">
          Upload Capture
        </h1>

        <p className="page-description">
          Upload gambar atau video
          dari Webcam dan ESP32-CAM
          langsung ke sistem.
        </p>

      </div>

      <div
        className="
        bg-white
        rounded-3xl
        border
        border-slate-200
        p-7
        max-w-5xl
        shadow-[0_18px_45px_rgba(15,118,110,0.08)]
        "
      >

        <div
          className="
          mb-7
          flex
          flex-col
          justify-between
          gap-4
          border-b
          border-slate-200
          pb-6
          sm:flex-row
          sm:items-center
          "
        >

          <div className="flex items-center gap-4">
            <div
              className="
              flex
              h-13
              w-13
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
              <FaCloudUploadAlt />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Capture Upload Terminal
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Encrypted transfer to original media storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <FaShieldAlt />
            Protected endpoint
          </div>

        </div>

        {
          errorMessage && (

            <div
              className="
              mb-6
              rounded-xl
              bg-red-50
              border
              border-red-200
              px-4
              py-3
              text-red-700
              "
            >
              {errorMessage}
            </div>

          )
        }

        <form
          onSubmit={
            handleSubmit
          }
          className="
          space-y-6
          "
        >

          <div>

            <label
              htmlFor="deviceId"
              className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
              "
            >
              Device
            </label>

            <select
              id="deviceId"
              value={deviceId}
              onChange={
                (event) =>
                  setDeviceId(
                    event.target.value
                  )
              }
              disabled={
                loadingDevices ||
                uploading
              }
              required
              className="
              w-full
              border
              border-slate-300
              rounded-xl
              px-4
              py-3
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              disabled:bg-slate-100
              "
            >

              <option value="">
                {
                  loadingDevices
                    ? "Memuat device..."
                    : "Pilih device"
                }
              </option>

              {
                devices.map(
                  (
                    device
                  ) => (

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
                      {
                        device.deviceCode
                          ? ` (${device.deviceCode})`
                          : ""
                      }
                    </option>

                  )
                )
              }

            </select>

          </div>

          <div>

            <label
              htmlFor="source"
              className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
              "
            >
              Source
            </label>

            <select
              id="source"
              value={source}
              onChange={
                (event) =>
                  setSource(
                    event.target.value
                  )
              }
              disabled={uploading}
              required
              className="
              w-full
              border
              border-slate-300
              rounded-xl
              px-4
              py-3
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              disabled:bg-slate-100
              "
            >

              <option value="webcam">
                Webcam
              </option>

              <option value="esp32cam">
                ESP32-CAM
              </option>

            </select>

          </div>

          <div>

            <label
              htmlFor="captureFile"
              className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
              "
            >
              File Upload
            </label>

            <div
              className="
              group
              relative
              flex
              min-h-52
              flex-col
              items-center
              justify-center
              overflow-hidden
              border
              border-dashed
              border-teal-200
              rounded-3xl
              bg-gradient-to-br
              from-teal-50
              via-white
              to-cyan-50
              p-6
              text-center
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-teal-400
              hover:shadow-[0_18px_40px_rgba(15,118,110,0.12)]
              "
            >
              <FaCloudUploadAlt className="mb-4 text-5xl text-teal-600 transition-transform duration-300 group-hover:-translate-y-1" />
              <p className="text-base font-bold text-slate-900">
                Drag & drop file capture di sini
              </p>
              <p className="mt-2 text-sm text-slate-500">
                atau klik area ini untuk memilih file dari perangkat
              </p>
              <span
                className="
                mt-5
                inline-flex
                rounded-2xl
                bg-teal-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-[0_12px_26px_rgba(15,118,110,0.18)]
                "
              >
                Pilih File
              </span>
              <input
                id="captureFile"
                type="file"
                accept=".jpg,.jpeg,.png,.mp4,.mov,.avi,image/jpeg,image/png,video/mp4,video/quicktime,video/x-msvideo"
                onChange={
                  handleFileChange
                }
                disabled={uploading}
                required
                className="
                absolute
                inset-0
                h-full
                w-full
                cursor-pointer
                opacity-0
                disabled:cursor-not-allowed
                "
              />
            </div>

            <p
              className="
              mt-2
              text-xs
              text-slate-500
              "
            >
              Drag & drop atau pilih file.
              {" "}
              Format: JPG, JPEG, PNG,
              MP4, MOV, AVI. Maksimal 100 MB.
            </p>

          </div>

          {
            previewUrl && (

              <div>

                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-700">
                  <FaEye />
                  Live Preview
                </p>

                <div
                  className="
                  rounded-3xl
                  overflow-hidden
                  border
                  border-slate-200
                  bg-slate-950
                  shadow-[0_18px_45px_rgba(15,118,110,0.10)]
                  "
                >

                  {
                    isVideo ? (

                      <video
                        src={previewUrl}
                        controls
                        className="
                        w-full
                        max-h-96
                        object-contain
                        "
                      />

                    ) : (

                      <img
                        src={previewUrl}
                        alt="Preview capture"
                        className="
                        w-full
                        max-h-96
                        object-contain
                        "
                      />

                    )
                  }

                </div>

                <p
                  className="
                  mt-2
                  text-sm
                  text-slate-500
                  break-all
                  "
                >
                  {file.name}
                </p>

              </div>

            )
          }

          <div
            className="
            flex
            justify-end
            "
          >

            <button
              type="submit"
              disabled={
                uploading ||
                loadingDevices
              }
              className="
              premium-button
              px-6
              py-3
              rounded-2xl
              font-bold
              transition-all
              disabled:opacity-60
              disabled:cursor-not-allowed
              "
            >
              {
                uploading
                  ? "Mengupload..."
                  : "Upload Capture"
              }
            </button>

          </div>

        </form>

      </div>

    </MainLayout>

  );

}

export default UploadCapture;
