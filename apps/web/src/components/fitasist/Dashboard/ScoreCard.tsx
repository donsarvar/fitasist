import { memo } from "react";
import { ArrowUp } from "@phosphor-icons/react";
import type { Language } from "@/lib/fitasist/types";
import { t } from "@/lib/fitasist/translations";
import { Card } from "../common/ui";

interface ScoreCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  ring: number;
  lang?: Language;
}

export const ScoreCard = memo(function ScoreCard({ label, value, sub, color, ring, lang }: ScoreCardProps) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <Card className="p-4 flex flex-col items-center h-full justify-between">
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{label}</div>
      <div className="relative mt-2 h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#EEF2F8" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * ring) / 100}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[15px] font-bold text-text-primary">{value}</div>
      </div>
      <div className="mt-2 text-[11px] font-medium" style={{ color }}>{sub}</div>
      <div className="mt-1 text-[10px] text-text-muted flex items-center gap-0.5"><ArrowUp size={10} weight="bold" className="text-success" />{t("pointsPlus", lang)}</div>
    </Card>
  );
});
