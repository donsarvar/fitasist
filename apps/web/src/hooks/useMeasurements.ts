import { useMemo, useCallback } from "react";
import { useFit } from "@/lib/fitasist/store";
import type { Measurement } from "@/lib/fitasist/types";

export function useMeasurements() {
  const { state, update } = useFit();
  const measurements = state.measurements;

  const latest = useMemo(() => measurements[measurements.length - 1], [measurements]);
  const prev = useMemo(() => measurements[measurements.length - 2], [measurements]);

  const saveMeasurement = useCallback((form: Partial<Measurement>) => {
    const rec: Measurement = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...form,
    };
    update({ measurements: [...state.measurements, rec] });
  }, [state.measurements, update]);

  const deleteMeasurement = useCallback((id: string) => {
    update({ measurements: state.measurements.filter((m) => m.id !== id) });
  }, [state.measurements, update]);

  const diff = useCallback((a?: number, b?: number) => {
    if (!a || !b) return null;
    return Math.round((a - b) * 10) / 10;
  }, []);

  return {
    measurements,
    latest,
    prev,
    saveMeasurement,
    deleteMeasurement,
    diff,
  };
}
