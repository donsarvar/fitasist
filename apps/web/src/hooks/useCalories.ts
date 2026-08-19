import { useMemo } from "react";
import { useFit } from "@/lib/fitasist/store";
import { calorieTargetKcal, proteinTargetG } from "@/lib/fitasist/coach";

export function useCalories() {
  const { state, todayHydration, todayKey } = useFit();
  const p = state.profile;
  const todayStr = todayKey();

  const calTarget = useMemo(() => calorieTargetKcal(p), [p]);
  const proteinTarget = useMemo(() => proteinTargetG(p), [p]);

  const todayLogs = useMemo(
    () => (state.foodLogs || []).filter((f) => f.date === todayStr),
    [state.foodLogs, todayStr]
  );

  const calDone = useMemo(
    () => todayLogs.reduce((sum, f) => sum + f.calories, 0),
    [todayLogs]
  );

  const h = todayHydration();
  const proteinDone = useMemo(
    () => Math.min(h.wheyG || 0, proteinTarget) + todayLogs.reduce((sum, f) => sum + f.protein, 0),
    [h.wheyG, proteinTarget, todayLogs]
  );

  const calPct = useMemo(
    () => Math.round((calDone / (calTarget || 2000)) * 100),
    [calDone, calTarget]
  );

  const proteinPct = useMemo(
    () => Math.round((proteinDone / (proteinTarget || 120)) * 100),
    [proteinDone, proteinTarget]
  );

  return {
    todayLogs,
    calTarget,
    calDone,
    calPct,
    proteinTarget,
    proteinDone,
    proteinPct,
  };
}
