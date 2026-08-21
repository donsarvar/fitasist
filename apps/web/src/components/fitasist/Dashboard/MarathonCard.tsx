import { memo } from "react";
import { ArrowRight, MapPin, Mountains, Flag, ShieldCheck } from "@phosphor-icons/react";
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

  const badgeText =
    lang === "ru" ? "СЛЕДУЮЩИЙ МАРАФОН" :
    lang === "en" ? "NEXT CHALLENGE" :
    "ENG YAQIN MARAFON";

  const daysUnit =
    lang === "ru" ? "ДНЕЙ ДО СТАРТА" :
    lang === "en" ? "DAYS TO GO" :
    "KUN QOLDI";

  const detailsLabel =
    lang === "ru" ? "ПОДРОБНЕЕ О ТРАССЕ" :
    lang === "en" ? "RACE DETAILS" :
    "MARSHRUT VA TAFSILOTLAR";

  const elevationLabel =
    lang === "ru" ? "НАБОР ВЫСОТЫ" :
    lang === "en" ? "ELEVATION" :
    "BALANDLIK";

  const name =
    lang === "ru" ? (next.nameRu || next.nameUz || next.name) :
    lang === "en" ? next.name :
    (next.nameUz || next.name);

  // Background image based on the marathon
  const bgImage = next.image || "/marathons/zaamin.jpg";

  // Date formatting
  const formattedDate = new Date(next.date).toLocaleDateString(
    lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <button
      type="button"
      onClick={onOpenMarathons}
      className="mt-4 w-full text-left rounded-[32px] overflow-hidden relative isolate shadow-hero border border-white/15 dark:border-white/10 active:scale-[0.98] transition-all group bg-[#0a0d14] text-white"
    >
      {/* Background High-Res Nature Scene */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={name}
          className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 opacity-60"
        />
        {/* Cinematic Vignette Overlays for Perfect Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-[#080a0f]/60 to-[#080a0f]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f]/80 via-transparent to-[#080a0f]/70" />
      </div>

      {/* Precise A to B Route SVG (Start A -> Mountain Peak Finish B) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Topography faint contour rings */}
        <path
          d="M 200 40 C 270 30, 350 70, 380 130"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />
        <path
          d="M 220 60 C 280 50, 340 85, 370 145"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />

        {/* Trail Route from Point A to Point B */}
        <path
          d="M 185 140 C 220 125, 250 150, 280 110 C 305 75, 325 95, 345 45"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeDasharray="4 6"
          strokeLinecap="round"
        />

        {/* Point A (Start Point) */}
        <circle cx="185" cy="140" r="4" fill="#38BDF8" />
        <text x="172" y="132" fill="#38BDF8" fontSize="8" fontWeight="800" fontFamily="sans-serif">START</text>

        {/* Point B (Finish Peak with Flag) */}
        <circle cx="345" cy="45" r="4" fill="#A855F7" />
        <circle cx="345" cy="45" r="8" stroke="#A855F7" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
        <text x="338" y="32" fill="#E9D5FF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">🏁</text>
      </svg>

      {/* Main Content */}
      <div className="relative z-10 p-5 pb-4">
        {/* Header Tag */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8C52FF] text-[10px] font-black tracking-wider uppercase text-white shadow-button">
            <span>{badgeText}</span>
          </div>
          <span className="text-xs font-semibold text-white/75 flex items-center gap-1">
            <ShieldCheck size={14} weight="fill" className="text-emerald-400" />
            Rasmiy musobaqa
          </span>
        </div>

        {/* Marathon Title */}
        <h3 className="mt-2.5 text-[21px] font-black text-white leading-tight tracking-tight drop-shadow-md">
          {name}
        </h3>

        {/* Actual Distance Options */}
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          {next.distances.map((d, idx) => {
            const isPrimary = idx === 0 || (next.distances.length === 1);
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

        {/* Middle Stats: Days Left Countdown & Actual Elevation / Terrain */}
        <div className="mt-4 flex items-end justify-between gap-4">
          {/* Left: Days Countdown */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[44px] font-black leading-none bg-gradient-to-br from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
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
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Right: Actual Technical Elevation Badge (Real Data, no fake %) */}
          {next.elevationGain && (
            <div className="shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 min-w-[84px] text-center">
              <Mountains size={18} weight="fill" className="text-[#38BDF8]" />
              <span className="text-[13px] font-black text-white mt-1 leading-tight">
                {next.elevationGain}
              </span>
              <span className="text-[8px] font-extrabold text-white/60 uppercase tracking-tight mt-0.5">
                {elevationLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Real Race Details Strip */}
      <div className="relative z-10 mx-3 mb-3 p-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-white/90 font-semibold text-[11px]">
          <Flag size={14} weight="fill" className="text-amber-400" />
          <span>Trassa: {next.terrain || "Tog'li & Shahar"}</span>
        </div>
        <div className="shrink-0 flex items-center gap-1 text-[11px] font-black text-indigo-300 uppercase tracking-wide group-hover:text-white group-hover:translate-x-0.5 transition-all">
          <span>{detailsLabel}</span>
          <ArrowRight size={12} weight="bold" />
        </div>
      </div>
    </button>
  );
});
