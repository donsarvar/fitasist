import { useMemo, useCallback } from "react";
import { useFit } from "@/lib/fitasist/store";
import type { Challenge } from "@/lib/fitasist/types";

export function useChallenges() {
  const { state, update, todayKey } = useFit();
  const challenges = state.challenges;

  const activeChallenges = useMemo(() => challenges.filter((c) => !c.completed), [challenges]);
  const completedChallenges = useMemo(() => challenges.filter((c) => c.completed), [challenges]);
  const mainChallenge = useMemo(() => activeChallenges[0], [activeChallenges]);

  const completeToday = useCallback((c: Challenge) => {
    const k = todayKey();
    if (c.completedDays.includes(k)) return false;
    const done = [...c.completedDays, k];
    const isDone = done.length >= c.duration;
    update({
      challenges: state.challenges.map((x) =>
        x.id === c.id ? { ...x, completedDays: done, completed: isDone } : x
      ),
    });
    return true;
  }, [state.challenges, todayKey, update]);

  const createChallenge = useCallback((form: { name: string; duration: number; dailyTarget: string; startDate: string }) => {
    if (!form.name.trim()) return;
    const ch: Challenge = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      duration: Number(form.duration) || 30,
      dailyTarget: form.dailyTarget,
      startDate: form.startDate,
      completedDays: [],
    };
    update({ challenges: [...state.challenges, ch] });
  }, [state.challenges, update]);

  return {
    challenges,
    activeChallenges,
    completedChallenges,
    mainChallenge,
    completeToday,
    createChallenge,
  };
}
