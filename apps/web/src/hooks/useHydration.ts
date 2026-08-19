import { useMemo, useCallback } from "react";
import { useFit } from "@/lib/fitasist/store";
import { hydrationTargetL } from "@/lib/fitasist/coach";
import type { HydrationLog } from "@/lib/fitasist/types";

export function useHydration() {
  const { state, todayHydration, updateHydration } = useFit();
  const profile = state.profile;
  const h: HydrationLog = todayHydration();

  const targetL = useMemo(() => hydrationTargetL(profile), [profile]);
  const doneL = useMemo(() => h.waterMl / 1000, [h.waterMl]);
  const pct = useMemo(() => Math.min(100, (doneL / (targetL || 2.5)) * 100), [doneL, targetL]);
  const creatineWarning = useMemo(() => h.creatineG > 0 && doneL < 2.0, [h.creatineG, doneL]);

  const addWater = useCallback((ml: number) => {
    updateHydration({ waterMl: Math.max(0, h.waterMl + ml) });
  }, [h.waterMl, updateHydration]);

  const updateSupplements = useCallback((patch: Partial<HydrationLog>) => {
    updateHydration(patch);
  }, [updateHydration]);

  return {
    hydration: h,
    targetL,
    doneL,
    pct,
    creatineWarning,
    addWater,
    updateSupplements,
  };
}
