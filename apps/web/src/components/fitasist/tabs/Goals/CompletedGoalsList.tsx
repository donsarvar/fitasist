import React from "react";
import { Medal01Icon, CheckmarkCircle01Icon } from "hugeicons-react";
import type { Challenge } from "@/lib/fitasist/types";
import { fmtDate } from "@/lib/fitasist/storage";

interface CompletedGoalsListProps {
  challenges: Challenge[];
  lang?: string;
}

export const CompletedGoalsList = React.memo(function CompletedGoalsList({
  challenges,
  lang = "uz",
}: CompletedGoalsListProps) {
  if (challenges.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-muted">
          Yopilgan Maqsadlar ({challenges.length})
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl glass-card border border-white/70 dark:border-white/10 shadow-soft flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                <Medal01Icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-primary truncate">
                  {c.name}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  Yakunlandi: {fmtDate(c.startDate, lang)} • {c.duration} kunlik
                </div>
              </div>
            </div>

            <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 shrink-0">
              <CheckmarkCircle01Icon size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
