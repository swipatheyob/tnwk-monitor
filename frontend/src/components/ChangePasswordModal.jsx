import {
  useState
} from "react";

import {
  MdLock
} from "react-icons/md";

function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  loading
}) {

  const [
    form,
    setForm
  ] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  if (!isOpen) {
    return null;
  }

  const handleChange =
    (event) => {

      const {
        name,
        value
      } = event.target;

      setForm(
        (current) => ({
          ...current,
          [name]: value
        })
      );

    };

  const handleSubmit =
    (event) => {

      event.preventDefault();
      onSubmit(form);

    };

  const fields = [
    {
      name: "oldPassword",
      label: "Password Lama"
    },
    {
      name: "newPassword",
      label: "Password Baru"
    },
    {
      name: "confirmPassword",
      label: "Konfirmasi Password"
    }
  ];

  return (

    <div
      className="
      fixed
      inset-0
      z-[80]
      flex
      items-center
      justify-center
      bg-slate-950/45
      px-4
      backdrop-blur-sm
      "
    >
      <div
        className="
        w-full
        max-w-lg
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-[0_24px_70px_rgba(15,23,42,0.24)]
        "
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-600">
            Security
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Ganti Password
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          {
            fields.map(
              ({
                name,
                label
              }) => (

                <label
                  key={name}
                  className="block"
                >
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MdLock className="text-teal-600" />
                    {label}
                  </span>

                  <input
                    name={name}
                    type="password"
                    value={form[name]}
                    onChange={handleChange}
                    required
                    minLength={
                      name === "oldPassword"
                        ? undefined
                        : 8
                    }
                    className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    "
                  />
                </label>

              )
            )
          }

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="
              rounded-2xl
              border
              border-slate-200
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:bg-slate-50
              "
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
              premium-button
              rounded-2xl
              px-5
              py-3
              text-sm
              font-semibold
              disabled:opacity-70
              "
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>

  );

}

export default ChangePasswordModal;
