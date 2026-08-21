import { memo } from "react";
import { useFit } from "@/lib/fitasist/store";
import { getNearestRegionalMarathon, getDaysLeft } from "../MarathonPage";

interface Props {
  onOpenMarathons: () => void;
}

export const MarathonCard = memo(function MarathonCard({ onOpenMarathons }: Props) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const next = getNearestRegionalMarathon();

  if (!next) return null;

  const daysLeft = getDaysLeft(next.date);
  const headerLabel =
    lang === "ru" ? "БЛИЖАЙШИЙ МАРАФОН" :
    lang === "en" ? "NEAREST MARATHON" :
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
      className="mt-4 w-full p-4 rounded-3xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/25 shadow-soft flex items-center justify-between gap-3 active:scale-[0.98] transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl select-none">{next.flag}</div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{headerLabel}</span>
          <p className="text-sm font-bold text-text-primary mt-0.5 leading-tight">{name}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{next.city}, {next.country}</p>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl bg-brand/15 px-3 py-2 min-w-[62px]">
        <span className="text-xl font-black text-brand leading-tight">{daysLeft}</span>
        <span className="text-[8px] font-extrabold text-brand uppercase tracking-wider mt-0.5">{daysUnit}</span>
      </div>
    </button>
  );
});
