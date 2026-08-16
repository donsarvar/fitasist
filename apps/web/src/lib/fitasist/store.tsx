
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultState, saveState, today, loadState } from "./storage";
import type { AppNotification, Challenge, FitState, HydrationLog, Measurement } from "./types";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, query, deleteDoc, writeBatch } from "firebase/firestore";

interface Ctx {
  state: FitState;
  user: User | null;
  authLoading: boolean;
  profileLoading: boolean;
  update: (patch: Partial<FitState> | ((s: FitState) => Partial<FitState>)) => void;
  reset: () => void;
  logout: () => Promise<void>;
  todayKey: () => string;
  todayHydration: () => HydrationLog;
  updateHydration: (patch: Partial<HydrationLog>) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  clearNotifications: () => void;
  markAllRead: () => void;
  clearChat: (sessionId?: string) => Promise<void>;
}

const FitCtx = createContext<Ctx | null>(null);

export function FitProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FitState>(loadState);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Enforce Light Mode default on document element
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, [state.theme]);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        // Reset state to default if logged out
        setState(defaultState);
        setProfileLoading(false);
      } else {
        setProfileLoading(true);
      }
    });
    return unsubscribe;
  }, []);

  // Sync with Firestore in real-time when logged in
  useEffect(() => {
    if (!user) return;

    // 1. Sync User Profile doc
    const userDocRef = doc(db, "users", user.uid);
    const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile && user.email && !data.profile.email) {
          setDoc(userDocRef, {
            profile: { ...data.profile, email: user.email }
          }, { merge: true }).catch(err => console.error("Migration: Failed to add email to profile:", err));
        }
        setState((s) => {
          let nextProfile = s.profile;
          if (data.profile === null) {
            nextProfile = null;
          } else if (data.profile !== undefined) {
            nextProfile = { ...data.profile, email: data.profile.email || user.email };
          }
          return {
            ...s,
            profile: nextProfile,
            theme: "light",
            simulatedDayOffset: data.simulatedDayOffset !== undefined ? data.simulatedDayOffset : s.simulatedDayOffset,
          };
        });
        setProfileLoading(false);
      } else {
        if (!docSnap.metadata.fromCache) {
          setDoc(userDocRef, {
            profile: null,
            theme: "light",
            simulatedDayOffset: 0,
          }).catch(err => console.error("Firestore Initial Profile Doc Failed:", err));
          setProfileLoading(false);
        } else {
          setProfileLoading(false);
        }
      }
    }, (err: any) => {
      console.error("Firestore profile snapshot error:", err);
      setProfileLoading(false);
    });

    // Safety fallback: Unblock profileLoading after max 2.5 seconds regardless of network latency
    const profileSafetyTimer = setTimeout(() => {
      setProfileLoading(false);
    }, 2500);
    // 2. Sync Hydration logs collection
    const hydraCollRef = collection(db, "users", user.uid, "hydration");
    const unsubHydra = onSnapshot(hydraCollRef, (querySnap) => {
      const logs: Record<string, HydrationLog> = {};
      querySnap.forEach((doc) => {
        logs[doc.id] = doc.data() as HydrationLog;
      });
      setState((s) => ({ ...s, hydration: logs }));
    }, (err) => console.error("Firestore hydration snapshot error:", err));

    // 3. Sync Measurements collection
    const measCollRef = collection(db, "users", user.uid, "measurements");
    const unsubMeas = onSnapshot(measCollRef, (querySnap) => {
      const items: Measurement[] = [];
      querySnap.forEach((doc) => {
        items.push(doc.data() as Measurement);
      });
      // Sort measurements by date
      items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setState((s) => ({ ...s, measurements: items }));
    }, (err) => console.error("Firestore measurements snapshot error:", err));

    // 4. Sync Challenges collection
    const challCollRef = collection(db, "users", user.uid, "challenges");
    const unsubChall = onSnapshot(challCollRef, (querySnap) => {
      const items: Challenge[] = [];
      querySnap.forEach((doc) => {
        items.push(doc.data() as Challenge);
      });
      setState((s) => ({ ...s, challenges: items }));
    }, (err) => console.error("Firestore challenges snapshot error:", err));

    // 5. Sync Chat sessions collection (filters out soft-deleted sessions for user)
    const chatCollRef = collection(db, "users", user.uid, "chatSessions");
    const unsubChat = onSnapshot(chatCollRef, (querySnap) => {
      const items: any[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.deletedForUser) {
          items.push(data);
        }
      });
      
      setState((s) => {
        const mergedSessions = items.map((incoming) => {
          const local = s.chatSessions?.find((cs) => cs.id === incoming.id);
          if (local) {
            const localTime = new Date(local.updatedAt).getTime();
            const incomingTime = new Date(incoming.updatedAt).getTime();
            if (localTime > incomingTime) {
              return local; // Keep local session with newer modifications (e.g. local pending writes)
            }
          }
          return incoming;
        });
        
        mergedSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        if (JSON.stringify(s.chatSessions) === JSON.stringify(mergedSessions)) {
          return s;
        }
        return { ...s, chatSessions: mergedSessions };
      });
    }, (err) => console.error("Firestore chat sessions snapshot error:", err));

    // 6. Sync Food Logs collection
    const foodCollRef = collection(db, "users", user.uid, "foodLogs");
    const unsubFood = onSnapshot(foodCollRef, (querySnap) => {
      const items: any[] = [];
      querySnap.forEach((doc) => {
        items.push(doc.data());
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setState((s) => ({ ...s, foodLogs: items }));
    }, (err) => console.error("Firestore food logs snapshot error:", err));

    // 7. Sync Notifications collection
    const notifCollRef = collection(db, "users", user.uid, "notifications");
    const unsubNotif = onSnapshot(notifCollRef, (querySnap) => {
      const items: AppNotification[] = [];
      querySnap.forEach((doc) => {
        items.push(doc.data() as AppNotification);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setState((s) => ({ ...s, notifications: items }));
    }, (err) => console.error("Firestore notifications snapshot error:", err));

    return () => {
      clearTimeout(profileSafetyTimer);
      unsubProfile();
      unsubHydra();
      unsubMeas();
      unsubChall();
      unsubChat();
      unsubFood();
      unsubNotif();
    };
  }, [user]);

  // Adjust theme class on HTML element
  useEffect(() => {
    if (state.theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [state.theme]);

  // Unified update logic that handles Firestore syncing and local state fallback
  const update = useCallback<Ctx["update"]>((patch) => {
    // 1. Update local state first
    let resolvedPatch: Partial<FitState> | undefined;
    setState((s) => {
      resolvedPatch = typeof patch === "function" ? patch(s) : patch;
      return { ...s, ...resolvedPatch };
    });

    // 2. Sync to Firestore synchronously (prevents microtask race conditions)
    if (user && resolvedPatch) {
      const p = resolvedPatch;
      const userDocRef = doc(db, "users", user.uid);

      // Sync main fields (profile details, theme)
      if ("profile" in p || "theme" in p || "simulatedDayOffset" in p) {
        setDoc(userDocRef, {
          ...(p.profile !== undefined ? { profile: p.profile } : {}),
          ...(p.theme !== undefined ? { theme: p.theme } : {}),
          ...(p.simulatedDayOffset !== undefined ? { simulatedDayOffset: p.simulatedDayOffset } : {}),
        }, { merge: true }).catch(err => console.error("Firestore Profile Update Failed:", err));
      }

      // Sync hydration logs if patch contains a map update
      if ("hydration" in p) {
        Object.entries(p.hydration || {}).forEach(([date, log]) => {
          const hDoc = doc(db, "users", user.uid, "hydration", date);
          if (log) {
            setDoc(hDoc, log).catch(err => console.error("Firestore Hydration Log Failed:", err));
          }
        });
      }

      // Sync measurements if modified
      if ("measurements" in p && p.measurements) {
        p.measurements.forEach((m) => {
          const mDoc = doc(db, "users", user.uid, "measurements", m.id);
          setDoc(mDoc, m).catch(err => console.error("Firestore Measurement Log Failed:", err));
        });
      }

      // Sync challenges if modified
      if ("challenges" in p && p.challenges) {
        p.challenges.forEach((c) => {
          const cDoc = doc(db, "users", user.uid, "challenges", c.id);
          setDoc(cDoc, c).catch(err => console.error("Firestore Challenge Log Failed:", err));
        });
      }

      // Sync chat sessions if modified
      if ("chatSessions" in p && p.chatSessions) {
        p.chatSessions.forEach((s) => {
          const sDoc = doc(db, "users", user.uid, "chatSessions", s.id);
          setDoc(sDoc, s).catch(err => console.error("Firestore Chat Session Save Failed:", err));
        });
      }

      // Sync food logs if modified
      if ("foodLogs" in p && p.foodLogs) {
        p.foodLogs.forEach((f) => {
          const fDoc = doc(db, "users", user.uid, "foodLogs", f.id);
          setDoc(fDoc, f).catch(err => console.error("Firestore Food Log Save Failed:", err));
        });
      }
    }
  }, [user]);

  const reset = useCallback(async () => {
    if (user) {
      // Clear Firestore user sub-collections via batch or individual delete logic
      // For simplicity, we can reset profile document and clear state locally.
      // Firestore security rule handles profile document write.
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        profile: null,
        theme: "light",
        simulatedDayOffset: 0,
      });
      setState(defaultState);
    } else {
      setState(defaultState);
    }
  }, [user]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

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
    if (!user) return;
    const id = crypto.randomUUID();
    const newNotif: AppNotification = {
      ...n,
      id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const notifDocRef = doc(db, "users", user.uid, "notifications", id);
    setDoc(notifDocRef, newNotif).catch(err => console.error("Firestore Notification Sync Failed:", err));
  }, [user]);

  const clearNotifications = useCallback(() => {
    if (!user) return;
    state.notifications.forEach((n) => {
      const notifDocRef = doc(db, "users", user.uid, "notifications", n.id);
      deleteDoc(notifDocRef).catch(err => console.error("Firestore Notification Delete Failed:", err));
    });
  }, [user, state.notifications]);

  const markAllRead = useCallback(() => {
    if (!user) return;
    state.notifications.forEach((n) => {
      if (!n.read) {
        const notifDocRef = doc(db, "users", user.uid, "notifications", n.id);
        setDoc(notifDocRef, { read: true }, { merge: true }).catch(err => console.error("Firestore Notification Update Failed:", err));
      }
    });
  }, [user, state.notifications]);

  const clearChat = useCallback(async (sessionId?: string) => {
    if (!user) {
      if (sessionId) {
        setState((s) => ({ ...s, chatSessions: s.chatSessions.filter(cs => cs.id !== sessionId) }));
      } else {
        setState((s) => ({ ...s, chatSessions: [] }));
      }
      return;
    }
    try {
      if (sessionId) {
        // Soft delete specific session for user (preserves document in Firestore for Admin!)
        setState((s) => ({ ...s, chatSessions: s.chatSessions.filter(cs => cs.id !== sessionId) }));
        const sDoc = doc(db, "users", user.uid, "chatSessions", sessionId);
        await setDoc(sDoc, { deletedForUser: true, updatedAt: new Date().toISOString() }, { merge: true });
      } else {
        // Soft delete all sessions for user
        setState((s) => ({ ...s, chatSessions: [] }));
        const { getDocs } = await import("firebase/firestore");
        const chatCollRef = collection(db, "users", user.uid, "chatSessions");
        const docsSnap = await getDocs(chatCollRef);
        const batch = writeBatch(db);
        docsSnap.forEach((dSnap) => {
          batch.update(dSnap.ref, { deletedForUser: true, updatedAt: new Date().toISOString() });
        });
        await batch.commit();
      }
    } catch (err) {
      console.error("Firestore Soft Delete Chat Failed:", err);
    }
  }, [user]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      user,
      authLoading,
      profileLoading,
      update,
      reset,
      logout,
      todayKey,
      todayHydration,
      updateHydration,
      pushNotification,
      clearNotifications,
      markAllRead,
      clearChat,
    }),
    [state, user, authLoading, profileLoading, update, reset, logout, todayKey, todayHydration, updateHydration, pushNotification, clearNotifications, markAllRead, clearChat],
  );

  return <FitCtx.Provider value={value}>{children}</FitCtx.Provider>;
}

export function useFit() {
  const ctx = useContext(FitCtx);
  if (!ctx) throw new Error("useFit must be used inside FitProvider");
  return ctx;
}
