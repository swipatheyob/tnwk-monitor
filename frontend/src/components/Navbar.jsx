import {
  useEffect,
  useState
} from "react";

import {
  FaCalendarAlt,
  FaLeaf,
  FaUserShield
} from "react-icons/fa";

import {
  useAuth
} from "../context/authContext";

function Navbar() {

  const {
    user
  } = useAuth();

  const [
    currentTime,
    setCurrentTime
  ] = useState(
    new Date()
  );

  useEffect(() => {

    const timer =
      setInterval(
        () => {

          setCurrentTime(
            new Date()
          );

        },
        1000
      );

    return () =>
      clearInterval(
        timer
      );

  }, []);

  return (

    <header
      className="
      sticky
      top-0
      z-40
      border-b
      border-white/70
      bg-white/72
      px-8
      py-4
      shadow-[0_12px_35px_rgba(15,118,110,0.08)]
      backdrop-blur-2xl
      "
    >

      <div
        className="
        mx-auto
        flex
        max-w-[1600px]
        items-center
        justify-between
        gap-5
        "
      >

        <div
          className="
          flex
          items-center
          gap-4
          "
        >

          <div
            className="
            hidden
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-teal-100
            bg-teal-50
            text-teal-700
            shadow-[0_12px_28px_rgba(15,118,110,0.12)]
            sm:flex
            "
          >
            <FaLeaf />
          </div>

          <div>

            <div
              className="
              flex
              items-center
              gap-3
              "
            >

              <h2
                className="
                text-sm
                font-bold
                tracking-[0.12em]
                text-slate-900
                sm:text-base
                "
              >
                Selamat datang di TNWK Monitoring
              </h2>

              <span
                className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-3
                py-1
                text-[11px]
                font-bold
                text-emerald-700
                "
              >
                <span className="status-dot" />
                Online
              </span>

            </div>

            <p
              className="
              mt-1
              text-xs
              text-slate-500
              "
            >
              Sistem konservasi dan perangkat lapangan siap dipantau
            </p>

          </div>

        </div>

        <div
          className="
          flex
          items-center
          gap-3
          "
        >

          <div
            className="
            hidden
            items-center
            gap-2
            rounded-2xl
            border
            border-slate-200
            bg-white/80
            px-4
            py-2.5
            text-xs
            text-slate-600
            xl:flex
            "
          >
            <FaCalendarAlt className="text-teal-600" />

            {
              currentTime.toLocaleString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                }
              )
            }
          </div>

          <div
            className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-white/86
            px-3
            py-2
            "
          >

            <div
              className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-linear-to-br
              from-teal-600
              to-emerald-500
              text-white
              "
            >
              <FaUserShield />
            </div>

            <div className="hidden sm:block">

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Administrator
              </p>

              <p className="text-sm font-semibold text-slate-900">
                {
                  user?.username ||
                  "Administrator"
                }
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>

  );

}

export default Navbar;
