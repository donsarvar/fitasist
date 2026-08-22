import { useState } from "react";
import { Add01Icon, Target02Icon } from "hugeicons-react";
import { useFit } from "@/lib/fitasist/store";
import { useChallenges } from "@/hooks/useChallenges";
import type { Challenge } from "@/lib/fitasist/types";
import { ActiveGoalCard } from "./Goals/ActiveGoalCard";
import { WeeklyActivityTracker } from "./Goals/WeeklyActivityTracker";
import { AchievementsSection } from "./Goals/AchievementsSection";
import { NewGoalSheet } from "./Goals/NewGoalSheet";
import { CompletedGoalsList } from "./Goals/CompletedGoalsList";
import { IconBtn } from "../common/ui";

export function ChallengesTab() {
  const { state, todayKey } = useFit();
  const {
    activeChallenges,
    completedChallenges,
    mainChallenge,
    completeToday,
    createChallenge,
  } = useChallenges();

  const lang = state.profile?.language || "uz";
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const isTodayDone = mainChallenge
    ? mainChallenge.completedDays.includes(todayKey())
    : false;

  const handleDoToday = (c: Challenge) => {
    const success = completeToday(c);
    if (success) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2500);
    }
  };

  return (
    <div className="pb-8">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <h1 className="text-[28px] font-black text-text-primary tracking-tight leading-tight">
            Maqsadlar
          </h1>
          <p className="text-xs font-semibold text-text-muted mt-1 leading-relaxed">
            Har bir kun sizni maqsadingizga yaqinlashtiradi.
          </p>
        </div>
        <IconBtn
          onClick={() => setSheetOpen(true)}
          title="Yangi maqsad qo'shish"
          className="mt-1 shrink-0"
        >
          <Add01Icon size={18} className="text-brand" />
        </IconBtn>
      </div>

      {/* ── Active Goal Card ────────────────────────────────────────── */}
      <div className="mt-5">
        {mainChallenge ? (
          <ActiveGoalCard
            c={mainChallenge}
            onDo={() => handleDoToday(mainChallenge)}
            isTodayDone={isTodayDone}
          />
        ) : (
          <div className="glass-card rounded-[32px] p-8 text-center border border-white/80 dark:border-white/10 shadow-glass">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-brand mx-auto mb-3 shadow-inner">
              <Target02Icon size={32} />
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Faol maqsadlar yo'q
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-[260px] mx-auto leading-relaxed">
              O'zingizga yangi chaqiruv qo'ying va natijaga erishing!
            </p>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="mt-5 px-6 h-12 rounded-2xl gradient-primary text-white text-xs font-bold shadow-button hover:opacity-95 active-press"
            >
              + Birinchi Maqsadni Qo'yish
            </button>
          </div>
        )}
      </div>

      {/* ── Daily Activity Tracker ─────────────────────────────────── */}
      {mainChallenge && (
        <WeeklyActivityTracker
          challenge={mainChallenge}
          isTodayDone={isTodayDone}
        />
      )}

      {/* ── Add Goal Capsule Button ────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="mt-4 w-full h-14 rounded-2xl glass-card border border-dashed border-brand/40 hover:border-brand bg-white/60 dark:bg-white/5 flex items-center justify-center gap-2.5 text-xs font-extrabold text-brand shadow-soft transition-all active-press"
      >
        <div className="grid h-7 w-7 place-items-center rounded-xl bg-brand/10 text-brand">
          <Add01Icon size={16} />
        </div>
        <span>Yangi maqsad qo'shish</span>
      </button>

      {/* ── Achievements Section ───────────────────────────────────── */}
      <AchievementsSection
        streak={mainChallenge?.completedDays.length || 0}
        completedGoalsCount={completedChallenges.length}
        hydrationDays={Object.keys(state.hydration || {}).length}
      />

      {/* ── Completed Goals ────────────────────────────────────────── */}
      <CompletedGoalsList challenges={completedChallenges} lang={lang} />

      {/* ── New Goal Sheet Modal ────────────────────────────────────── */}
      {sheetOpen && (
        <NewGoalSheet
          onClose={() => setSheetOpen(false)}
          onCreate={createChallenge}
          lang={lang}
        />
      )}

      {/* ── Confetti Celebration Overlay ───────────────────────────── */}
      {confetti && <ConfettiOverlay />}
    </div>
  );
}

function ConfettiOverlay() {
  const colors = ["#4F6BFF", "#7B5CFF", "#22C55E", "#F59E0B", "#38BDF8"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 1.4 + Math.random() * 1.2,
    color: colors[i % colors.length],
    w: 6 + Math.random() * 8,
    h: 8 + Math.random() * 12,
  }));

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: 0,
            width: p.w,
            height: p.h,
            background: p.color,
            animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
