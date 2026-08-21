import { memo } from "react";
import { ArrowRight, MapPin } from "@phosphor-icons/react";
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
    "KEYINGI CHAQIRUV";

  const daysUnit =
    lang === "ru" ? "ДНЕЙ ДО СТАРТА" :
    lang === "en" ? "DAYS TO GO" :
    "KUN QOLDI";

  const detailsLabel =
    lang === "ru" ? "Подробнее" :
    lang === "en" ? "Race Details" :
    "Batafsil";

  const name =
    lang === "ru" ? (next.nameRu || next.nameUz || next.name) :
    lang === "en" ? next.name :
    (next.nameUz || next.name);

  // Background image based on the marathon
  const bgImage = next.image || "/marathons/zaamin.jpg";

  // Formatted Date
  const formattedDate = new Date(next.date).toLocaleDateString(
    lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ",
    { day: "numeric", month: "short" }
  );

  return (
    <button
      type="button"
      onClick={onOpenMarathons}
      className="mt-4 w-full text-left rounded-[32px] overflow-hidden relative isolate shadow-hero border border-white/15 dark:border-white/10 active:scale-[0.98] transition-all group bg-[#090c13] text-white p-5"
    >
      {/* Background Scenic Marathon Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={name}
          className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 opacity-55"
        />
        {/* Soft Contrast Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-[#080a0f]/60 to-[#080a0f]/30" />
      </div>

      {/* Clean A-to-B Route Line to the Mountain Peak */}
      <svg
        className="absolute right-4 bottom-14 w-44 h-24 pointer-events-none z-[1]"
        viewBox="0 0 180 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 10 85 C 50 80, 70 50, 110 55 C 135 60, 145 35, 165 15"
          stroke="#8B5CF6"
          strokeWidth="2.5"
          strokeDasharray="4 5"
          strokeLinecap="round"
        />
        {/* Point A (Start) */}
        <circle cx="10" cy="85" r="3.5" fill="#38BDF8" />
        {/* Point B (Finish Peak Flag) */}
        <circle cx="165" cy="15" r="4" fill="#A855F7" />
        <text x="156" y="8" fontSize="13">🏁</text>
      </svg>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Top Tag Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#6355FF] text-[10px] font-black tracking-wider uppercase text-white shadow-button">
          <span>{badgeText}</span>
        </div>

        {/* Marathon Title */}
        <h3 className="mt-2.5 text-[22px] font-black text-white leading-tight tracking-tight drop-shadow-md">
          {name}
        </h3>

        {/* Distance Pills */}
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

        {/* Countdown & Info */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-black leading-none bg-gradient-to-br from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                {daysLeft}
              </span>
              <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase leading-none">
                {daysUnit}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-white/80">
              <MapPin size={12} weight="fill" className="text-[#38BDF8]" />
              <span>{next.city}</span>
              <span className="text-white/40">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Clean Glassmorphic Pill Action Button */}
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-[11px] font-bold text-white group-hover:bg-[#6355FF] transition-all">
            <span>{detailsLabel}</span>
            <ArrowRight size={12} weight="bold" />
          </div>
        </div>
      </div>
    </button>
  );
});
