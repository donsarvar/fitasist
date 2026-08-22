import React from "react";
import { CheckmarkCircle01Icon, Target02Icon, FireIcon } from "hugeicons-react";
import type { Challenge } from "@/lib/fitasist/types";

interface ActiveGoalCardProps {
  c: Challenge;
  onDo: () => void;
  isTodayDone: boolean;
}

export const ActiveGoalCard = React.memo(function ActiveGoalCard({
  c,
  onDo,
  isTodayDone,
}: ActiveGoalCardProps) {
  const done = c.completedDays.length;
  const pct = Math.min(100, Math.round((done / c.duration) * 100));
  const remaining = Math.max(0, c.duration - done);

  return (
    <div className="glass-card rounded-[32px] p-6 relative overflow-hidden border border-white/80 dark:border-white/10 shadow-glass transition-all">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-brand/10 dark:bg-brand/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-indigo/10 dark:bg-brand-indigo/15 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top meta row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand">
              Faol Maqsad
            </span>
            <h2 className="text-2xl font-black text-text-primary mt-1 tracking-tight leading-snug">
              {c.name}
            </h2>
            <p className="text-xs font-semibold text-text-muted mt-0.5">
              {done} / {c.duration} kun {c.dailyTarget ? `• ${c.dailyTarget}` : ""}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-3xl font-black text-text-primary tabular-nums tracking-tight">
              {pct}%
            </div>
            <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
              Bajarildi
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 w-full h-3 rounded-full bg-secondary-bg/80 dark:bg-white/10 overflow-hidden p-0.5 relative border border-border/40 dark:border-white/5">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-700 shadow-sm"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Bottom meta stats */}
        <div className="mt-3.5 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
            <FireIcon size={16} className="text-amber-500 animate-pulse" />
            <span>{done} kunlik streak</span>
          </div>
          <span className="text-text-muted font-medium">
            {remaining > 0 ? `${remaining} kun qoldi` : "Maqsad yakunlandi! 🎉"}
          </span>
        </div>

        {/* Check-in button */}
        <button
          type="button"
          onClick={onDo}
          disabled={isTodayDone}
          className={
            "mt-5 w-full h-13 rounded-2xl text-sm font-bold shadow-button transition-all active-press flex items-center justify-center gap-2 " +
            (isTodayDone
              ? "bg-emerald-500 text-white cursor-default opacity-95"
              : "gradient-primary text-white hover:opacity-95")
          }
        >
          {isTodayDone ? (
            <>
              <CheckmarkCircle01Icon size={20} />
              <span>Bugun uchun bajarildi! ✅</span>
            </>
          ) : (
            <>
              <Target02Icon size={20} />
              <span>Bugun bajardim! 🎯</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});
