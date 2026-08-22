import { memo } from "react";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react";
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

  const daysUnit =
    lang === "ru" ? "ДНЕЙ ДО СТАРТА" :
    lang === "en" ? "DAYS TO GO" :
    "KUN QOLDI";

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

  // Formatted localized date (e.g., "5-sentabr, 2026")
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
      {/* High-Resolution Mountain Scene (Rich & Visible, minimal soft fade on left) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={bgImage}
          alt={name}
          className="w-full h-full object-cover object-right scale-100 group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-60"
        />
        {/* Soft Glass Layer on Left for Perfect Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent dark:from-[#12141c] dark:via-[#12141c]/70 dark:to-transparent" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10">
        {/* Top Header: Full Width Prominent Title */}
        <h3 className="text-[21px] font-black text-slate-900 dark:text-white leading-tight tracking-tight drop-shadow-xs max-w-[85%]">
          {name}
        </h3>

        {/* Distance Pills */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {next.distances.map((d, idx) => {
            const isPrimary = idx === 0 || (next.distances.length === 1);
            return (
              <span
                key={d}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all ${
                  isPrimary
                    ? "bg-[#5850EC] text-white shadow-xs"
                    : "bg-white/80 dark:bg-white/15 backdrop-blur-md text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/15 font-bold"
                }`}
              >
                {d}
              </span>
            );
          })}
        </div>

        {/* Bottom Row: Countdown & Date on Left, Batafsil Button on Bottom Right */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Countdown */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[38px] font-black leading-none text-[#4F46E5] dark:text-[#818CF8] tracking-tight">
                {daysLeft}
              </span>
              <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase leading-none">
                {daysUnit}
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>

            {/* Date Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              <CalendarBlank size={14} weight="bold" className="text-[#5850EC] shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Bottom Right: Batafsil Action Pill */}
          <div className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-white/15 backdrop-blur-md border border-slate-200/80 dark:border-white/20 shadow-xs flex items-center gap-1.5 text-[11px] font-extrabold text-[#4F46E5] dark:text-white group-hover:bg-[#5850EC] group-hover:text-white transition-all shrink-0">
            <span>{detailsLabel}</span>
            <ArrowRight size={12} weight="bold" />
          </div>
        </div>
      </div>
    </button>
  );
});
