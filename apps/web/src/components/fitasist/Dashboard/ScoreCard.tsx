import { memo } from "react";
import { ArrowUp01Icon } from "hugeicons-react";
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

export const ScoreCard = memo(function ScoreCard({
  label,
  value,
  sub,
  color,
  ring,
  lang,
}: ScoreCardProps) {
  const r = 27;
  const c = 2 * Math.PI * r;
  const clampedRing = Math.max(0, Math.min(100, ring));
  const strokeOffset = c - (c * clampedRing) / 100;

  return (
    <Card className="p-4 flex flex-col items-center h-full justify-between relative overflow-hidden group">
      <div className="w-full text-left">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
      </div>

      <div className="relative my-2.5 h-[72px] w-[72px]">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-border dark:text-white/10"
            strokeWidth="5.5"
          />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={strokeOffset}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[15px] font-black text-text-primary tabular-nums tracking-tight">
          {value}
        </div>
      </div>

      <div className="text-center w-full">
        <div className="text-[12px] font-bold tabular-nums tracking-tight" style={{ color }}>
          {sub}
        </div>
        <div className="mt-1 text-[10px] font-semibold text-text-muted flex items-center justify-center gap-0.5">
          <ArrowUp01Icon size={11} className="text-success" />
          <span>{t("pointsPlus", lang)}</span>
        </div>
      </div>
    </Card>
  );
});

