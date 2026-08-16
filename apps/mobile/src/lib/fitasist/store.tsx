import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultState, loadState, saveState, today } from "./storage";
import type { AppNotification, FitState, HydrationLog } from "./types";

interface Ctx {
  state: FitState;
  update: (patch: Partial<FitState> | ((s: FitState) => Partial<FitState>)) => void;
  reset: () => void;
  todayKey: () => string;
  todayHydration: () => HydrationLog;
  updateHydration: (patch: Partial<HydrationLog>) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  clearNotifications: () => void;
  markAllRead: () => void;
}

const FitCtx = createContext<Ctx | null>(null);

export function FitProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FitState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (state.theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [state.theme]);

  const update = useCallback<Ctx["update"]>((patch) => {
    setState((s) => {
      const p = typeof patch === "function" ? patch(s) : patch;
      return { ...s, ...p };
    });
  }, []);

  const reset = useCallback(() => setState(defaultState), []);

  const todayKey = useCallback(() => today(state.simulatedDayOffset), [state.simulatedDayOffset]);

  const todayHydration = useCallback((): HydrationLog => {
    const k = today(state.simulatedDayOffset);
    return state.hydration[k] ?? { date: k, waterMl: 0, creatineG: 0, wheyG: 0, vitaminD: false };
  }, [state.hydration, state.simulatedDayOffset]);

  const updateHydration = useCallback(
    (patch: Partial<HydrationLog>) => {
      const k = today(state.simulatedDayOffset);
      const current = state.hydration[k] ?? { date: k, waterMl: 0, creatineG: 0, wheyG: 0, vitaminD: false };
      const next = { ...current, ...patch };
      update({ hydration: { ...state.hydration, [k]: next } });
    },
    [state.hydration, state.simulatedDayOffset, update],
  );

  const pushNotification: Ctx["pushNotification"] = useCallback((n) => {
    setState((s) => ({
      ...s,
      notifications: [
        {
          ...n,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ].slice(0, 50),
    }));
  }, []);

  const clearNotifications = useCallback(() => setState((s) => ({ ...s, notifications: [] })), []);
  const markAllRead = useCallback(
    () => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      update,
      reset,
      todayKey,
      todayHydration,
      updateHydration,
      pushNotification,
      clearNotifications,
      markAllRead,
    }),
    [state, update, reset, todayKey, todayHydration, updateHydration, pushNotification, clearNotifications, markAllRead],
  );

  return <FitCtx.Provider value={value}>{children}</FitCtx.Provider>;
}

export function useFit() {
  const ctx = useContext(FitCtx);
  if (!ctx) throw new Error("useFit must be used inside FitProvider");
  return ctx;
}
