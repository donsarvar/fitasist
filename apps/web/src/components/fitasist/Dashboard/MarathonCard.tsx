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

  return (
    <button
      type="button"
      onClick={onOpenMarathons}
      className="mt-4 w-full text-left rounded-[32px] overflow-hidden relative isolate bg-white dark:bg-[#12141c] border border-slate-100 dark:border-white/5 shadow-card active:scale-[0.98] transition-all group p-5 text-slate-900 dark:text-white"
    >
      {/* High-Resolution Scenic Nature Scene (Pure clean photo, NO overlay route lines) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={bgImage}
          alt={name}
          className="w-full h-full object-cover object-right scale-100 group-hover:scale-105 transition-transform duration-700 opacity-95 dark:opacity-60"
        />
        {/* Soft Multi-Layer Glass Gradient from Left for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#12141c] dark:via-[#12141c]/80 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent dark:from-[#12141c]/30 dark:via-transparent dark:to-transparent" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10">
        {/* Title: Pure & Bold across top */}
        <h3 className="text-[22px] font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight max-w-[65%] drop-shadow-2xs">
          {name}
        </h3>

        {/* Distance Pills with Mountain Icons */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {next.distances.map((d, idx) => {
            const isPrimary = idx === 0 || next.distances.length === 1;
            return (
              <div
                key={d}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 ${
                  isPrimary
                    ? "bg-gradient-to-r from-[#5850EC] to-[#7B5CFF] text-white shadow-button"
                    : "bg-white/90 dark:bg-white/10 backdrop-blur-md text-slate-800 dark:text-white/90 border border-white/80 dark:border-white/10 shadow-2xs"
                }`}
              >
                <Mountains
                  size={13}
                  weight={isPrimary ? "fill" : "bold"}
                  className={isPrimary ? "text-white" : "text-slate-500 dark:text-slate-400"}
                />
                <span className="text-[10.5px] font-extrabold tracking-tight whitespace-nowrap">
                  {d}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Clean Capsule with Number + KUN QOLDI underneath (Left) + Gradient CTA (Right) */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {/* Left Glass Capsule (No date, KUN QOLDI directly under number) */}
          <div className="bg-white/85 dark:bg-black/40 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl py-2 px-3.5 shadow-glass flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5850EC] to-[#7B5CFF] text-white flex items-center justify-center shadow-xs shrink-0">
              <CalendarBlank size={16} weight="fill" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[24px] font-black text-[#5850EC] dark:text-[#818CF8] tracking-tight leading-none">
                {daysLeft}
              </span>
              <span className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mt-0.5 leading-none">
                {daysUnit}
              </span>
            </div>
          </div>

          {/* Right Purple Gradient CTA Button */}
          <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#5850EC] to-[#7B5CFF] text-white text-xs font-black shadow-button flex items-center gap-2 group-hover:opacity-95 group-hover:scale-102 transition-all shrink-0">
            <span>{detailsLabel}</span>
            <ArrowRight size={13} weight="bold" />
          </div>
        </div>
      </div>
    </button>
  );
});
