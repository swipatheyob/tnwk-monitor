import {
  FaCamera,
  FaCheckCircle,
  FaMicrochip,
  FaTimesCircle
} from "react-icons/fa";

import {
  useEffect,
  useState
} from "react";

const variants = {
  "Total Device": {
    icon: FaMicrochip,
    accent: "teal",
    label: "Registered nodes"
  },
  Online: {
    icon: FaCheckCircle,
    accent: "emerald",
    label: "Active connections"
  },
  Offline: {
    icon: FaTimesCircle,
    accent: "orange",
    label: "Inactive connections"
  },
  Capture: {
    icon: FaCamera,
    accent: "blue",
    label: "Media intelligence"
  }
};

const accentClasses = {
  teal: {
    icon: "text-teal-700",
    surface: "border-teal-100 bg-teal-50",
    glow: "bg-teal-200/35",
    bar: "from-teal-600 to-teal-400"
  },
  emerald: {
    icon: "text-emerald-700",
    surface: "border-emerald-100 bg-emerald-50",
    glow: "bg-emerald-200/35",
    bar: "from-emerald-600 to-green-400"
  },
  orange: {
    icon: "text-orange-700",
    surface: "border-orange-100 bg-orange-50",
    glow: "bg-orange-200/35",
    bar: "from-orange-500 to-amber-400"
  },
  blue: {
    icon: "text-blue-700",
    surface: "border-blue-100 bg-blue-50",
    glow: "bg-blue-200/35",
    bar: "from-blue-500 to-sky-400"
  }
};

function StatCard({
  title,
  value
}) {

  const [
    displayValue,
    setDisplayValue
  ] = useState(0);

  useEffect(() => {

    const target =
      Number(value) || 0;

    const duration =
      650;

    const startTime =
      performance.now();

    let animationFrame;

    const animate =
      (currentTime) => {

        const progress =
          Math.min(
            (currentTime - startTime) /
              duration,
            1
          );

        const easedProgress =
          1 -
          Math.pow(
            1 - progress,
            3
          );

        setDisplayValue(
          Math.round(
            target *
            easedProgress
          )
        );

        if (progress < 1) {

          animationFrame =
            requestAnimationFrame(
              animate
            );

        }

      };

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () =>
      cancelAnimationFrame(
        animationFrame
      );

  }, [value]);

  const variant =
    variants[title] ||
    variants["Total Device"];

  const colors =
    accentClasses[
      variant.accent
    ];

  const Icon =
    variant.icon;

  return (

    <div
      className="
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-6
      shadow-[0_18px_45px_rgba(15,118,110,0.08)]
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-[0_24px_55px_rgba(15,118,110,0.14)]
      "
    >

      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${colors.bar}`}
      />

      <div
        className={`
        absolute
        -right-10
        -top-10
        h-32
        w-32
        rounded-full
        blur-3xl
        transition-transform
        duration-500
        group-hover:scale-125
        ${colors.glow}
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

        <div>

          <p
            className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-500
            "
          >
            {title}
          </p>

          <h2
            className="
            mt-3
            text-4xl
            font-black
            tracking-tight
            text-slate-900
            "
          >
            {displayValue}
          </h2>

          <p className="mt-2 text-xs text-slate-500">
            {variant.label}
          </p>

        </div>

        <div
          className={`
          flex
          h-13
          w-13
          items-center
          justify-center
          rounded-2xl
          border
          text-xl
          shadow-lg
          ${colors.surface}
          ${colors.icon}
          `}
        >
          <Icon />
        </div>

      </div>

      <div
        className="
        relative
        mt-6
        h-1
        overflow-hidden
        rounded-full
        bg-slate-100
        "
      >
        <div
          className={`
          h-full
          w-2/3
          rounded-full
          bg-linear-to-r
          ${colors.bar}
          `}
        />
      </div>

    </div>

  );

}

export default StatCard;
