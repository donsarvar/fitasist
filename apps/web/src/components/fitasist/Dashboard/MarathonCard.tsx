import { memo } from "react";
import { ArrowRight, MapPin, Trophy } from "@phosphor-icons/react";
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

  const tagLabel =
    lang === "ru" ? "ГЛАВНЫЙ МАРАФОН" :
    lang === "en" ? "FEATURED RACE" :
    "ENG YAQIN MARAFON";

  const daysUnit =
    lang === "ru" ? "ДНЕЙ" :
    lang === "en" ? "DAYS" :
    "KUN QOLDI";

  const name =
    lang === "ru" ? (next.nameRu || next.nameUz || next.name) :
    lang === "en" ? next.name :
    (next.nameUz || next.name);

  return (
    <button
      onClick={onOpenMarathons}
      className="mt-4 w-full text-left rounded-3xl p-5 relative overflow-hidden isolate bg-gradient-to-br from-surface via-surface to-secondary-bg border border-border/80 dark:border-border/20 shadow-card active:scale-[0.98] transition-all group"
    >
      {/* Decorative Sport Track Background Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-brand/10 blur-2xl pointer-events-none group-hover:bg-brand/15 transition-all" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Left Side: Marathon Details */}
        <div className="flex-1 min-w-0">
          {/* Top Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl select-none">{next.flag}</span>
            <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[9px] font-black tracking-wider uppercase flex items-center gap-1">
              <Trophy size={10} weight="fill" />
              {tagLabel}
            </span>
          </div>

          {/* Race Name */}
          <h3 className="mt-2 text-[15px] font-black text-text-primary leading-tight tracking-tight line-clamp-1 group-hover:text-brand transition-colors">
            {name}
          </h3>

          {/* Location & Distance Tags */}
          <div className="mt-2 flex items-center flex-wrap gap-1.5 text-[11px] text-text-muted">
            <span className="flex items-center gap-0.5 font-medium">
              <MapPin size={12} weight="fill" className="text-brand shrink-0" />
              {next.city}, {next.country}
            </span>
            <span>•</span>
            <span className="font-semibold text-text-secondary">
              {next.distances.join(" / ")}
            </span>
          </div>
        </div>

        {/* Right Side: Digital Race Countdown Capsule */}
        <div className="shrink-0 flex flex-col items-center justify-center px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-brand/15 to-brand/5 border border-brand/20 shadow-xs min-w-[70px]">
          <span className="text-2xl font-black text-brand leading-none tracking-tight">
            {daysLeft}
          </span>
          <span className="text-[8px] font-black text-brand uppercase tracking-wider mt-1 opacity-90">
            {daysUnit}
          </span>
          <div className="mt-1 flex items-center text-[9px] font-bold text-brand/80 group-hover:translate-x-0.5 transition-transform">
            <ArrowRight size={10} weight="bold" />
          </div>
        </div>
      </div>
    </button>
  );
});
