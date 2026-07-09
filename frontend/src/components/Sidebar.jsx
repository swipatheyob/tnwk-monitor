import {
  FaCamera,
  FaChartBar,
  FaHome,
  FaMapMarkerAlt,
  FaMicrochip,
  FaSignOutAlt,
  FaUpload,
  FaVideo
} from "react-icons/fa";

import {
  MdPerson
} from "react-icons/md";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  useAuth
} from "../context/authContext";

import logo from "../assets/logo_tnwk.png";

const navigation = [
  {
    path: "/",
    label: "Dashboard",
    icon: FaHome
  },
  {
    path: "/devices",
    label: "Devices",
    icon: FaMicrochip
  },
  {
    path: "/locations",
    label: "Locations",
    icon: FaMapMarkerAlt
  },
  {
    path: "/captures",
    label: "Captures",
    icon: FaCamera
  },
  {
    path: "/upload-capture",
    label: "Upload",
    icon: FaUpload
  },
  {
    path: "/analysis",
    label: "AI Analysis",
    icon: FaChartBar
  },
  {
    path: "/simulator",
    label: "Live Vision",
    icon: FaVideo
  },
  {
    path: "/profile",
    label: "Profile",
    icon: MdPerson
  }
];

function Sidebar() {

  const {
    logout
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const isActive =
    (path) => path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(
        path
      );

  const handleLogout =
    () => {

      logout();
      navigate("/login");

    };

  return (

    <aside
      className="
      fixed
      inset-y-4
      left-4
      z-50
      flex
      w-64
      flex-col
      overflow-hidden
      rounded-3xl
      border
      border-white/70
      bg-white/86
      shadow-[0_24px_70px_rgba(15,118,110,0.14)]
      backdrop-blur-2xl
      max-[1100px]:w-16
      max-[720px]:inset-x-3
      max-[720px]:top-auto
      max-[720px]:bottom-3
      max-[720px]:h-17
      max-[720px]:w-auto
      max-[720px]:flex-row
      max-[720px]:items-center
      "
    >

      <div
        className="
        relative
        border-b
        border-slate-200/80
        p-5
        max-[1100px]:p-2
        max-[720px]:hidden
        "
      >

        <div
          className="
          absolute
          -top-10
          left-8
          h-24
          w-24
          rounded-full
          bg-teal-300/20
          blur-3xl
          "
        />

        <div
          className="
          relative
          flex
          items-center
          gap-3
          max-[1100px]:justify-center
          "
        >

          <div
            className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-teal-100
            bg-white
            shadow-[0_12px_28px_rgba(15,118,110,0.12)]
            "
          >
            <img
              src={logo}
              alt="TNWK Logo"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="max-[1100px]:hidden">

            <h1
              className="
              text-sm
              font-extrabold
              tracking-wide
              text-slate-900
              "
            >
              TNWK MONITOR
            </h1>

            <p
              className="
              mt-1
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-teal-600
              "
            >
              Wildlife Intelligence
            </p>

          </div>

        </div>

      </div>

      <nav
        className="
        flex-1
        space-y-2
        overflow-y-auto
        p-3
        max-[1100px]:px-2
        max-[720px]:flex
        max-[720px]:items-center
        max-[720px]:justify-around
        max-[720px]:space-y-0
        max-[720px]:justify-start
        max-[720px]:overflow-x-auto
        max-[720px]:p-1
        "
      >

        <p
          className="
          px-3
          pb-2
          pt-1
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-slate-500
          max-[1100px]:hidden
          "
        >
          Command Modules
        </p>

        {
          navigation.map(
            ({
              path,
              label,
              icon: Icon
            }) => (

              <Link
                key={path}
                to={path}
                title={label}
                className={`
                group
                relative
                flex
                items-center
                gap-3
                overflow-hidden
                rounded-2xl
                px-3
                py-3
                text-sm
                font-medium
                transition-all
                duration-300
                max-[1100px]:justify-center
                max-[720px]:h-13
                max-[720px]:w-13
                max-[720px]:p-0
                ${
                  isActive(path)
                    ? "border border-teal-100 bg-teal-100 text-teal-700 shadow-[0_12px_26px_rgba(15,118,110,0.12)]"
                    : "border border-transparent text-slate-500 hover:border-teal-100 hover:bg-teal-50 hover:text-teal-700"
                }
                `}
              >

                {
                  isActive(path) && (

                    <span
                      className="
                      absolute
                      inset-y-3
                      left-0
                      w-0.5
                      rounded-full
                      bg-teal-600
                      shadow-[0_0_12px_rgba(15,118,110,0.35)]
                      max-[720px]:inset-x-3
                      max-[720px]:top-auto
                      max-[720px]:bottom-0
                      max-[720px]:h-0.5
                      max-[720px]:w-auto
                      "
                    />

                  )
                }

                <Icon
                  className={`
                  shrink-0
                  text-base
                  transition-transform
                  group-hover:scale-110
                  ${
                    isActive(path)
                      ? "text-teal-700"
                      : ""
                  }
                  `}
                />

                <span className="max-[1100px]:hidden">
                  {label}
                </span>

              </Link>

            )
          )
        }

      </nav>

      <div
        className="
        border-t
        border-slate-200/80
        p-3
        max-[720px]:hidden
        "
      >

        <div
          className="
          mb-3
          rounded-2xl
          border
          border-emerald-100
          bg-emerald-50
          p-3
          max-[1100px]:hidden
          "
        >
          <div className="flex items-center gap-2">
            <span className="status-dot" />
            <span className="text-xs font-semibold text-emerald-700">
              System Online
            </span>
          </div>
          <p className="mt-2 text-[10px] leading-4 text-slate-500">
            TNWK Monitoring v1.0
            <br />
            Informatika 2026
          </p>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-rose-100
          bg-rose-50
          px-4
          py-3
          text-sm
          font-semibold
          text-rose-600
          transition
          hover:border-rose-200
          hover:bg-rose-100
          max-[1100px]:px-0
          "
        >
          <FaSignOutAlt />
          <span className="max-[1100px]:hidden">
            Secure Logout
          </span>
        </button>

      </div>

    </aside>

  );

}

export default Sidebar;
