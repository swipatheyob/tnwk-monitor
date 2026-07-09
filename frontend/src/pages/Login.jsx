import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaChartLine,
  FaEye,
  FaLock,
  FaMicrochip,
  FaSatelliteDish,
  FaShieldAlt
} from "react-icons/fa";

import {
  loginUser
} from "../services/authService";

import {
  useAuth
} from "../context/authContext";

import logo from "../assets/logo_tnwk.png";
import hero from "../assets/hero.png";

function Login() {

  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [
    formData,
    setFormData
  ] = useState({
    email: "",
    password: ""
  });

  const [
    loading,
    setLoading
  ] = useState(false);

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

        setLoading(true);

        const response =
          await loginUser(
            formData
          );

        login(
          response.user,
          response.token
        );

        navigate("/");

      } catch (error) {

        alert(
          error.response?.data?.message ||
          "Login Failed"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div
      className="
      relative
      min-h-screen
      overflow-hidden
      bg-gradient-to-br
      from-slate-50
      via-teal-50
      to-cyan-50
      p-4
      text-slate-900
      sm:p-7
      "
    >

      <div
        className="
        absolute
        inset-0
        bg-[linear-gradient(rgba(20,184,166,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,.10)_1px,transparent_1px)]
        bg-size-[56px_56px]
        "
      />

      <div
        className="
        absolute
        -left-40
        -top-40
        h-130
        w-130
        rounded-full
        bg-teal-300/20
        blur-[120px]
        "
      />

      <div
        className="
        absolute
        -bottom-48
        right-0
        h-150
        w-150
        rounded-full
        bg-emerald-300/20
        blur-[130px]
        "
      />

      <div
        className="
        relative
        mx-auto
        grid
        min-h-[calc(100vh-3.5rem)]
        w-full
        max-w-7xl
        overflow-hidden
        rounded-[2rem]
        border
        border-white/70
        bg-white/72
        shadow-[0_35px_100px_rgba(15,118,110,.16)]
        backdrop-blur-2xl
        lg:grid-cols-[1.25fr_.75fr]
        "
      >

        <section
          className="
          relative
          hidden
          overflow-hidden
          border-r
          border-teal-100
          p-12
          lg:flex
          lg:flex-col
          lg:justify-between
          "
        >

          <div
            className="
            absolute
            right-[-10%]
            top-[20%]
            h-100
            w-100
            rounded-full
            border
            border-teal-200/70
            before:absolute
            before:inset-12
            before:rounded-full
            before:border
            before:border-teal-200/70
            after:absolute
            after:inset-24
            after:rounded-full
            after:border
            after:border-emerald-200/80
            "
          />

          <div className="relative">

            <div
              className="
              flex
              items-center
              gap-4
              "
            >

              <div
                className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-teal-100
                bg-white
                shadow-[0_18px_35px_rgba(15,118,110,.13)]
                "
              >
                <img
                  src={logo}
                  alt="TNWK"
                  className="h-13 w-13 object-contain"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">
                  TNWK Intelligence
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Wildlife Monitoring Platform
                </p>
              </div>

            </div>

            <div className="mt-24 max-w-2xl">

              <span className="page-kicker">
                Autonomous Field Vision
              </span>

              <h1
                className="
                text-6xl
                font-black
                leading-[.98]
                tracking-[-.055em]
                text-slate-950
                "
              >
                See the wild.
                <span
                  className="
                  block
                  bg-linear-to-r
                  from-teal-700
                  via-teal-500
                  to-emerald-500
                  bg-clip-text
                  text-transparent
                  "
                >
                  Protect its future.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600">
                Platform monitoring satwa berbasis ESP32-CAM,
                pemrosesan citra, dan telemetry realtime untuk
                Taman Nasional Way Kambas.
              </p>

              <div
                className="
                mt-10
                overflow-hidden
                rounded-3xl
                border
                border-white/80
                bg-white/70
                p-3
                shadow-[0_22px_55px_rgba(15,118,110,.13)]
                "
              >
                <img
                  src={hero}
                  alt="TNWK wildlife monitoring"
                  className="
                  h-72
                  w-full
                  rounded-2xl
                  object-cover
                  "
                />
              </div>

            </div>

          </div>

          <div
            className="
            relative
            grid
            grid-cols-3
            gap-3
            "
          >

            {
              [
                [FaMicrochip, "IoT Nodes", "Connected"],
                [FaEye, "Vision AI", "Realtime"],
                [FaChartLine, "Analytics", "Intelligent"]
              ].map(
                ([Icon, label, value]) => (

                  <div
                    key={label}
                    className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white/78
                    p-4
                    "
                  >
                    <Icon className="text-teal-600" />
                    <p className="mt-4 text-xs text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {value}
                    </p>
                  </div>

                )
              )
            }

          </div>

        </section>

        <section
          className="
          flex
          items-center
          justify-center
          p-6
          sm:p-10
          lg:p-12
          "
        >

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md"
          >

            <div
              className="
              mb-10
              flex
              items-center
              gap-3
              lg:hidden
              "
            >
              <img
                src={logo}
                alt="TNWK"
                className="h-14 w-14 object-contain"
              />
              <div>
                <p className="font-bold text-slate-900">
                  TNWK Monitoring
                </p>
                <p className="text-xs text-teal-600">
                  Wildlife Intelligence
                </p>
              </div>
            </div>

            <div
              className="
              mb-8
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
              shadow-[0_14px_30px_rgba(15,118,110,.12)]
              "
            >
              <FaSatelliteDish />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Secure Access Portal
            </p>

            <h2
              className="
              mt-3
              text-4xl
              font-black
              tracking-[-.04em]
              text-slate-950
              "
            >
              Welcome back.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Authenticate to enter the wildlife monitoring
              command center.
            </p>

            <div className="mt-9 space-y-5">

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder="admin@tnwk.id"
                  onChange={handleChange}
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-4
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-600
                  focus:border-teal-500
                  focus:ring-4
                  focus:ring-teal-500/10
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  placeholder="Enter secure password"
                  onChange={handleChange}
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-4
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-600
                  focus:border-teal-500
                  focus:ring-4
                  focus:ring-teal-500/10
                  "
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="
              premium-button
              mt-7
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-2xl
              px-5
              py-4
              font-bold
              transition-all
              disabled:cursor-not-allowed
              disabled:opacity-60
              "
            >
              <FaLock />
              {
                loading
                  ? "Authenticating..."
                  : "Enter Command Center"
              }
            </button>

            <div
              className="
              mt-7
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-slate-600
              "
            >
              <FaShieldAlt className="text-emerald-500" />
              Protected monitoring environment
            </div>

          </form>

        </section>

      </div>

    </div>

  );

}

export default Login;
