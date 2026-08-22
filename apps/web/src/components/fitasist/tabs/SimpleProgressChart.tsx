import { memo } from "react";
import { useFit } from "@/lib/fitasist/store";

interface ProgressChartProps {
  data: Array<{ w?: number; c?: number; b?: number; date: string }>;
}

export const SimpleProgressChart = memo(function SimpleProgressChart({ data }: ProgressChartProps) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const weights = data.map((d) => d.w).filter(Boolean) as number[];
  const maxW = Math.max(...weights, 1);
  const minW = Math.min(...weights, 0);
  const diffW = maxW - minW || 1;

  const width = 360;
  const height = 160;
  const padding = 20;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const getPoints = (vals: number[], min: number, diff: number) => {
    return vals
      .map((v, idx) => {
        const x = padding + (idx / (vals.length - 1)) * chartW;
        const y = padding + chartH - ((v - min) / diff) * chartH;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const weightPoints = weights.length > 1 ? getPoints(weights, minW, diffW) : "";

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="weightGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5C75FF" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#5C75FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="currentColor"
          className="text-border dark:text-white/10"
          strokeWidth="1"
          strokeDasharray="3"
        />
        <line
          x1={padding}
          y1={padding + chartH / 2}
          x2={width - padding}
          y2={padding + chartH / 2}
          stroke="currentColor"
          className="text-border dark:text-white/10"
          strokeWidth="1"
          strokeDasharray="3"
        />
        <line
          x1={padding}
          y1={padding + chartH}
          x2={width - padding}
          y2={padding + chartH}
          stroke="currentColor"
          className="text-border dark:text-white/10"
          strokeWidth="1"
        />

        {weights.length > 1 && (
          <>
            <path
              d={`M ${padding} ${padding + chartH} L ${weightPoints} L ${padding + chartW} ${padding + chartH} Z`}
              fill="url(#weightGrad)"
            />
            <polyline
              fill="none"
              stroke="#5C75FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={weightPoints}
            />
            {weights.map((v, idx) => {
              const x = padding + (idx / (weights.length - 1)) * chartW;
              const y = padding + chartH - ((v - minW) / diffW) * chartH;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#5C75FF"
                  strokeWidth="2"
                />
              );
            })}
          </>
        )}
      </svg>
      <div className="mt-3 flex items-center justify-between w-full text-[10px] font-bold text-text-muted px-2 tabular-nums">
        <span>{data[0]?.date}</span>
        <span className="text-brand">
          {lang === "ru"
            ? "Динамика веса (кг)"
            : lang === "en"
              ? "Weight trend (kg)"
              : "Vazn tendensiyasi (kg)"}
        </span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
});
