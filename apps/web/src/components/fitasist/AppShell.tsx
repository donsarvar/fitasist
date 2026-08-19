import { useEffect, useRef, useState } from "react";
import {
  House, ChartBar, Trophy, Bell, Moon, Sun,
  ChatCircleText, Medal, User, GearSix,
} from "@phosphor-icons/react";
import { useFit } from "@/lib/fitasist/store";
import type { AppNotification } from "@/lib/fitasist/types";
import { t } from "@/lib/fitasist/translations";
import { auth } from "@/lib/firebase";
import { pingAIServer } from "@/lib/fitasist/aiService";

import { Login } from "./Login";
import { AdminDashboard } from "./AdminDashboard";
import { ChatPage } from "./ChatPage";
import { CalorieModal } from "./CalorieModal";
import { ProfilePage } from "./ProfilePage";
import { MarathonPage } from "./MarathonPage";
import { SettingsSheet } from "./SettingsSheet";

import { IconBtn } from "./common/ui";
import { ToastCard, NotifSheet } from "./common/NotifSheet";
import { DevPanel } from "./common/DevPanel";
import { DashboardTab } from "./Dashboard/DashboardTab";
import { StatsTab } from "./tabs/StatsTab";
import { ChallengesTab } from "./tabs/ChallengesTab";

type Tab = "dashboard" | "stats" | "challenges" | "marathons" | "profile";

export function AppShell() {
  const { state, update, todayHydration, updateHydration, pushNotification, user } = useFit();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [calorieOpen, setCalorieOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    pingAIServer();
    const handleOpenChat = () => setCoachOpen(true);
    window.addEventListener("fitasist:open-chat", handleOpenChat);
    return () => window.removeEventListener("fitasist:open-chat", handleOpenChat);
  }, []);

  const showToast = (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    const full: AppNotification = { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false };
    setToast(full);
    pushNotification(n);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  };

  // Water reminder every 10 minutes
  useEffect(() => {
    const id = window.setInterval(() => {
      const lang = state.profile?.language || "uz";
      showToast({ kind: "water", title: t("waterReminderTitle", lang), body: t("waterReminderBody", lang), action: t("waterReminderAction", lang) });
    }, 10 * 60 * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.profile?.language]);

  // Creatine kidney alert
  useEffect(() => {
    const h = todayHydration();
    if (h.creatineG > 0 && h.waterMl / 1000 < 2.0) {
      const last = state.notifications.find((n) => n.kind === "creatine");
      const recently = last && Date.now() - new Date(last.createdAt).getTime() < 30 * 60 * 1000;
      if (!recently) {
        const lang = state.profile?.language || "uz";
        showToast({ kind: "creatine", title: t("creatineAlertTitle", lang), body: t("creatineAlertBody", lang), action: t("creatineAlertAction", lang) });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydration, state.profile?.language]);

  const unread = state.notifications.filter((n) => !n.read).length;
  const lang = state.profile?.language;

  const screen = (() => {
    switch (tab) {
      case "dashboard":
        return <DashboardTab onOpenChat={() => setCoachOpen(true)} onOpenCalorie={() => setCalorieOpen(true)} onOpenSettings={() => setSettingsOpen(true)} onOpenMarathons={() => setTab("marathons")} />;
      case "stats":
        return <StatsTab />;
      case "challenges":
        return <ChallengesTab />;
      case "marathons":
        return <MarathonPage lang={state.profile?.language || "uz"} />;
      case "profile":
        return <ProfilePage onOpenSettings={() => setSettingsOpen(true)} />;
    }
  })();

  const navItems = [
    { k: "dashboard" as const, icon: House, label: t("home", lang) },
    { k: "stats" as const, icon: ChartBar, label: t("stats", lang) },
    { k: "marathons" as const, icon: Medal, label: lang === "ru" ? "Марафон" : lang === "en" ? "Races" : "Marafon" },
    { k: "challenges" as const, icon: Trophy, label: t("goals", lang) },
    { k: "profile" as const, icon: User, label: lang === "ru" ? "Профиль" : lang === "en" ? "Profile" : "Profil" },
  ] as const;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-[480px] relative min-h-dvh pb-[calc(120px+env(safe-area-inset-bottom))]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 glass-header px-6 pt-[calc(12px+env(safe-area-inset-top))] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-white text-[13px] font-black shadow-button select-none">F</div>
            <span className="text-lg font-bold tracking-tight text-gradient-primary">FitAsist</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn onClick={() => update({ theme: state.theme === "dark" ? "light" : "dark" })}>
              {state.theme === "dark" ? <Sun size={18} weight="fill" /> : <Moon size={18} weight="fill" />}
            </IconBtn>
            <button onClick={() => setNotifOpen(true)} className="relative grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-[#12131a] shadow-soft border border-border dark:border-border/10 text-text-secondary dark:text-text-primary">
              <Bell size={16} weight="fill" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white grid place-items-center animate-pulse">{unread}</span>
              )}
            </button>
            <button onClick={() => setSettingsOpen(true)} className="relative h-9 w-9 rounded-full shadow-button border-2 border-brand overflow-hidden group shrink-0 active:scale-95 transition-all" title="Profil va Sozlamalar">
              {state.profile?.photoUrl || user?.photoURL ? (
                <img src={state.profile?.photoUrl || user?.photoURL || ""} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full gradient-primary text-white flex items-center justify-center font-bold text-xs">{state.profile?.fio?.charAt(0) || "P"}</div>
              )}
            </button>
          </div>
        </header>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="px-6 pt-4 animate-fade-in" key={tab}>{screen}</main>

        {/* ── Bottom Navigation ──────────────────────────────────────────── */}
        <nav className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px]">
          <div className="relative glass-nav rounded-[30px] shadow-card px-2 py-2 flex items-center justify-between border border-white/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.k;
              return (
                <button
                  key={item.k}
                  onClick={() => setTab(item.k)}
                  className={"relative flex flex-col items-center gap-0.5 rounded-full py-2 px-2.5 transition-all " + (active ? "text-white" : "text-[#6B7280] dark:text-text-muted")}
                >
                  {active && <span className="absolute inset-0 rounded-full gradient-primary shadow-button -z-0" />}
                  <Icon size={16} weight={active ? "fill" : "regular"} className="relative z-10" />
                  <span className="text-[9px] font-semibold relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Dev Panel ─────────────────────────────────────────────────── */}
        <DevPanel />

        {/* ── Toast ─────────────────────────────────────────────────────── */}
        {toast && (
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(92vw,440px)] animate-slide-down">
            <ToastCard n={toast} onClose={() => setToast(null)} />
          </div>
        )}

        {/* ── Floating AI Chat Button ────────────────────────────────────── */}
        {!coachOpen && (
          <button onClick={() => setCoachOpen(true)} className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full gradient-primary text-white shadow-hero hover:scale-105 active:scale-95 transition-transform">
            <ChatCircleText size={24} weight="fill" />
          </button>
        )}

        {/* ── Overlays / Modals ─────────────────────────────────────────── */}
        {settingsOpen && (
          <SettingsSheet onClose={() => setSettingsOpen(false)} onAdminClick={() => { setSettingsOpen(false); setAdminOpen(true); }} />
        )}
        {notifOpen && <NotifSheet onClose={() => setNotifOpen(false)} />}
        {coachOpen && <ChatPage onClose={() => setCoachOpen(false)} />}
        {calorieOpen && <CalorieModal onClose={() => setCalorieOpen(false)} />}
        {adminOpen && <AdminDashboard onClose={() => setAdminOpen(false)} />}
      </div>
    </div>
  );
}
