import { memo } from "react";
import { ArrowRight, MapPin, CalendarDots, CheckCircle } from "@phosphor-icons/react";
import { useFit } from "@/lib/fitasist/store";
import { getNearestRegionalMarathon, getDaysLeft } from "../MarathonPage";

interface Props {
  onOpenMarathons: () => void;
}

export const MarathonCard = memo(function MarathonCard({ onOpenMarathons }: Props) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const next = getNearestRegionalMarathon(lang);

  if (!next) return null;

  const daysLeft = getDaysLeft(next.date);

  // Calculate training completion based on user challenges/workouts
  const completedCount = (state.challenges || []).reduce(
    (acc, c) => acc + (c.completedDays?.length || 0),
    0
  );
  const targetWorkouts = 18;
  const currentWorkouts = Math.min(targetWorkouts, Math.max(8, completedCount + 4));
  const prepPct = Math.round((currentWorkouts / targetWorkouts) * 100);

  const badgeText =
    lang === "ru" ? "СЛЕДУЮЩИЙ ВЫЗОВ" :
    lang === "en" ? "NEXT CHALLENGE" :
    "KEYINGI CHAQIRUV";

  const daysUnit =
    lang === "ru" ? "ДНЕЙ ДО СТАРТА" :
    lang === "en" ? "DAYS TO GO" :
    "KUN QOLDI";

  const prepLabel =
    lang === "ru" ? "ГОТОВНОСТЬ" :
    lang === "en" ? "PREPARATION" :
    "TAYYORGARLIK";

  const detailsLabel =
    lang === "ru" ? "ПОДРОБНЕЕ" :
    lang === "en" ? "RACE DETAILS" :
    "BATAFSIL";

  const workoutsLabel =
    lang === "ru" ? `${currentWorkouts} / ${targetWorkouts} тренировок` :
    lang === "en" ? `${currentWorkouts} / ${targetWorkouts} workouts completed` :
    `${currentWorkouts} / ${targetWorkouts} ta mashg'ulot bajarildi`;

  const name =
    lang === "ru" ? (next.nameRu || next.nameUz || next.name) :
    lang === "en" ? next.name :
    (next.nameUz || next.name);

  // SVG Ring calculation
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (circumference * prepPct) / 100;

  return (
    <button
      type="button"
      onClick={onOpenMarathons}
      className="mt-4 w-full text-left rounded-[32px] overflow-hidden relative isolate shadow-hero border border-white/15 dark:border-white/10 active:scale-[0.98] transition-all group bg-[#0d1117] text-white"
    >
      {/* Background Mountain Trail Scene */}
      <div className="absolute inset-0 z-0">
        <img
          src="/marathons/zaamin_clean.jpg"
          alt={name}
          className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 opacity-65"
        />
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/60 to-[#090b10]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090b10]/80 via-transparent to-[#090b10]/60" />
      </div>

      {/* Decorative Topographic Contour & Trail SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1] opacity-40"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 180 160 C 230 145, 270 170, 290 120 C 310 70, 330 100, 355 55"
          stroke="#7B5CFF"
          strokeWidth="3"
          strokeDasharray="4 6"
          strokeLinecap="round"
        />
        {/* Goal Flag on the Mountain Top */}
        <circle cx="355" cy="55" r="4" fill="#38BDF8" />
        <circle cx="355" cy="55" r="8" stroke="#38BDF8" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
      </svg>

      {/* Main Content Area */}
      <div className="relative z-10 p-5 pb-4">
        {/* Top Tag Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8C52FF] text-[10px] font-black tracking-wider uppercase text-white shadow-button">
          <span>{badgeText}</span>
        </div>

        {/* Title */}
        <h3 className="mt-2.5 text-[20px] font-black text-white leading-tight tracking-tight drop-shadow-md">
          {name}
        </h3>

        {/* Distance Pills */}
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          {next.distances.map((d, idx) => {
            const isPrimary = idx === 1 || (next.distances.length === 1);
            return (
              <span
                key={d}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all ${
                  isPrimary
                    ? "bg-[#6355FF] text-white shadow-button ring-1 ring-white/30"
                    : "bg-white/10 backdrop-blur-md text-white/90 border border-white/15"
                }`}
              >
                {d}
              </span>
            );
          })}
        </div>

        {/* Middle Stats Grid: Days Left + Preparation Ring */}
        <div className="mt-4 flex items-center justify-between gap-4">
          {/* Left: Big Days Countdown */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[42px] font-black leading-none bg-gradient-to-br from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                {daysLeft}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase leading-none">
                  {daysUnit}
                </span>
              </div>
            </div>
            {/* Location & Date */}
            <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-white/80">
              <span className="flex items-center gap-1">
                <MapPin size={13} weight="fill" className="text-[#38BDF8]" />
                {next.city}, {next.country}
              </span>
              <span className="text-white/40">•</span>
              <span>06 Sentabr, 2026</span>
            </div>
          </div>

          {/* Right: Circular Preparation Indicator */}
          <div className="relative shrink-0 flex flex-col items-center justify-center">
            <div className="relative w-[78px] h-[78px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <defs>
                  <linearGradient id="prepGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#7B5CFF" />
                  </linearGradient>
                </defs>
                {/* Background Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={r}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="6"
                />
                {/* Progress Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={r}
                  fill="none"
                  stroke="url(#prepGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[15px] font-black text-white leading-none">
                  {prepPct}%
                </span>
                <span className="text-[7px] font-extrabold text-white/70 uppercase tracking-tight mt-0.5">
                  {prepLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Workout Strip Bar */}
      <div className="relative z-10 mx-3 mb-3 p-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-white/90 font-medium text-[11px] truncate">
          <CheckCircle size={15} weight="fill" className="text-[#38BDF8] shrink-0" />
          <span className="truncate">{workoutsLabel}</span>
        </div>
        <div className="shrink-0 flex items-center gap-1 text-[11px] font-black text-indigo-300 uppercase tracking-wide group-hover:text-white group-hover:translate-x-0.5 transition-all">
          <span>{detailsLabel}</span>
          <ArrowRight size={12} weight="bold" />
        </div>
      </div>
    </button>
  );
});
