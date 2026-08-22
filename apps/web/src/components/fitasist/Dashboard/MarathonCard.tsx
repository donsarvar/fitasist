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
      className="mt-4 w-full text-left rounded-[32px] overflow-hidden relative isolate bg-white dark:bg-surface border border-white/80 dark:border-white/[0.08] shadow-ring active-press transition-all group p-5 text-text-primary"
    >
      {/* High-Resolution Scenic Nature Scene (Pure clean photo, NO overlay route lines) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={bgImage}
          alt={name}
          className="w-full h-full object-cover object-right scale-100 group-hover:scale-105 transition-transform duration-700 opacity-95 dark:opacity-50"
        />
        {/* Soft Multi-Layer Glass Gradient from Left for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#141620] dark:via-[#141620]/90 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent dark:from-[#141620]/40 dark:via-transparent dark:to-transparent" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10">
        {/* Title: Pure & Bold across top */}
        <h3 className="text-[22px] font-black text-text-primary leading-[1.15] tracking-tight max-w-[65%] drop-shadow-2xs">
          {name}
        </h3>

        {/* Distance Pills: 3-column equal grid to fit 100% inside card with no cutoffs */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 w-full">
          {next.distances.map((d) => (
            <div
              key={d}
              className="px-2 py-1.5 rounded-xl flex items-center justify-center gap-1 bg-white/90 dark:bg-white/10 backdrop-blur-md text-text-primary border border-white/80 dark:border-white/10 shadow-ring min-w-0"
            >
              <Mountains
                size={12}
                weight="bold"
                className="text-text-muted shrink-0"
              />
              <span className="text-[10px] font-extrabold tracking-tight truncate text-center tabular-nums">
                {d}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Section: Clean Capsule with Number + KUN QOLDI underneath (Left) + Gradient CTA (Right) */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {/* Left Glass Capsule (No date, KUN QOLDI directly under number) */}
          <div className="bg-white/85 dark:bg-surface-elevated/90 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl py-2 px-3.5 shadow-glass flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary text-white flex items-center justify-center shadow-button shrink-0">
              <CalendarBlank size={16} weight="fill" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[24px] font-black text-brand tracking-tight leading-none tabular-nums">
                {daysLeft}
              </span>
              <span className="text-[8px] font-black uppercase text-text-muted tracking-wider mt-0.5 leading-none">
                {daysUnit}
              </span>
            </div>
          </div>

          {/* Right Purple Gradient CTA Button */}
          <div className="px-5 py-3 rounded-2xl gradient-primary text-white text-xs font-black shadow-button flex items-center gap-2 group-hover:opacity-95 transition-all shrink-0 select-none">
            <span>{detailsLabel}</span>
            <ArrowRight size={13} weight="bold" />
          </div>
        </div>
      </div>
    </button>
  );
});
