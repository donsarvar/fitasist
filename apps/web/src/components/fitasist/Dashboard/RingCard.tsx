import { memo } from "react";
import { Card, PillBadge } from "../common/ui";

interface RingCardProps {
  label: string;
  value: string;
  sub: string;
  pct: number;
  tint: "brand" | "info" | "warning";
  onClick?: () => void;
}

export const RingCard = memo(function RingCard({
  label,
  value,
  sub,
  pct,
  tint,
  onClick,
}: RingCardProps) {
  const r = 27;
  const c = 2 * Math.PI * r;
  const clampedPct = Math.max(0, Math.min(100, pct));
  const strokeOffset = c - (c * clampedPct) / 100;
  const gradId = `g-${tint}`;

  const colors =
    tint === "brand"
      ? { start: "#5C75FF", end: "#8B5CF6", track: "rgba(92, 117, 255, 0.12)" }
      : tint === "warning"
        ? { start: "#F59E0B", end: "#EF4444", track: "rgba(245, 158, 11, 0.12)" }
        : { start: "#0EA5E9", end: "#3B82F6", track: "rgba(14, 165, 233, 0.12)" };

  const content = (
    <Card
      className={`p-4 flex flex-col items-center h-full justify-between relative overflow-hidden transition-all group ${
        onClick ? "hover:border-brand/40" : ""
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        {onClick && (
          <PillBadge tint={tint === "warning" ? "warning" : tint === "brand" ? "brand" : "neutral"}>
            Ko'rish
          </PillBadge>
        )}
      </div>

      <div className="relative my-2.5 h-[72px] w-[72px]">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
            <filter id={`glow-${tint}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={colors.track}
            strokeWidth="5.5"
          />

          {/* Foreground Animated Ring */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={strokeOffset}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 grid place-items-center text-[13px] font-black text-text-primary tabular-nums tracking-tight">
          {clampedPct}%
        </div>
      </div>

      <div className="text-center w-full">
        <div className="text-[13px] font-bold text-text-primary tabular-nums tracking-tight">{value}</div>
        <div className="text-[10px] font-medium text-text-muted tabular-nums mt-0.5">{sub}</div>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full h-full active-press block">
        {content}
      </button>
    );
  }
  return content;
});
