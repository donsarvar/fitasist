import { memo } from "react";
import { ArrowRight, MapPin, CalendarBlank } from "@phosphor-icons/react";
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
    "NEXT CHALLENGE";

  const daysUnit =
    lang === "ru" ? "DAYS TO GO" :
    lang === "en" ? "DAYS TO GO" :
    "DAYS TO GO";

  const detailsLabel =
    lang === "ru" ? "RACE DETAILS" :
    lang === "en" ? "RACE DETAILS" :
    "RACE DETAILS";

  const name =
    lang === "ru" ? (next.nameRu || next.nameUz || next.name) :
    lang === "en" ? next.name :
    (next.nameUz || next.name);

  // Background image based on the marathon
  const bgImage = next.image || "/marathons/skycamp.jpg";

  // Formatted Date
  const formattedDate = new Date(next.date).toLocaleDateString(
    lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  return (
    <button
      type="button"
      onClick={onOpenMarathons}
      className="mt-4 w-full text-left rounded-[32px] overflow-hidden relative isolate bg-white dark:bg-[#12141c] border border-slate-100 dark:border-white/5 shadow-card active:scale-[0.98] transition-all group p-5 pb-4 text-slate-900 dark:text-white"
    >
      {/* Right-Aligned Scenic Nature Scene with Multi-Stop Left Gradient Fade */}
      <div className="absolute top-0 right-0 bottom-0 w-[65%] pointer-events-none z-0 overflow-hidden">
        <img
          src={bgImage}
          alt={name}
          className="w-full h-full object-cover object-right scale-105 group-hover:scale-110 transition-transform duration-700 opacity-85 dark:opacity-40"
        />
        {/* Soft Multi-Stop Gradient Blend to Match Card Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#12141c] dark:via-[#12141c]/85 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent dark:from-[#12141c]/95 dark:via-transparent dark:to-transparent" />
      </div>

      {/* Topographic Route Trail from Left to the Peak on Right */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        viewBox="0 0 380 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Topo faint contour lines */}
        <path
          d="M 230 15 C 280 10, 330 40, 355 90"
          stroke="rgba(99, 102, 241, 0.12)"
          strokeWidth="1"
        />
        <path
          d="M 250 30 C 290 25, 325 50, 345 100"
          stroke="rgba(99, 102, 241, 0.08)"
          strokeWidth="1"
        />

        {/* Trail Route */}
        <path
          d="M 160 135 C 190 128, 205 145, 235 110 C 260 80, 275 95, 295 55"
          stroke="#6366F1"
          strokeWidth="2.5"
          strokeDasharray="4 5"
          strokeLinecap="round"
        />

        {/* Start Point */}
        <circle cx="160" cy="135" r="3.5" fill="#38BDF8" />

        {/* Peak Finish Flag */}
        <circle cx="295" cy="55" r="3.5" fill="#6366F1" />
        <text x="290" y="42" fontSize="13">🚩</text>
      </svg>

      {/* Main Content (Left Aligned, Clean & Legible) */}
      <div className="relative z-10">
        {/* Top Tag Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#5850EC] text-[10px] font-black tracking-wider uppercase text-white shadow-xs">
          <span>{badgeText}</span>
        </div>

        {/* Marathon Title */}
        <h3 className="mt-2 text-[20px] font-black text-slate-900 dark:text-white leading-tight tracking-tight max-w-[75%]">
          {name}
        </h3>

        {/* Distance Pills */}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {next.distances.map((d, idx) => {
            const isPrimary = idx === 0 || (next.distances.length === 1);
            return (
              <span
                key={d}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  isPrimary
                    ? "bg-[#6366F1] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/90 border border-slate-200/60 dark:border-white/10"
                }`}
              >
                {d}
              </span>
            );
          })}
        </div>

        {/* Big Days Countdown & Location Info */}
        <div className="mt-3.5 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[38px] font-black leading-none text-[#4F46E5] dark:text-[#818CF8] tracking-tight">
                {daysLeft}
              </span>
              <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-400 uppercase leading-none">
                {daysUnit}
              </span>
            </div>
            {/* Location & Date */}
            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin size={11} weight="fill" className="text-[#6366F1]" />
                {next.city}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <CalendarBlank size={11} weight="bold" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Clean Right Action Link */}
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#4F46E5] dark:text-[#818CF8] group-hover:translate-x-0.5 transition-all">
            <span>{detailsLabel}</span>
            <ArrowRight size={12} weight="bold" />
          </div>
        </div>
      </div>
    </button>
  );
});
