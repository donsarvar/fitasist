import { useEffect, useRef, useState } from "react";
import { Home01Icon, Analytics01Icon, RunningShoesIcon, Target02Icon, User02Icon, Moon02Icon, Sun01Icon, Notification01Icon, Comment01Icon } from "hugeicons-react";
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
    { k: "dashboard" as const, icon: Home01Icon, label: t("home", lang) },
    { k: "stats" as const, icon: Analytics01Icon, label: t("stats", lang) },
    { k: "marathons" as const, icon: RunningShoesIcon, label: lang === "ru" ? "Марафон" : lang === "en" ? "Races" : "Marafon" },
    { k: "challenges" as const, icon: Target02Icon, label: t("goals", lang) },
    { k: "profile" as const, icon: User02Icon, label: lang === "ru" ? "Профиль" : lang === "en" ? "Profile" : "Profil" },
  ] as const;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-[480px] relative min-h-dvh pb-[calc(120px+env(safe-area-inset-bottom))]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 glass-header px-6 pt-[calc(12px+env(safe-area-inset-top))] pb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-white text-[13px] font-black shadow-button select-none">
              F
            </div>
            <span className="text-lg font-black tracking-tight text-gradient-primary">FitAsist</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn onClick={() => update({ theme: state.theme === "dark" ? "light" : "dark" })}>
              {state.theme === "dark" ? <Sun01Icon size={18} /> : <Moon02Icon size={18} />}
            </IconBtn>
            <button
              onClick={() => setNotifOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-full bg-white/90 dark:bg-surface-elevated/90 backdrop-blur-md shadow-ring border border-white/60 dark:border-white/10 text-text-secondary dark:text-text-primary active-press transition-all"
            >
              <Notification01Icon size={18} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[9px] font-black text-white grid place-items-center animate-pulse tabular-nums">
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="relative h-9 w-9 rounded-full shadow-ring border-2 border-brand/60 overflow-hidden shrink-0 active-press transition-all"
              title="Profil va Sozlamalar"
            >
              {state.profile?.photoUrl || user?.photoURL ? (
                <img
                  src={state.profile?.photoUrl || user?.photoURL || ""}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full gradient-primary text-white flex items-center justify-center font-black text-xs">
                  {state.profile?.fio?.charAt(0) || "P"}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="px-6 pt-4 animate-fade-in" key={tab}>
          {screen}
        </main>

        {/* ── Bottom Navigation ──────────────────────────────────────────── */}
        <nav className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px]">
          <div className="relative glass-nav rounded-[32px] shadow-glass px-2.5 py-2 flex items-center justify-between border border-white/70 dark:border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.k;
              return (
                <button
                  key={item.k}
                  onClick={() => setTab(item.k)}
                  className={
                    "relative flex flex-col items-center gap-0.5 rounded-2xl py-2 px-3 transition-all select-none active-press " +
                    (active ? "text-white" : "text-text-muted hover:text-text-primary")
                  }
                >
                  {active && (
                    <span className="absolute inset-0 rounded-2xl gradient-primary shadow-button -z-0" />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="text-[9px] font-bold tracking-tight relative z-10">{item.label}</span>
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
          <button
            onClick={() => setCoachOpen(true)}
            className="fixed bottom-[calc(90px+env(safe-area-inset-bottom))] right-4 z-40 grid h-13 w-13 place-items-center rounded-full gradient-primary text-white shadow-hero active-press hover:scale-105 transition-all border border-white/30"
          >
            <Comment01Icon size={22} />
          </button>
        )}

        {/* ── Overlays / Modals ─────────────────────────────────────────── */}
        {settingsOpen && (
          <SettingsSheet
            onClose={() => setSettingsOpen(false)}
            onAdminClick={() => {
              setSettingsOpen(false);
              setAdminOpen(true);
            }}
          />
        )}
        {notifOpen && <NotifSheet onClose={() => setNotifOpen(false)} />}
        {coachOpen && <ChatPage onClose={() => setCoachOpen(false)} />}
        {calorieOpen && <CalorieModal onClose={() => setCalorieOpen(false)} />}
        {adminOpen && <AdminDashboard onClose={() => setAdminOpen(false)} />}
      </div>
    </div>
  );
}
