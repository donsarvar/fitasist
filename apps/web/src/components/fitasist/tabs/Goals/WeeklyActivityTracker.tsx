import React from "react";
import type { Challenge } from "@/lib/fitasist/types";

interface WeeklyActivityTrackerProps {
  challenge?: Challenge;
  isTodayDone: boolean;
}

const WEEK_DAYS = [
  { key: "mon", label: "D", index: 1 },
  { key: "tue", label: "S", index: 2 },
  { key: "wed", label: "CH", index: 3 },
  { key: "thu", label: "P", index: 4 },
  { key: "fri", label: "J", index: 5 },
  { key: "sat", label: "SH", index: 6 },
  { key: "sun", label: "Y", index: 7 },
];

export const WeeklyActivityTracker = React.memo(function WeeklyActivityTracker({
  challenge,
  isTodayDone,
}: WeeklyActivityTrackerProps) {
  const doneCount = challenge?.completedDays.length || 0;
  const currentDayOfWeek = (() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  })();

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-primary">
          KUNLIK FAOLLIK
        </span>
      </div>

      <div className="glass-card rounded-[28px] px-3 py-4 border border-white/70 dark:border-white/10 shadow-glass">
        <div className="grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((day) => {
            const isPast = day.index < currentDayOfWeek;
            const isToday = day.index === currentDayOfWeek;
            const isCompleted = isToday ? isTodayDone : isPast && day.index <= (doneCount % 7 || (doneCount > 0 ? 7 : 0));

            return (
              <div
                key={day.key}
                className="flex flex-col items-center justify-center gap-2.5 py-1"
              >
                {/* Weekday letter */}
                <span className="text-[11px] font-bold text-text-muted">
                  {day.label}
                </span>

                {/* Dot / Circle matching the mockup */}
                <div className="relative grid place-items-center h-8 w-8">
                  {isCompleted ? (
                    <div className="h-7 w-7 rounded-full gradient-primary shadow-soft flex items-center justify-center text-white scale-100 transition-all">
                      <span className="h-2 w-2 rounded-full bg-white/90" />
                    </div>
                  ) : isToday ? (
                    <div className="h-7 w-7 rounded-full border-2 border-brand bg-brand/5 dark:bg-brand/20 flex items-center justify-center text-brand animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full border-2 border-border dark:border-white/15 bg-transparent flex items-center justify-center" />
                  )}
                </div>

                {/* Day index */}
                <span
                  className={
                    "text-[11px] font-bold tabular-nums " +
                    (isToday
                      ? "text-brand font-black"
                      : isCompleted
                        ? "text-text-primary"
                        : "text-text-muted")
                  }
                >
                  {day.index}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
