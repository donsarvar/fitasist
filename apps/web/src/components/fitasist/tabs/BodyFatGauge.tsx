import { memo } from "react";
import { useFit } from "@/lib/fitasist/store";

export const BodyFatGauge = memo(function BodyFatGauge({ value }: { value: number }) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const angle = Math.min(180, Math.max(0, (value / 35) * 180));
  const r = 70;
  const cx = 100;
  const cy = 100;
  const rad = ((180 - angle) * Math.PI) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy - r * Math.sin(rad);

  return (
    <div className="relative mx-auto w-56">
      <svg viewBox="0 0 200 120" className="w-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#5C75FF" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="currentColor"
          className="text-border dark:text-white/10"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * Math.PI * r} 500`}
        />
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="currentColor"
          className="text-text-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="6" fill="currentColor" className="text-text-primary" />
      </svg>
      <div className="absolute inset-x-0 -bottom-2 text-center">
        <div className="text-4xl font-extrabold text-text-primary tabular-nums tracking-tight">
          {value}
          <span className="text-lg text-text-muted font-bold">%</span>
        </div>
        <div className="text-xs text-brand font-bold uppercase tracking-wider mt-0.5">
          {lang === "ru" ? "Жир тела" : lang === "en" ? "Body fat" : "Tana yog'i"}
        </div>
      </div>
    </div>
  );
});
