import {useEffect, useRef, useState} from "react";

import {
  MdEmail,
  MdLocationOn,
  MdLock,
  MdPerson,
  MdPhone,
  MdVerifiedUser,
} from "react-icons/md";

import ChangePasswordModal from "../components/ChangePasswordModal";

import EditProfileModal from "../components/EditProfileModal";

import MainLayout from "../layouts/MainLayout";

import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminPhoto,
} from "../services/profileService";
import {BACKEND_BASE_URL} from "../config/apiConfig";

const API_BASE_URL = `https://${BACKEND_BASE_URL}`;

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

function Profile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getAdminProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Gagal memuat profil administrator",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await uploadAdminPhoto(file);

      setProfile(response.user);

      setMessage(response.message || "Foto profil berhasil diperbarui");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengupload foto profil");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  const handleUpdateProfile = async (form) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await updateAdminProfile(form);

      setProfile(response.user);

      setMessage(response.message || "Profil berhasil diperbarui");

      setEditOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (form) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await changeAdminPassword(form);

      setMessage(response.message || "Password berhasil diperbarui");

      setPasswordOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengganti password");
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = profile?.photo
    ? `${API_BASE_URL}/uploads/profile/${profile.photo}`
    : "https://ui-avatars.com/api/?name=Administrator&background=0f766e&color=fff&size=360";

  const details = [
    {
      label: "Nama Lengkap",
      value: profile?.username || "-",
      icon: MdPerson,
    },
    {
      label: "Email",
      value: profile?.email || "-",
      icon: MdEmail,
    },
    {
      label: "Role",
      value: profile?.role || "admin",
      icon: MdVerifiedUser,
    },
    {
      label: "ID Personel",
      value: profile?.personnelId || "-",
      icon: MdPerson,
    },
    {
      label: "Tanggal Bergabung",
      value: formatDate(profile?.createdAt),
      icon: MdVerifiedUser,
    },
    {
      label: "Status Akun",
      value: "Aktif",
      icon: MdVerifiedUser,
    },
    {
      label: "Terakhir Login",
      value: formatDate(profile?.lastLogin),
      icon: MdLock,
    },
    {
      label: "No HP",
      value: profile?.phone || "-",
      icon: MdPhone,
    },
    {
      label: "Alamat",
      value: profile?.address || "-",
      icon: MdLocationOn,
    },
  ];

  return (
    <MainLayout>
      <div
        className="
        mb-8
        flex
        flex-col
        justify-between
        gap-5
        xl:flex-row
        xl:items-end
        "
      >
        <div>
          <span className="page-kicker">Account Settings</span>

          <h1 className="page-title">Profile Administrator</h1>

          <p className="page-description">
            Pengaturan akun administrator sistem Monitoring Satwa.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      <div
        className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-[0_18px_45px_rgba(15,118,110,0.08)]
        md:p-8
        "
      >
        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-slate-500">
            Memuat profil administrator...
          </div>
        ) : (
          <div
            className="
              grid
              gap-8
              lg:grid-cols-[240px_1fr]
              "
          >
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={photoUrl}
                alt="Foto Profil Administrator"
                className="
                  h-[180px]
                  w-[180px]
                  rounded-xl
                  border
                  border-slate-200
                  object-cover
                  shadow-[0_18px_35px_rgba(15,118,110,0.12)]
                  "
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleUploadClick}
                disabled={saving}
                className="
                  mt-5
                  w-[180px]
                  rounded-2xl
                  border
                  border-teal-100
                  bg-teal-50
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-teal-700
                  transition
                  hover:border-teal-200
                  hover:bg-teal-100
                  disabled:opacity-70
                  "
              >
                Upload Foto
              </button>
            </div>

            <div>
              <div
                className="
                  flex
                  flex-col
                  justify-between
                  gap-4
                  border-b
                  border-slate-200
                  pb-5
                  sm:flex-row
                  sm:items-center
                  "
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-600">
                    Informasi Detail
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Administrator
                  </h2>
                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-emerald-100
                    bg-emerald-50
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-emerald-700
                    "
                >
                  <span className="status-dot" />
                  Aktif
                </span>
              </div>

              <div
                className="
                  mt-6
                  grid
                  gap-4
                  md:grid-cols-2
                  "
              >
                {details.map(({label, value, icon: Icon}) => (
                  <div
                    key={label}
                    className="
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50
                          p-4
                          "
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      <Icon className="text-base text-teal-600" />
                      {label}
                    </div>
                    <p className="mt-3 break-words text-sm font-semibold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  "
              >
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="
                    premium-button
                    rounded-2xl
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    "
                >
                  Edit Profil
                </button>

                <button
                  type="button"
                  onClick={() => setPasswordOpen(true)}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:border-teal-100
                    hover:bg-teal-50
                    hover:text-teal-700
                    "
                >
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={editOpen}
        profile={profile}
        loading={saving}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdateProfile}
      />

      <ChangePasswordModal
        isOpen={passwordOpen}
        loading={saving}
        onClose={() => setPasswordOpen(false)}
        onSubmit={handleChangePassword}
      />
    </MainLayout>
  );
}

export default Profile;
