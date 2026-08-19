import { memo } from "react";
import { useFit } from "@/lib/fitasist/store";
import { getNextMarathon, getDaysLeft } from "../MarathonPage";

interface Props {
  onOpenMarathons: () => void;
}

export const MarathonCard = memo(function MarathonCard({ onOpenMarathons }: Props) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const next = getNextMarathon();

  if (!next) return null;

  const daysLeft = getDaysLeft(next.date);
  const label =
    lang === "ru" ? "Ближайший марафон" :
    lang === "en" ? "Nearest Marathon" :
    "Eng yaqin marafon";
  const daysLabel =
    lang === "ru" ? `${daysLeft} дней` :
    lang === "en" ? `${daysLeft} days` :
    `${daysLeft} kun`;

  return (
    <button
      onClick={onOpenMarathons}
      className="mt-4 w-full p-4 rounded-3xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/25 shadow-soft flex items-center justify-between gap-3 active:scale-[0.98] transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl select-none">{next.flag}</div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{label}</span>
          <p className="text-sm font-bold text-text-primary mt-0.5 leading-tight">{next.nameUz}</p>
          <p className="text-[11px] text-text-muted">{next.city}</p>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl bg-brand/15 px-3 py-2 min-w-[56px]">
        <span className="text-xl font-black text-brand leading-tight">{daysLeft}</span>
        <span className="text-[9px] font-bold text-brand uppercase tracking-wide">{daysLabel}</span>
      </div>
    </button>
  );
});
