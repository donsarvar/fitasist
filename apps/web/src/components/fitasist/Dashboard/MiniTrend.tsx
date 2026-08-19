import { memo } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export const MiniTrend = memo(function MiniTrend({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <div className="w-24 h-14">
      <ResponsiveContainer>
        <AreaChart data={pts}>
          <defs>
            <linearGradient id="mtg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4F6BFF" stopOpacity={0.35} />
              <stop offset="1" stopColor="#4F6BFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#4F6BFF" strokeWidth={2} fill="url(#mtg)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
