import { memo } from "react";
import { ArrowRight, CalendarBlank, Mountains } from "@phosphor-icons/react";
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

  const daysWord =
    lang === "ru" ? "ДНЕЙ" :
    lang === "en" ? "DAYS" :
    "KUN";

  const toGoWord =
    lang === "ru" ? "ДО СТАРТА" :
    lang === "en" ? "TO GO" :
    "QOLDI";

  const detailsLabel =
    lang === "ru" ? "Batafsil" :
    lang === "en" ? "Details" :
    "Batafsil";

  const name =
    lang === "ru" ? (next.nameRu || next.nameUz || next.name) :
    lang === "en" ? next.name :
    (next.nameUz || next.name);

  // Background scenic mountain image
  const bgImage = next.image || "/marathons/skycamp.jpg";

  // Formatted localized date (e.g., "5-sen, 2026")
  const formattedDate = new Date(next.date).toLocaleDateString(
    lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <button
      type="button"
      onClick={onOpenMarathons}
      className="mt-4 w-full text-left rounded-[32px] overflow-hidden relative isolate bg-white dark:bg-[#12141c] border border-slate-100 dark:border-white/5 shadow-card active:scale-[0.98] transition-all group p-5 text-slate-900 dark:text-white"
    >
      {/* High-Resolution Mountain Scene */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={bgImage}
          alt={name}
          className="w-full h-full object-cover object-right scale-100 group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-60"
        />
        {/* Soft Multi-Layer Glass Gradient from Left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#12141c] dark:via-[#12141c]/80 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent dark:from-[#12141c]/30 dark:via-transparent dark:to-transparent" />
      </div>

      {/* Glowing Mountain Summit Trail SVG */}
      <svg
        className="absolute right-2 top-2 w-44 h-36 pointer-events-none z-[1]"
        viewBox="0 0 180 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neonTrail" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <filter id="glowTrail" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Route Line along mountain ridge */}
        <path
          d="M 10 130 C 35 120, 50 105, 70 110 C 95 115, 110 70, 130 60 C 145 50, 152 25, 160 12"
          stroke="url(#neonTrail)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glowTrail)"
        />

        {/* Trail Waypoints (Glowing Dots) */}
        <circle cx="10" cy="130" r="2.5" fill="#E0E7FF" stroke="#8B5CF6" strokeWidth="1.5" />
        <circle cx="45" cy="115" r="3" fill="#E0E7FF" stroke="#8B5CF6" strokeWidth="1.5" />
        <circle cx="70" cy="110" r="3" fill="#E0E7FF" stroke="#8B5CF6" strokeWidth="1.5" />
        <circle cx="110" cy="75" r="3" fill="#E0E7FF" stroke="#8B5CF6" strokeWidth="1.5" />
        <circle cx="135" cy="55" r="3" fill="#E0E7FF" stroke="#8B5CF6" strokeWidth="1.5" />

        {/* Summit Marker Flag */}
        <circle cx="160" cy="12" r="3.5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.5" />
        <text x="156" y="5" fontSize="12">🚩</text>
      </svg>

      {/* Main Content Layout */}
      <div className="relative z-10">
        {/* Title: Pure & Bold across top */}
        <h3 className="text-[22px] font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight max-w-[65%] drop-shadow-2xs">
          {name}
        </h3>

        {/* Distance Pills: All 3 in a neat single row */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {next.distances.map((d, idx) => {
            const isPrimary = idx === 0 || next.distances.length === 1;
            return (
              <div
                key={d}
                className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 ${
                  isPrimary
                    ? "bg-gradient-to-r from-[#5850EC] to-[#7B5CFF] text-white shadow-button"
                    : "bg-white/85 dark:bg-white/10 backdrop-blur-md text-slate-800 dark:text-white/90 border border-white/80 dark:border-white/10 shadow-2xs"
                }`}
              >
                <Mountains
                  size={13}
                  weight={isPrimary ? "fill" : "bold"}
                  className={isPrimary ? "text-white" : "text-slate-500 dark:text-slate-400"}
                />
                <span className="text-[10px] font-extrabold tracking-tight whitespace-nowrap">
                  {d}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Glass Capsule (Left) + Gradient CTA (Right) */}
        <div className="mt-5 flex items-center justify-between gap-2.5">
          {/* Left Glass Capsule */}
          <div className="flex-1 min-w-0 bg-white/75 dark:bg-black/35 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl p-2 px-3 shadow-glass flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Purple Calendar Icon Box */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5850EC] to-[#7B5CFF] text-white flex items-center justify-center shadow-xs shrink-0">
                <CalendarBlank size={15} weight="fill" />
              </div>

              {/* Big Countdown Number & Stacked Units */}
              <div className="flex items-baseline gap-1 shrink-0">
                <span className="text-[24px] font-black leading-none text-[#5850EC] dark:text-[#818CF8] tracking-tight">
                  {daysLeft}
                </span>
                <div className="flex flex-col text-[7px] font-black uppercase text-slate-500 dark:text-slate-400 leading-tight">
                  <span>{daysWord}</span>
                  <span>{toGoWord}</span>
                </div>
              </div>
            </div>

            <span className="text-slate-300 dark:text-slate-600 font-bold text-xs shrink-0">•</span>

            {/* Date Tag */}
            <div className="flex items-center gap-1 text-[10.5px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap truncate">
              <CalendarBlank size={12} weight="bold" className="text-[#5850EC] shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Right Purple Gradient CTA Button */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#5850EC] to-[#7B5CFF] text-white text-xs font-black shadow-button flex items-center gap-1.5 group-hover:opacity-95 group-hover:scale-102 transition-all shrink-0">
            <span>{detailsLabel}</span>
            <ArrowRight size={12} weight="bold" />
          </div>
        </div>
      </div>
    </button>
  );
});
