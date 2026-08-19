import { memo } from "react";
import { Card } from "../common/ui";

interface RingCardProps {
  label: string;
  value: string;
  sub: string;
  pct: number;
  tint: "brand" | "info" | "warning";
  onClick?: () => void;
}

export const RingCard = memo(function RingCard({ label, value, sub, pct, tint, onClick }: RingCardProps) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const gradId = `g-${tint}`;

  const content = (
    <Card className={`p-4 flex flex-col items-center h-full justify-between relative overflow-hidden transition-all ${onClick ? "border border-amber-500/30 hover:border-amber-500/60 shadow-soft" : ""}`}>
      <div className="flex items-center justify-between w-full">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{label}</div>
        {onClick && (
          <span className="text-[9px] font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10">Batafsil</span>
        )}
      </div>
      <div className="relative mt-2 h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
              {tint === "brand" ? (
                <>
                  <stop offset="0" stopColor="#4F6BFF" />
                  <stop offset="1" stopColor="#7B5CFF" />
                </>
              ) : tint === "warning" ? (
                <>
                  <stop offset="0" stopColor="#F97316" />
                  <stop offset="1" stopColor="#EAB308" />
                </>
              ) : (
                <>
                  <stop offset="0" stopColor="#38BDF8" />
                  <stop offset="1" stopColor="#4F6BFF" />
                </>
              )}
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r={r} fill="none" stroke="#EEF2F8" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * Math.min(100, pct)) / 100}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[13px] font-bold text-text-primary">{pct}%</div>
      </div>
      <div className="mt-2 text-[12px] font-bold text-text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{sub}</div>
    </Card>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full h-full transition-transform active:scale-98">
        {content}
      </button>
    );
  }
  return content;
});
