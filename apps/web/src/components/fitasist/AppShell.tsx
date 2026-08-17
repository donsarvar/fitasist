import { useEffect, useMemo, useRef, useState } from "react";
import {
  House,
  ChartBar,
  Trophy,
  Drop,
  Bell,
  Moon,
  Sun,
  GearSix,
  PaperPlaneTilt,
  Sparkle,
  CaretDown,
  X,
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
  Warning,
  ChatCircleText,
  FastForward as FastForwardIcon,
  Database as DatabaseIcon,
  Lightning,
  Trash,
  DownloadSimple,
  UploadSimple,
  SignOut,
  ShieldCheck,
  Fire,
  ForkKnife,
  Target,
  Camera,
  User,
  PencilSimple,
  CalendarBlank,
  Medal,
  Ruler,
} from "@phosphor-icons/react";
import { useFit } from "@/lib/fitasist/store";
import { calcAge, calorieTargetKcal, coachReply, dailyAdvice, hydrationTargetL, proteinTargetG, bodyFatNavy } from "@/lib/fitasist/coach";
import type { AppNotification, Challenge, Measurement, Language } from "@/lib/fitasist/types";
import { fmtDate, today } from "@/lib/fitasist/storage";
import { Login } from "./Login";
import { AdminDashboard } from "./AdminDashboard";
import { ChatPage } from "./ChatPage";
import { CalorieModal } from "./CalorieModal";
import { ProfilePage } from "./ProfilePage";
import { MarathonPage, getNextMarathon, getDaysLeft } from "./MarathonPage";
import { t } from "@/lib/fitasist/translations";
import { auth } from "@/lib/firebase";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Area,
  AreaChart,
  XAxis,
  YAxis,
} from "recharts";

import { pingAIServer } from "@/lib/fitasist/aiService";

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

  // Water reminder every 10 minutes (uses real time, quick simulation demo)
  useEffect(() => {
    const id = window.setInterval(() => {
      const currentLang = state.profile?.language || "uz";
      showToast({
        kind: "water",
        title: t("waterReminderTitle", currentLang),
        body: t("waterReminderBody", currentLang),
        action: t("waterReminderAction", currentLang),
      });
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
        const currentLang = state.profile?.language || "uz";
        showToast({
          kind: "creatine",
          title: t("creatineAlertTitle", currentLang),
          body: t("creatineAlertBody", currentLang),
          action: t("creatineAlertAction", currentLang),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydration, state.profile?.language]);

  const unread = state.notifications.filter((n) => !n.read).length;

  const screen = (() => {
    switch (tab) {
      case "dashboard":
        return <Dashboard onOpenChat={() => setCoachOpen(true)} onOpenCalorie={() => setCalorieOpen(true)} onOpenSettings={() => setSettingsOpen(true)} onOpenMarathons={() => setTab("marathons")} />;
      case "stats":
        return <Stats />;
      case "challenges":
        return <Challenges />;
      case "marathons":
        return <MarathonPage lang={state.profile?.language || "uz"} />;
      case "profile":
        return <ProfilePage onOpenSettings={() => setSettingsOpen(true)} />;
    }
  })();

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-[480px] relative min-h-dvh pb-[calc(120px+env(safe-area-inset-bottom))]">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-header px-6 pt-[calc(12px+env(safe-area-inset-top))] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-white text-[13px] font-black shadow-button select-none">
              F
            </div>
            <span className="text-lg font-bold tracking-tight text-gradient-primary">FitAsist</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn onClick={() => update({ theme: state.theme === "dark" ? "light" : "dark" })}>
              {state.theme === "dark" ? <Sun size={18} weight="fill" /> : <Moon size={18} weight="fill" />}
            </IconBtn>
            <button
              onClick={() => setNotifOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-[#12131a] shadow-soft border border-border dark:border-border/10 text-text-secondary dark:text-text-primary"
            >
              <Bell size={16} weight="fill" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white grid place-items-center animate-pulse">
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="relative h-9 w-9 rounded-full shadow-button border-2 border-brand overflow-hidden group shrink-0 active:scale-95 transition-all"
              title="Profil & Sozlamalar"
            >
              {state.profile?.photoUrl || user?.photoURL ? (
                <img src={state.profile?.photoUrl || user?.photoURL || ""} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full gradient-primary text-white flex items-center justify-center font-bold text-xs">
                  {state.profile?.fio?.charAt(0) || "P"}
                </div>
              )}
            </button>
          </div>
        </header>

        <main className="px-6 pt-4 animate-fade-in" key={tab}>
          {screen}
        </main>

        <nav className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px]">
          <div className="relative glass-nav rounded-[30px] shadow-card px-2 py-2 flex items-center justify-between border border-white/60">
            {([
              { k: "dashboard", icon: House, label: t("home", state.profile?.language) },
              { k: "stats", icon: ChartBar, label: t("stats", state.profile?.language) },
              { k: "marathons", icon: Medal, label: state.profile?.language === "ru" ? "Марафон" : state.profile?.language === "en" ? "Races" : "Marafon" },
              { k: "challenges", icon: Trophy, label: t("goals", state.profile?.language) },
              { k: "profile", icon: User, label: state.profile?.language === "ru" ? "Профиль" : state.profile?.language === "en" ? "Profile" : "Profil" },
            ] as const).map((item) => {
              const Icon = item.icon;
              const active = tab === item.k;
              return (
                <button
                  key={item.k}
                  onClick={() => setTab(item.k as Tab)}
                  className={`relative flex flex-col items-center gap-0.5 rounded-full py-2 px-2.5 transition-all ${
                    active ? "text-white" : "text-[#6B7280] dark:text-text-muted"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full gradient-primary shadow-button -z-0" />
                  )}
                  <Icon size={16} weight={active ? "fill" : "regular"} className="relative z-10" />
                  <span className="text-[9px] font-semibold relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <DevPanel />

        {toast && (
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(92vw,440px)] animate-slide-down">
            <ToastCard n={toast} onClose={() => setToast(null)} />
          </div>
        )}

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
        
        {/* Floating AI Chat Button */}
        {!coachOpen && (
          <button 
            onClick={() => setCoachOpen(true)}
            className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full gradient-primary text-white shadow-hero hover:scale-105 active:scale-95 transition-transform"
          >
            <ChatCircleText size={24} weight="fill" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Reusable pieces ---------- */

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-[#12131a] shadow-soft border border-border dark:border-border/10 text-text-secondary dark:text-text-primary"
    >
      {children}
    </button>
  );
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-end justify-between">
      <h3 className="text-sm font-semibold text-text-secondary">{children}</h3>
      {action}
    </div>
  );
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-3xl bg-surface shadow-soft border border-border ${className}`}>{children}</div>;
}

/* ---------- Dashboard ---------- */

function Dashboard({ onOpenChat, onOpenCalorie, onOpenSettings, onOpenMarathons }: { onOpenChat: () => void; onOpenCalorie: () => void; onOpenSettings: () => void; onOpenMarathons: () => void }) {
  const { state, todayHydration, todayKey } = useFit();
  const p = state.profile;
  const todayStr = todayKey();

  const proteinTarget = proteinTargetG(p);
  const waterTarget = hydrationTargetL(p);
  const calTarget = calorieTargetKcal(p);

  const h = todayHydration();
  const todayLogs = (state.foodLogs || []).filter((f) => f.date === todayStr);
  const calDone = todayLogs.reduce((sum, f) => sum + f.calories, 0);

  const proteinDone = Math.min(h.wheyG || 0, proteinTarget) + todayLogs.reduce((sum, f) => sum + f.protein, 0);
  const waterDoneL = h.waterMl / 1000;

  const health = Math.max(50, Math.min(99, 70 + (h.waterMl / 1000 / waterTarget) * 15 + (calDone > 0 ? 10 : 0) + (h.wheyG > 0 ? 5 : 0)));

  const recent = useMemo(() => {
    const m = state.measurements.slice(-5);
    const lang = p?.language || "uz";
    if (m.length < 2) {
      if (lang === "ru") return "Введите параметры тела, чтобы увидеть еженедельные результаты.";
      if (lang === "en") return "Log your body measurements to unlock weekly insights.";
      return "Haftalik natijalaringizni ko'rish uchun tana o'lchovlarini kiriting.";
    }
    const first = m[0].weight;
    const last = m[m.length - 1].weight;
    if (first && last) {
      const diff = (last - first).toFixed(1);
      let trend = "";
      if (lang === "ru") {
        trend = Number(diff) < 0 ? `Вес снизился на ${Math.abs(Number(diff))}кг` : `Вес увеличился на ${diff}кг`;
        return `За последние ${m.length} записей ${trend}. Так держать!`;
      } else if (lang === "en") {
        trend = Number(diff) < 0 ? `Weight decreased by ${Math.abs(Number(diff))}kg` : `Weight increased by ${diff}kg`;
        return `Over the last ${m.length} logs, ${trend}. Keep it up!`;
      } else {
        trend = Number(diff) < 0 ? `Vazn ${Math.abs(Number(diff))}kg ga kamaydi` : `Vazn ${diff}kg ga ko'paydi`;
        return `${m.length} ta yozuv davomida ${trend}. Shunday davom eting!`;
      }
    }
    return "Nice consistency — keep logging to unlock deeper insights.";
  }, [state.measurements, p?.language]);

  return (
    <div>
      <div className="pt-2">
        <div className="text-xs font-medium text-text-muted">{t("goodMorning", p?.language)}</div>
        <h1 className="text-[26px] font-bold text-text-primary leading-tight">
          {t("hello", p?.language)} {p?.fio?.split(" ")[0] ?? t("friend", p?.language)}! <span className="animate-floaty inline-block">👋</span>
        </h1>
        <p className="mt-1 text-sm text-text-muted">{t("awesomeDay", p?.language)}</p>
      </div>

      {/* AI Hero */}
      <div className="mt-5 relative overflow-hidden isolate rounded-3xl gradient-mesh text-white shadow-hero p-5 flex flex-col gap-4">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/70 via-white/30 to-white/10 backdrop-blur-md border border-white/50 animate-ai-pulse" />
            <div className="absolute inset-5 rounded-full bg-white/80 blur-md" />
            <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ai-ring" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{t("coachAdviceHeader", p?.language)}</div>
            <div className="mt-1 rounded-2xl rounded-tl-md bg-white/15 backdrop-blur-md border border-white/20 p-3 text-[13px] leading-relaxed font-medium">
              {dailyAdvice(p)}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenChat}
          className="relative mt-1 w-full h-12 rounded-2xl bg-white text-brand text-xs font-bold shadow-button flex items-center justify-center gap-2 hover:bg-white/90 active:scale-98 transition-all"
        >
          <ChatCircleText size={16} weight="fill" className="text-brand" />
          {t("talkToCoach", p?.language)}
        </button>
      </div>

      {/* Nearest Marathon Card */}
      {(() => {
        const next = getNextMarathon();
        if (!next) return null;
        const daysLeft = getDaysLeft(next.date);
        const lang = p?.language || "uz";
        const label =
          lang === "ru" ? "Ближайший марафон" :
          lang === "en" ? "Nearest Marathon" :
          "Eng yaqin marafon";
        const daysLabel =
          lang === "ru" ? `${daysLeft} дней` :
          lang === "en" ? `${daysLeft} days` :
          `${daysLeft} kun`;
        return (
          <button
            onClick={onOpenMarathons}
            className="mt-4 w-full p-4 rounded-3xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/25 shadow-soft flex items-center justify-between gap-3 active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl select-none">{next.flag}</div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{label}</span>
                <p className="text-sm font-bold text-text-primary mt-0.5 leading-tight">{next.nameUz}</p>
                <p className="text-[11px] text-text-muted">{next.city}</p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl bg-brand/15 px-3 py-2 min-w-[56px]">
              <span className="text-xl font-black text-brand leading-tight">{daysLeft}</span>
              <span className="text-[9px] font-bold text-brand uppercase tracking-wide">{daysLabel}</span>
            </div>
          </button>
        );
      })()}

      {/* Personal Motivational Goal Banner */}
      {p?.goal ? (
        <div className="mt-4 p-4 rounded-3xl bg-surface border border-border dark:border-border/10 shadow-soft flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand font-bold text-base shrink-0">
              🎯
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Shaxsiy Maqsadingiz</span>
              <p className="text-xs font-bold text-text-primary mt-0.5 leading-snug">{p.goal}</p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-secondary-bg text-text-muted hover:text-brand transition-colors shrink-0"
            title="Maqsadni tahrirlash"
          >
            <PencilSimple size={16} weight="bold" />
          </button>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-3xl bg-surface border border-dashed border-border dark:border-border/20 shadow-soft flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-brand/10 text-brand font-bold text-sm shrink-0">
              🎯
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Shaxsiy maqsadingizni belgilang</p>
              <p className="text-[10px] text-text-muted">Masalan: "3 oyda 5 kg ozish!"</p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-2 rounded-xl bg-brand text-white text-xs font-bold shadow-button hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            Maqsad qo'yish
          </button>
        </div>
      )}

      <SectionTitle>{t("todaySummary", p?.language)}</SectionTitle>

      {/* 2x2 Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        <RingCard
          label="🔥 KALORIYA"
          value={`${calDone} kkal`}
          sub={`/ ${calTarget} kkal`}
          pct={Math.round((calDone / calTarget) * 100)}
          tint="warning"
          onClick={onOpenCalorie}
        />
        <RingCard
          label={t("protein", p?.language)}
          value={`${Math.round(proteinDone)}g`}
          sub={`/ ${proteinTarget}g`}
          pct={Math.round((proteinDone / proteinTarget) * 100)}
          tint="brand"
        />
        <RingCard
          label={t("waterIntake", p?.language)}
          value={`${waterDoneL.toFixed(1)}L`}
          sub={`/ ${waterTarget}L`}
          pct={Math.round((waterDoneL / waterTarget) * 100)}
          tint="info"
        />
        <ScoreCard
          label={t("healthScore", p?.language)}
          value={Math.round(health).toString()}
          sub={health >= 80 ? t("excellent", p?.language) : t("good", p?.language)}
          color="var(--success)"
          ring={health}
          lang={p?.language}
        />
      </div>

      <SectionTitle>{t("recentChanges", p?.language)}</SectionTitle>
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm text-text-secondary">{recent}</p>
          </div>
          <MiniTrend data={state.measurements.slice(-14).map((m) => m.weight ?? 0).filter(Boolean)} />
        </div>
      </Card>
    </div>
  );
}

function ScoreCard({ label, value, sub, color, ring, lang }: { label: string; value: string; sub: string; color: string; ring: number; lang?: Language }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <Card className="p-4 flex flex-col items-center h-full justify-between">
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{label}</div>
      <div className="relative mt-2 h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#EEF2F8" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * ring) / 100}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[15px] font-bold text-text-primary">{value}</div>
      </div>
      <div className="mt-2 text-[11px] font-medium" style={{ color }}>{sub}</div>
      <div className="mt-1 text-[10px] text-text-muted flex items-center gap-0.5"><ArrowUp size={10} weight="bold" className="text-success" />{t("pointsPlus", lang)}</div>
    </Card>
  );
}

function RingCard({ label, value, sub, pct, tint, onClick }: { label: string; value: string; sub: string; pct: number; tint: "brand" | "info" | "warning"; onClick?: () => void }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const gradId = `g-${tint}`;

  const content = (
    <Card className={`p-4 flex flex-col items-center h-full justify-between relative overflow-hidden transition-all ${onClick ? "border border-amber-500/30 hover:border-amber-500/60 shadow-soft" : ""}`}>
      <div className="flex items-center justify-between w-full">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{label}</div>
        {onClick && (
          <span className="text-[9px] font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10">Batafsil</span>
        )}
      </div>
      <div className="relative mt-2 h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
              {tint === "brand" ? (
                <>
                  <stop offset="0" stopColor="#4F6BFF" />
                  <stop offset="1" stopColor="#7B5CFF" />
                </>
              ) : tint === "warning" ? (
                <>
                  <stop offset="0" stopColor="#F97316" />
                  <stop offset="1" stopColor="#EAB308" />
                </>
              ) : (
                <>
                  <stop offset="0" stopColor="#38BDF8" />
                  <stop offset="1" stopColor="#4F6BFF" />
                </>
              )}
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r={r} fill="none" stroke="#EEF2F8" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * Math.min(100, pct)) / 100}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[13px] font-bold text-text-primary">{pct}%</div>
      </div>
      <div className="mt-2 text-[12px] font-bold text-text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{sub}</div>
    </Card>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full h-full transition-transform active:scale-98">
        {content}
      </button>
    );
  }
  return content;
}

function MiniTrend({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <div className="w-24 h-14">
      <ResponsiveContainer>
        <AreaChart data={pts}>
          <defs>
            <linearGradient id="mtg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4F6BFF" stopOpacity={0.35} />
              <stop offset="1" stopColor="#4F6BFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#4F6BFF" strokeWidth={2} fill="url(#mtg)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Measurements ---------- */

const measureGuides: Record<string, Record<Language, { title: string; body: string; icon: string }>> = {
  height: {
    uz: { title: "Bo'yni o'lchash tartibi", body: "Yalangoyoq holda devorga suyanib turing. To'g'riga qarang. Boshingiz tepasini belgilab, polgacha bo'lgan masofani o'lchang.", icon: "📏" },
    ru: { title: "Как измерить рост", body: "Стойте босиком у стены, глядя прямо перед собой. Отметьте верхнюю точку головы и измерьте расстояние до пола.", icon: "📏" },
    en: { title: "How to measure height", body: "Stand barefoot against a wall, looking straight ahead. Mark the top of your head and measure the distance to the floor.", icon: "📏" },
  },
  weight: {
    uz: { title: "Vaznni o'lchash tartibi", body: "Vazningizni ertalab, hojatxonadan keyin va och qoringa o'lchang. Har safar bitta tarozidan foydalaning.", icon: "⚖️" },
    ru: { title: "Как измерить вес", body: "Взвешивайтесь утром натощак после посещения туалета. Используйте одни и те же весы.", icon: "⚖️" },
    en: { title: "How to measure weight", body: "Weigh yourself in the morning on an empty stomach after using the restroom. Use the same scale each time.", icon: "⚖️" },
  },
  chest: {
    uz: { title: "Ko'krak aylanmasini o'lchash", body: "Nafasni to'liq chiqaring va ko'krakning eng keng qismini polga parallel ravishda o'lchang.", icon: "🫁" },
    ru: { title: "Как измерить обхват груди", body: "Сделайте полный выдох и измерьте самую широкую часть груди параллельно полу.", icon: "🫁" },
    en: { title: "How to measure chest", body: "Exhale completely and measure the widest part of your chest parallel to the floor.", icon: "🫁" },
  },
  biceps: {
    uz: { title: "Bilak (Biceps) o'lchash", body: "Qo'lingizni 90 darajada buking. Tasmani bilakning eng keng/semiz qismiga o'rang.", icon: "💪" },
    ru: { title: "Как измерить бицепс", body: "Согните руку под углом 90 градусов. Оберните ленту вокруг самой широкой части бицепса.", icon: "💪" },
    en: { title: "How to measure biceps", body: "Flex your arm at a 90-degree angle. Wrap the tape around the widest part of the biceps.", icon: "💪" },
  },
  waist: {
    uz: { title: "Bel aylanmasini o'lchash", body: "Tasmani kindikdan biroz yuqoriroqqa o'rang. Qorinni ichingizga tortmang, erkin turing.", icon: "📐" },
    ru: { title: "Как измерить талию", body: "Оберните ленту чуть выше пупка. Не втягивайте живот, стойте свободно.", icon: "📐" },
    en: { title: "How to measure waist", body: "Wrap the tape slightly above your belly button. Do not pull in your stomach, stand relaxed.", icon: "📐" },
  },
  thighs: {
    uz: { title: "Son aylanmasini o'lchash", body: "Tik turing. Sonning eng keng qismini tasma polga parallel ravishda o'lchang.", icon: "🦵" },
    ru: { title: "Как измерить обхват бедер", body: "Стойте прямо. Измерьте самую широкую часть бедра параллельно полу.", icon: "🦵" },
    en: { title: "How to measure thighs", body: "Stand straight. Measure the widest part of your thigh parallel to the floor.", icon: "🦵" },
  },
  neck: {
    uz: { title: "Bo'yin aylanmasini o'lchash", body: "Tasmani bo'g'izning pastki qismiga o'rang. Tasmani biroz pastga qarating.", icon: "🧣" },
    ru: { title: "Как измерить обхват шеи", body: "Оберните ленту ниже кадыка, слегка наклонив ленту вперед.", icon: "🧣" },
    en: { title: "How to measure neck", body: "Wrap the tape around the lower part of your neck, slightly sloping it down.", icon: "🧣" },
  },
};

function Measurements() {
  const { state, update } = useFit();
  const lang = state.profile?.language || "uz";
  const [mode, setMode] = useState<"log" | "history">("log");
  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Measurement>>({});

  const latest = state.measurements[state.measurements.length - 1];
  const prev = state.measurements[state.measurements.length - 2];

  const save = () => {
    const rec: Measurement = { id: crypto.randomUUID(), date: new Date().toISOString(), ...form };
    update({ measurements: [...state.measurements, rec] });
    setForm({});
  };

  const del = (id: string) => update({ measurements: state.measurements.filter((m) => m.id !== id) });

  const fields: Array<{ k: keyof Measurement; label: string; unit: string }> = [
    { k: "height", label: t("height", state.profile?.language), unit: "sm" },
    { k: "weight", label: t("weight", state.profile?.language), unit: "kg" },
    { k: "chest", label: t("chest", state.profile?.language), unit: "sm" },
    { k: "biceps", label: t("biceps", state.profile?.language), unit: "sm" },
    { k: "waist", label: t("waist", state.profile?.language), unit: "sm" },
    { k: "thighs", label: t("thighs", state.profile?.language), unit: "sm" },
    { k: "neck", label: t("neck", state.profile?.language), unit: "sm" },
  ];

  return (
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">{t("measurementsTitle", state.profile?.language)}</h1>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t("lastSummary", state.profile?.language)}</span>
          <span className="text-xs text-text-muted">{latest ? fmtDate(latest.date, state.profile?.language) : "—"}</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatBig label="kg" value={latest?.weight ?? "—"} diff={diff(latest?.weight, prev?.weight)} />
          <StatBig label="sm" value={latest?.chest ?? "—"} diff={diff(latest?.chest, prev?.chest)} sub={t("chest", state.profile?.language)} />
          <StatBig label="sm" value={latest?.biceps ?? "—"} diff={diff(latest?.biceps, prev?.biceps)} sub={t("wrist", state.profile?.language)} />
        </div>
      </Card>

      <div className="mt-5 rounded-2xl bg-secondary-bg p-1 flex">
        {(["log", "history"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
              mode === m ? "bg-white shadow-soft text-brand" : "text-text-muted"
            }`}
          >
            {m === "log" ? t("writeMeasurement", state.profile?.language) : t("history", state.profile?.language)}
          </button>
        ))}
      </div>

      {mode === "log" ? (
        <>
          <Card className="mt-5 divide-y divide-divider overflow-hidden">
            {fields.map((f) => (
              <div key={f.k as string} className="flex items-center gap-3 px-4 py-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary-bg text-brand text-lg">
                  {measureGuides[f.k as string][lang].icon}
                </div>
                <div className="flex-1 text-sm font-medium text-text-primary">{f.label}</div>
                <input
                  onFocus={() => setFocused(f.k as string)}
                  value={(form[f.k] as number | null) ?? ""}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value ? Number(e.target.value) : null })}
                  inputMode="decimal"
                  className="w-16 text-right bg-transparent text-sm font-semibold text-text-primary outline-none"
                />
                <span className="text-xs text-text-muted w-6">{f.unit}</span>
              </div>
            ))}
          </Card>

          <div className="mt-4">
            {focused ? (
              <Card className="p-5 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-white shadow-button text-3xl">
                    {measureGuides[focused][lang].icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-text-primary">{measureGuides[focused][lang].title}</h4>
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">{measureGuides[focused][lang].body}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary-bg text-brand text-lg">💡</div>
                <p className="text-xs text-text-muted flex-1">
                  {lang === "ru" 
                    ? "Нажмите на любую область, чтобы узнать, как правильно делать замеры." 
                    : lang === "en" 
                      ? "Click on any field to learn how to measure correctly." 
                      : "To'g'ri o'lchashni bilish uchun istalgan sohaga bosing."}
                </p>
              </Card>
            )}
          </div>

          <button onClick={save} className="mt-5 w-full h-14 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
            {lang === "ru" ? "Сохранить замеры" : lang === "en" ? "Save Measurements" : "O'lchovni saqlash"}
          </button>
        </>
      ) : (
        <div className="mt-5 space-y-3">
          {state.measurements.length === 0 && (
            <Card className="p-8 text-center text-sm text-text-muted">
              {lang === "ru" ? "Записей пока нет." : lang === "en" ? "No records yet." : "Hali yozuvlar yo'q."}
            </Card>
          )}
          {[...state.measurements].reverse().map((m) => (
            <Card key={m.id} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs font-semibold text-text-primary">{fmtDate(m.date, lang)}</div>
                <div className="mt-1 text-xs text-text-muted">
                  {m.weight ? `${m.weight}kg` : "—"} · {m.chest ? `${t("chest", lang)} ${m.chest}sm` : ""} {m.biceps ? `· ${t("wrist", lang)} ${m.biceps}sm` : ""}
                </div>
              </div>
              <button onClick={() => del(m.id)} className="grid h-8 w-8 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash size={16} weight="bold" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function diff(a?: number, b?: number) {
  if (!a || !b) return null;
  return Math.round((a - b) * 10) / 10;
}

function StatBig({ label, value, diff, sub }: { label: string; value: number | string; diff: number | null; sub?: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-text-primary tracking-tight">{value}</span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      {sub && <div className="text-[10px] text-text-muted uppercase tracking-wide">{sub}</div>}
      {diff !== null && (
        <div className={`mt-1 flex items-center text-[11px] font-medium ${diff < 0 ? "text-success" : "text-warning"}`}>
          {diff < 0 ? <ArrowDown size={12} weight="bold" /> : <ArrowUp size={12} weight="bold" />}
          {Math.abs(diff)}
        </div>
      )}
    </div>
  );
}

/* ---------- Challenges ---------- */

function Challenges() {
  const { state, update, todayKey } = useFit();
  const lang = state.profile?.language || "uz";
  const [showForm, setShowForm] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [form, setForm] = useState({ name: "", duration: 30, dailyTarget: "", startDate: today() });

  const active = state.challenges.filter((c) => !c.completed);
  const completed = state.challenges.filter((c) => c.completed);
  const main = active[0];

  const doToday = (c: Challenge) => {
    const k = todayKey();
    if (c.completedDays.includes(k)) return;
    const done = [...c.completedDays, k];
    const isDone = done.length >= c.duration;
    update({
      challenges: state.challenges.map((x) => (x.id === c.id ? { ...x, completedDays: done, completed: isDone } : x)),
    });
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2500);
  };

  const create = () => {
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
    setForm({ name: "", duration: 30, dailyTarget: "", startDate: today() });
    setShowForm(false);
  };

  return (
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">{t("goalsTitle", lang)}</h1>

      {main ? <ActiveChallengeCard c={main} onDo={() => doToday(main)} /> : (
         <Card className="mt-5 p-8 text-center">
           <Trophy size={40} weight="fill" className="mx-auto text-brand" />
           <p className="mt-3 text-sm text-text-muted">
             {lang === "ru" ? "Активных целей нет. Создайте новую ниже!" : lang === "en" ? "No active goals. Create one below!" : "Faol maqsadlar yo'q. Quyida yangisini yarating!"}
           </p>
         </Card>
       )}

      <SectionTitle>{t("createNewGoal", lang)}</SectionTitle>
      <Card className="p-4">
        <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-between text-sm font-semibold text-text-primary">
          <span className="flex items-center gap-2"><Plus size={16} weight="bold" className="text-brand" /> {t("addNewGoal", lang)}</span>
          <CaretDown size={16} weight="bold" className={`text-text-muted transition-transform ${showForm ? "rotate-180" : ""}`} />
        </button>
        {showForm && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Quick Templates */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                {lang === "ru" ? "Быстрые шаблоны" : lang === "en" ? "Quick Templates" : "Tezkor shablonlar"}
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  {
                    icon: <Trophy size={14} weight="fill" className="text-amber-500" />,
                    name: { uz: "Planka mashqi", ru: "Планка", en: "Plank Exercise" },
                    duration: 30,
                    dailyTarget: { uz: "2 daqiqa", ru: "2 минуты", en: "2 minutes" }
                  },
                  {
                    icon: <Lightning size={14} weight="fill" className="text-blue-500" />,
                    name: { uz: "Otjimaniya (Push-up)", ru: "Отжимания", en: "Push-ups" },
                    duration: 30,
                    dailyTarget: { uz: "50 marta", ru: "50 раз", en: "50 times" }
                  },
                  {
                    icon: <Ruler size={14} weight="fill" className="text-emerald-500" />,
                    name: { uz: "Kunlik yugurish", ru: "Ежедневный бег", en: "Daily Running" },
                    duration: 30,
                    dailyTarget: { uz: "3 km", ru: "3 км", en: "3 km" }
                  },
                  {
                    icon: <Drop size={14} weight="fill" className="text-sky-500" />,
                    name: { uz: "Suv ichish odati", ru: "Питье воды", en: "Water Intake" },
                    duration: 21,
                    dailyTarget: { uz: "2 litr", ru: "2 литра", en: "2 liters" }
                  }
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({
                      name: tpl.name[lang] || tpl.name.uz,
                      duration: tpl.duration,
                      dailyTarget: tpl.dailyTarget[lang] || tpl.dailyTarget.uz,
                      startDate: today()
                    })}
                    className="flex flex-col items-start p-3 rounded-xl border border-border/40 hover:border-brand/40 bg-secondary-bg/30 text-left active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-text-primary text-[11px] leading-tight">
                      {tpl.icon}
                      <span>{tpl.name[lang] || tpl.name.uz}</span>
                    </div>
                    <div className="mt-1 text-[9px] text-text-muted">
                      {tpl.duration} {lang === "ru" ? "дней" : lang === "en" ? "days" : "kun"} • {tpl.dailyTarget[lang] || tpl.dailyTarget.uz}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {lang === "ru" ? "Название цели" : lang === "en" ? "Goal Name" : "Maqsad nomi"}
                </span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === "ru" ? "например, 30 дней Планка" : lang === "en" ? "e.g., 30 Days Plank" : "masalan, 30 kun Plank"} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {lang === "ru" ? "Длительность (дней)" : lang === "en" ? "Duration (days)" : "Davomiyligi (kun)"}
                </span>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {lang === "ru" ? "Дата начала" : lang === "en" ? "Start Date" : "Boshlanish sanasi"}
                </span>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <label className="col-span-2 block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {lang === "ru" ? "Дневная задача" : lang === "en" ? "Daily task" : "Kunlik vazifa"}
                </span>
                <input value={form.dailyTarget} onChange={(e) => setForm({ ...form, dailyTarget: e.target.value })} placeholder={lang === "ru" ? "например, 50 раз" : lang === "en" ? "e.g., 50 times" : "masalan, 50 marta"} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <button onClick={create} className="col-span-2 h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
                {lang === "ru" ? "Создать цель" : lang === "en" ? "Create Goal" : "Maqsad yaratish"}
              </button>
            </div>
          </div>
        )}
      </Card>

      <SectionTitle>{t("completedGoals", lang)}</SectionTitle>
      {completed.length === 0 ? (
        <Card className="p-6 text-center space-y-2 border border-border">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 mx-auto font-bold text-xl">
            🏆
          </div>
          <h4 className="text-sm font-bold text-text-primary">Hali bajarilganlar yo'q</h4>
          <p className="text-xs text-text-muted">Birinchi maqsadingizni yakunlang va kuboklar vitrinasini boyiting!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {completed.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-3 bg-surface border border-border shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/15 text-amber-500 shrink-0 font-bold">
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text-primary truncate">{c.name}</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Yakunlandi: {fmtDate(c.startDate, lang)} • {c.duration} kun
                </div>
              </div>
              <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 shrink-0">
                <Check className="h-4 w-4" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {confetti && <ConfettiOverlay />}
    </div>
  );
}

function ActiveChallengeCard({ c, onDo }: { c: Challenge; onDo: () => void }) {
  const { state, todayKey } = useFit();
  const lang = state.profile?.language || "uz";
  const done = c.completedDays.length;
  const pct = Math.round((done / c.duration) * 100);
  const todayDone = c.completedDays.includes(todayKey());

  return (
    <Card className="mt-5 p-6 relative overflow-hidden gradient-mesh text-white border-none shadow-hero">
      <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Faol Maqsad</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-[10px] font-extrabold text-amber-200 flex items-center gap-1 shadow-xs">
              🔥 {done} kunlik seriya
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 leading-snug">{c.name}</h2>
          <p className="text-xs text-white/80 font-medium">{done}-kun / {c.duration} kun ({c.dailyTarget})</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-white leading-none">{pct}%</div>
          <div className="text-[9px] font-bold text-white/70 uppercase tracking-wider mt-1">Bajarildi</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full h-3 rounded-full bg-black/25 overflow-hidden p-0.5 relative z-10 border border-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 transition-all duration-700 shadow-sm"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Weekly Matrix Pill Trackers (7 Days) */}
      <div className="mt-5 pt-4 border-t border-white/15 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-white/90 mb-2">
          <span>Haftalik tartib</span>
          <span className="text-white/70">{done} / {c.duration} kun bajarildi</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {Array.from({ length: 7 }, (_, i) => {
            const isCompleted = i < done;
            const isCurrent = i === done && !todayDone;
            return (
              <div
                key={i}
                className={`py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-white/25 border-white/40 text-white shadow-soft font-bold"
                    : isCurrent
                    ? "bg-amber-400 text-slate-900 border-amber-300 font-extrabold scale-105 shadow-md"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider">{i + 1}-kun</span>
                <span className="text-xs mt-0.5">{isCompleted ? "✅" : isCurrent ? "🎯" : "⚪"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onDo}
        disabled={todayDone}
        className={`mt-5 w-full h-14 rounded-2xl text-sm font-extrabold shadow-button transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10 ${
          todayDone
            ? "bg-emerald-500 text-white cursor-default opacity-90"
            : "bg-white text-brand hover:bg-white/95"
        }`}
      >
        {todayDone ? (
          <>
            <Check className="h-5 w-5" />
            <span>Bugun uchun bajarildi! ✅</span>
          </>
        ) : (
          <>
            <Target className="h-5 w-5 text-brand" />
            <span>Bugun bajardim! 🎯</span>
          </>
        )}
      </button>
    </Card>
  );
}

function ConfettiOverlay() {
  const colors = ["#4F6BFF", "#7B5CFF", "#22C55E", "#F59E0B", "#38BDF8"];
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 1.4 + Math.random() * 1.2,
    color: colors[i % colors.length],
    w: 6 + Math.random() * 8,
    h: 8 + Math.random() * 14,
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

/* ---------- Hydration ---------- */

function Hydration() {
  const { state, todayHydration, updateHydration } = useFit();
  const lang = state.profile?.language || "uz";
  const [custom, setCustom] = useState<number | "">("");
  const h = todayHydration();
  const target = hydrationTargetL(state.profile);
  const doneL = h.waterMl / 1000;
  const pct = Math.min(100, (doneL / target) * 100);

  const add = (ml: number) => updateHydration({ waterMl: Math.max(0, h.waterMl + ml) });

  const warn = h.creatineG > 0 && doneL < 2.0;

  return (
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">{t("waterBalance", lang)}</h1>

      <Card className="mt-5 p-5">
        <div className="flex items-center gap-5">
          <WaterBottle pct={pct} />
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{t("today", lang)}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-text-primary">{doneL.toFixed(1)}</span>
              <span className="text-lg text-text-muted">/ {target}</span>
            </div>
            <div className="text-xs text-text-muted">
              {lang === "ru" ? "Литры" : lang === "en" ? "Liters" : "Litr"}
            </div>
            <div className="mt-3 text-lg font-bold text-gradient-primary">{Math.round(pct)}%</div>
            <div className="text-[11px] text-text-muted">{t("dailyGoal", lang)}</div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[250, 350, 500].map((v) => (
          <button
            key={v}
            onClick={() => add(v)}
            className="h-12 rounded-2xl bg-white border border-border text-brand text-sm font-bold shadow-soft"
          >
            +{v}ml
          </button>
        ))}
        <div className="relative">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom) {
                add(Number(custom));
                setCustom("");
              }
            }}
            placeholder={lang === "ru" ? "+Другое" : lang === "en" ? "+Other" : "+Boshqa"}
            className="w-full h-12 rounded-2xl border border-dashed border-brand/50 bg-brand/5 text-brand text-sm font-bold placeholder:text-brand/70 text-center outline-none"
          />
        </div>
      </div>

      <SectionTitle>{t("supplements", lang)}</SectionTitle>
      <Card className="p-4 divide-y divide-divider">
        <SuppRow label={t("creatine", lang)}>
          <input
            type="number"
            value={h.creatineG || ""}
            onChange={(e) => updateHydration({ creatineG: Number(e.target.value) || 0 })}
            placeholder="0"
            className="w-20 h-9 rounded-lg border border-border/80 dark:border-border/20 bg-secondary-bg/50 text-text-primary text-center px-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all font-semibold"
          />
        </SuppRow>
        <SuppRow label={t("proteinSupplement", lang)}>
          <input
            type="number"
            value={h.wheyG || ""}
            onChange={(e) => updateHydration({ wheyG: Number(e.target.value) || 0 })}
            placeholder="0"
            className="w-20 h-9 rounded-lg border border-border/80 dark:border-border/20 bg-secondary-bg/50 text-text-primary text-center px-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all font-semibold"
          />
        </SuppRow>
        <SuppRow label={t("vitaminD", lang)}>
          <button
            onClick={() => updateHydration({ vitaminD: !h.vitaminD })}
            className={`w-11 h-6 rounded-full relative transition-colors ${h.vitaminD ? "gradient-primary" : "bg-secondary-bg"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${h.vitaminD ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </SuppRow>
      </Card>

      {warn && (
        <div className="mt-5 rounded-3xl bg-warning/15 border border-warning/30 p-4 shadow-soft flex gap-3 animate-fade-in">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-warning text-white shrink-0">
            <Warning size={20} weight="fill" />
          </div>
          <p className="text-xs leading-relaxed text-[#7C4A03]">
            {lang === "ru" ? (
              <>
                <span className="font-bold">⚠️ Внимание!</span> Вы сегодня приняли {h.creatineG}г креатина, но на данный момент выпили всего {doneL.toFixed(1)} л воды. Чтобы избежать нагрузки на почки и обезвоживания, вам необходимо выпить еще как минимум {Math.max(0.3, 2.0 - doneL).toFixed(1)} л воды! 💧
              </>
            ) : lang === "en" ? (
              <>
                <span className="font-bold">⚠️ Warning!</span> You took {h.creatineG}g of creatine today, but have only drank {doneL.toFixed(1)} L of water so far. To prevent kidney strain and dehydration, you must drink at least another {Math.max(0.3, 2.0 - doneL).toFixed(1)} L of water! 💧
              </>
            ) : (
              <>
                <span className="font-bold">⚠️ Diqqat!</span> Siz bugun {h.creatineG}g Kreatin qabul qildingiz, lekin hozirgacha faqat {doneL.toFixed(1)} litr suv ichgansiz. Buyrakka yuklama tushmasligi va suvsizlanishning oldini olish uchun kamida yana {Math.max(0.3, 2.0 - doneL).toFixed(1)} litr suv ichishingiz shart! 💧
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function SuppRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 flex items-center justify-between">
      <span className="text-sm text-text-primary">{label}</span>
      {children}
    </div>
  );
}

function WaterBottle({ pct }: { pct: number }) {
  const fillY = 100 - pct;
  return (
    <div className="relative h-40 w-24">
      <svg viewBox="0 0 100 160" className="h-full w-full">
        <defs>
          <linearGradient id="waterFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7DD3FC" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
          <clipPath id="bottleClip">
            <path d="M35 10 h30 v14 c0 4 8 6 8 20 v100 c0 8 -6 12 -14 12 h-18 c-8 0 -14 -4 -14 -12 v-100 c0 -14 8 -16 8 -20 z" />
          </clipPath>
        </defs>
        {/* glass */}
        <path
          d="M35 10 h30 v14 c0 4 8 6 8 20 v100 c0 8 -6 12 -14 12 h-18 c-8 0 -14 -4 -14 -12 v-100 c0 -14 8 -16 8 -20 z"
          fill="rgba(200,220,240,.25)"
          stroke="#CFDCEC"
          strokeWidth="1.5"
        />
        <g clipPath="url(#bottleClip)">
          <rect x="0" y={fillY * 1.6} width="100" height="160" fill="url(#waterFill)" />
          <path
            d={`M 0 ${fillY * 1.6} Q 25 ${fillY * 1.6 - 6}, 50 ${fillY * 1.6} T 100 ${fillY * 1.6} V 160 H 0 Z`}
            fill="#7DD3FC"
            opacity="0.5"
            className="animate-wave"
          />
        </g>
        {/* cap */}
        <rect x="38" y="4" width="24" height="10" rx="3" fill="#CBD5E1" />
        {/* highlight */}
        <rect x="42" y="40" width="4" height="80" rx="2" fill="white" opacity="0.35" />
      </svg>
    </div>
  );
}

/* ---------- Stats ---------- */

function Stats() {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const [subTab, setSubTab] = useState<"analytics" | "body" | "water">("analytics");
  const [gender, setGender] = useState(state.profile?.gender ?? "male");
  const latest = state.measurements[state.measurements.length - 1];
  const [form, setForm] = useState({
    height: latest?.height ?? state.profile?.height ?? 175,
    neck: latest?.neck ?? 38,
    waist: latest?.waist ?? 78,
    chest: latest?.chest ?? 98,
  });
  const [bf, setBf] = useState<number | null>(null);

  const calc = () =>
    setBf(bodyFatNavy({ ...state.profile!, gender } as any, form));

  const chestData = state.measurements.slice(-30).map((m, i) => ({ i, w: m.weight, c: m.chest, b: m.biceps, date: fmtDate(m.date, lang) }));

  const category = (v: number | null) => {
    if (v === null) return "";
    if (v < 10) return "Essential";
    if (v < 14) return "Athletic";
    if (v < 18) return "Fitness";
    if (v < 25) return "Acceptable";
    return "Obese";
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Segmented Sub-Navigation for Stats */}
      <div className="p-1 rounded-2xl bg-surface border border-border flex items-center shadow-soft">
        <button
          onClick={() => setSubTab("analytics")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === "analytics" ? "gradient-primary text-white shadow-button" : "text-text-muted hover:text-text-primary"
          }`}
        >
          <ChartBar size={14} weight="bold" />
          {lang === "ru" ? "Аналитика" : lang === "en" ? "Analytics" : "Analitika"}
        </button>

        <button
          onClick={() => setSubTab("body")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === "body" ? "gradient-primary text-white shadow-button" : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Ruler size={14} weight="bold" />
          {lang === "ru" ? "Замеры" : lang === "en" ? "Body" : "O'lchovlar"}
        </button>

        <button
          onClick={() => setSubTab("water")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === "water" ? "gradient-primary text-white shadow-button" : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Drop size={14} weight="bold" />
          {lang === "ru" ? "Вода" : lang === "en" ? "Water" : "Suv"}
        </button>
      </div>

      {subTab === "body" && <Measurements />}
      {subTab === "water" && <Hydration />}
      {subTab === "analytics" && (
        <>
          <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t("fatCalculator", lang)}</span>
          <div className="rounded-xl bg-secondary-bg p-1 flex text-xs">
            {(["male", "female"] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`px-3 py-1 rounded-lg font-semibold ${gender === g ? "gradient-primary text-white" : "text-text-muted"}`}>
                {g === "male" ? t("maleLabel", lang) : t("femaleLabel", lang)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <NumField label={t("height", lang) + " (sm)"} value={form.height} onChange={(v) => setForm({ ...form, height: v })} />
          <NumField label={t("neck", lang) + " (sm)"} value={form.neck} onChange={(v) => setForm({ ...form, neck: v })} />
          <NumField label={t("waist", lang) + " (sm)"} value={form.waist} onChange={(v) => setForm({ ...form, waist: v })} />
          {gender === "female" && <NumField label={t("chest", lang) + "/" + t("waist", lang) + " (sm)"} value={form.chest} onChange={(v) => setForm({ ...form, chest: v })} />}
        </div>

        <button onClick={calc} className="mt-4 w-full h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
          {t("calculate", lang)}
        </button>

        {bf !== null && (
          <div className="mt-6 animate-fade-in">
            <BodyFatGauge value={bf} />
            <div className="mt-3 grid grid-cols-5 gap-1 text-[9px] font-semibold text-center">
              {(["Essential", "Athletic", "Fitness", "Acceptable", "Obese"] as const).map((c, i) => (
                <div key={c} className={`py-1.5 rounded ${category(bf) === c ? "gradient-primary text-white" : "bg-secondary-bg text-text-muted"}`}>
                  {c}
                  <div className="text-[8px] opacity-80">{["0-10%", "10-14%", "14-18%", "18-25%", "25%+"][i]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <SectionTitle>{t("bodyStructure", lang)}</SectionTitle>
      <Card className="p-5">
        <BodyMorph shoulder={latest?.chest ?? form.chest} waist={latest?.waist ?? form.waist} />
      </Card>

          <SectionTitle>{t("progress30", lang)}</SectionTitle>
          <Card className="p-4">
            {chestData.length < 2 ? (
              <div className="p-6 text-center text-xs text-text-muted">{t("moreMeasurements", lang)}</div>
            ) : (
              <SimpleProgressChart data={chestData} />
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function SimpleProgressChart({ data }: { data: Array<{ w?: number; c?: number; b?: number; date: string }> }) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const weights = data.map((d) => d.w).filter(Boolean) as number[];
  const maxW = Math.max(...weights, 1);
  const minW = Math.min(...weights, 0);
  const diffW = maxW - minW || 1;

  const width = 360;
  const height = 160;
  const padding = 20;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const getPoints = (vals: number[], min: number, diff: number) => {
    return vals.map((v, idx) => {
      const x = padding + (idx / (vals.length - 1)) * chartW;
      const y = padding + chartH - ((v - min) / diff) * chartH;
      return `${x},${y}`;
    }).join(" ");
  };

  const weightPoints = weights.length > 1 ? getPoints(weights, minW, diffW) : "";

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F6BFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Horizontal grid guidelines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--color-divider)" strokeWidth="1" strokeDasharray="3" />
        <line x1={padding} y1={padding + chartH / 2} x2={width - padding} y2={padding + chartH / 2} stroke="var(--color-divider)" strokeWidth="1" strokeDasharray="3" />
        <line x1={padding} y1={padding + chartH} x2={width - padding} y2={padding + chartH} stroke="var(--color-divider)" strokeWidth="1" />

        {/* Area & Line */}
        {weights.length > 1 && (
          <>
            <path
              d={`M ${padding} ${padding + chartH} L ${weightPoints} L ${padding + chartW} ${padding + chartH} Z`}
              fill="url(#weightGrad)"
            />
            <polyline
              fill="none"
              stroke="#4F6BFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={weightPoints}
            />
            {/* Draw point dots */}
            {weights.map((v, idx) => {
              const x = padding + (idx / (weights.length - 1)) * chartW;
              const y = padding + chartH - ((v - minW) / diffW) * chartH;
              return (
                <circle key={idx} cx={x} cy={y} r="3.5" fill="#ffffff" stroke="#4F6BFF" strokeWidth="2" />
              );
            })}
          </>
        )}
      </svg>
      <div className="mt-3 flex items-center justify-between w-full text-[10px] font-semibold text-text-muted px-2">
        <span>{data[0].date}</span>
        <span className="text-brand">
          {lang === "ru" ? "Динамика веса (кг)" : lang === "en" ? "Weight trend (kg)" : "Vazn tendensiyasi (kg)"}
        </span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand font-medium"
      />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand font-medium"
      />
    </label>
  );
}

function BodyFatGauge({ value }: { value: number }) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const angle = Math.min(180, Math.max(0, (value / 35) * 180));
  const r = 70;
  const cx = 100;
  const cy = 100;
  const rad = ((180 - angle) * Math.PI) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy - r * Math.sin(rad);
  return (
    <div className="relative mx-auto w-56">
      <svg viewBox="0 0 200 120" className="w-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#22C55E" />
            <stop offset="0.5" stopColor="#4F6BFF" />
            <stop offset="1" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#EEF2F8" strokeWidth="12" strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(angle / 180) * Math.PI * r} 500`} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#111827" />
      </svg>
      <div className="absolute inset-x-0 -bottom-2 text-center">
        <div className="text-4xl font-bold text-text-primary">{value}<span className="text-lg text-text-muted">%</span></div>
        <div className="text-xs text-brand font-semibold">
          {lang === "ru" ? "Жир тела" : lang === "en" ? "Body fat" : "Tana yog'i"}
        </div>
      </div>
    </div>
  );
}

function BodyMorph({ shoulder, waist }: { shoulder: number; waist: number }) {
  const { state } = useFit();
  const lang = state.profile?.language || "uz";
  const gender = state.profile?.gender || "male";

  const ratio = shoulder / Math.max(1, waist);

  let shape = "";
  let imgKey = "ectomorph";
  let desc = "";

  if (waist > shoulder - 2) {
    imgKey = "endomorph";
    if (lang === "ru") {
      shape = "Округлый (Полный)";
      desc = "Рекомендуются кардио-тренировки и правильное питание для уменьшения жировых отложений на талии.";
    } else if (lang === "en") {
      shape = "Round (Endomorph)";
      desc = "Cardio training and proper nutrition are recommended to reduce excess fat around the waist.";
    } else {
      shape = "Aylana (Semiz)";
      desc = "Beldagi ortiqcha yog' to'planishini kamaytirish uchun kardio mashg'ulotlari va to'g'ri ovqatlanish tavsiya etiladi.";
    }
  } else if (ratio >= 1.25) {
    imgKey = "mesomorph";
    if (lang === "ru") {
      shape = "V-образный (Атлетический)";
      desc = "Отличное соотношение плеч к талии. Классический эстетичный V-образный показатель.";
    } else if (lang === "en") {
      shape = "V-Shape (Mesomorph)";
      desc = "Excellent shoulder-to-waist ratio. A classic aesthetic V-shape indicators.";
    } else {
      shape = "V-Simon";
      desc = "Yelka-bel mutanosibligi a'lo darajada. Klassik estetik V-simon tana ko'rsatkichi.";
    }
  } else {
    imgKey = "ectomorph";
    if (lang === "ru") {
      shape = "Пропорциональный (Стройный)";
      desc = "Ваше телосложение пропорциональное и ровное. Для достижения V-образной формы делайте больше упражнений на плечи и спину.";
    } else if (lang === "en") {
      shape = "Proportional (Ectomorph)";
      desc = "Your body composition is proportional and flat. Focus on shoulder and back exercises to develop a V-shape.";
    } else {
      shape = "Mutanosib (O'rtacha)";
      desc = "Tana tuzilishingiz mutanosib va tekis. V-simon shaklga erishish uchun ko'proq yelka va orqa mushaklari mashqlarini bajaring.";
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="w-24 h-36 flex items-center justify-center p-1 bg-secondary-bg dark:bg-[#12131a] rounded-2xl overflow-hidden shrink-0 border border-border dark:border-border/10">
        <img 
          src={`/body_types/${gender}_${imgKey}.png`} 
          alt={shape} 
          className="h-full w-auto object-contain" 
        />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide">{t("bodyShape", lang)}</div>
        <div className="text-lg font-bold text-text-primary mt-0.5">{shape}</div>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">{desc}</p>
        <div className="mt-2 text-[11px] font-medium text-text-muted">
          {lang === "ru" ? "Соотношение плеч к талии: " : lang === "en" ? "Shoulder-to-waist ratio: " : "Yelka-bel nisbati: "}
          <span className="font-bold text-brand">{ratio.toFixed(2)}</span> 
          {lang === "ru" ? " (Цель для классической формы >1.4)" : lang === "en" ? " (Target for classic shape >1.4)" : " (Klassik shakl uchun maqsad >1.4)"}
        </div>
      </div>
    </div>
  );
}

/* ---------- Notifications sheet ---------- */

function NotifSheet({ onClose }: { onClose: () => void }) {
  const { state, clearNotifications, markAllRead } = useFit();
  const lang = state.profile?.language || "uz";
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);
  return (
    <Sheet onClose={onClose} title={t("notificationsTitle", lang)} action={<button onClick={clearNotifications} className="text-xs font-semibold text-brand">{t("clearAll", lang)}</button>}>
      {state.notifications.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">{t("noNotifications", lang)}</div>
      ) : (
        <div className="space-y-3">
          {state.notifications.map((n) => (
            <div key={n.id} className="rounded-2xl bg-surface border border-border p-4 shadow-soft flex gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${
                n.kind === "creatine" ? "bg-destructive/10 text-destructive" :
                n.kind === "water" ? "bg-info/10 text-info" :
                n.kind === "challenge" ? "bg-warning/10 text-warning" :
                "bg-brand/10 text-brand"
              }`}>
                {n.kind === "water" ? <Drop size={20} weight="fill" /> : n.kind === "creatine" ? <Warning size={20} weight="fill" /> : n.kind === "challenge" ? <Trophy size={20} weight="fill" /> : <Sparkle size={20} weight="fill" />}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold text-text-primary">{n.title}</div>
                  <div className="text-[10px] text-text-muted">{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="text-xs text-text-secondary">{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

function ToastCard({ n, onClose }: { n: AppNotification; onClose: () => void }) {
  return (
    <div className="rounded-3xl bg-surface shadow-card border border-border p-4 flex gap-3">
      <div className={`grid h-10 w-10 place-items-center rounded-2xl ${n.kind === "creatine" ? "bg-destructive/15 text-destructive" : "bg-info/15 text-info"}`}>
        {n.kind === "water" ? <Drop size={20} weight="fill" /> : n.kind === "creatine" ? <Warning size={20} weight="fill" /> : <Bell size={20} weight="fill" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text-primary">{n.title}</div>
        <div className="text-xs text-text-secondary">{n.body}</div>
        {n.action && <button className="mt-2 text-xs font-semibold text-brand">{n.action}</button>}
      </div>
      <button onClick={onClose} className="text-text-muted h-6 w-6 grid place-items-center"><X size={16} weight="bold" /></button>
    </div>
  );
}

/* ---------- Settings ---------- */

function SettingsSheet({ onClose, onAdminClick }: { onClose: () => void; onAdminClick: () => void }) {
  const { state, update, reset, logout, user } = useFit();
  const p = state.profile;
  const [form, setForm] = useState(p);
  const [confirmReset, setConfirmReset] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string" && form) {
        setForm({ ...form, photoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (form) update({ profile: form });
    onClose();
  };

  if (!form) return null;
  const lang = form.language || "uz";
  const displayPhoto = form.photoUrl || user?.photoURL;

  return (
    <Sheet 
      onClose={onClose} 
      title={t("settings", lang)} 
      subtitle={lang === "ru" ? "Настройки приложения" : lang === "en" ? "App settings" : "Ilova sozlamalari"}
    >
      <div className="space-y-4">
        {/* Admin Dashboard Entry (Visible only for admin) */}
        {user?.email === "salimovsarvar21@gmail.com" && (
          <button
            onClick={onAdminClick}
            className="w-full h-12 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-bold flex items-center justify-center gap-2 border border-amber-500/20 transition-all active:scale-95 mb-1"
          >
            <ShieldCheck size={18} weight="fill" /> FitAssist
          </button>
        )}

        {/* Language Selection */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{t("language", lang)}</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {([
              { k: "uz", l: "O'zbekcha 🇺🇿" },
              { k: "ru", l: "Русский 🇷🇺" },
              { k: "en", l: "English 🇬🇧" },
            ] as const).map((x) => (
              <button
                type="button"
                key={x.k}
                onClick={() => setForm({ ...form!, language: x.k })}
                className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                  (form.language || "uz") === x.k
                    ? "gradient-primary border-brand text-white shadow-soft"
                    : "border-border dark:border-border/10 bg-secondary-bg dark:bg-[#15161f] text-text-secondary"
                }`}
              >
                {x.l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} className="w-full h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
          {lang === "ru" ? "Сохранить" : lang === "en" ? "Save" : "Saqlash"}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={async () => {
            await logout();
            onClose();
          }}
          className="w-full h-12 rounded-2xl bg-secondary-bg hover:bg-border text-text-primary text-sm font-semibold flex items-center justify-center gap-2 border border-border transition-all active:scale-95"
        >
          <SignOut size={16} weight="bold" className="text-text-secondary" /> {t("logout", lang)}
        </button>

        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="w-full h-12 rounded-2xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2">
            <Trash size={16} weight="bold" /> {lang === "ru" ? "Удалить все данные" : lang === "en" ? "Reset all data" : "Barcha ma'lumotlarni o'chirish"}
          </button>
        ) : (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
            <div className="text-sm font-semibold text-destructive">
              {lang === "ru" ? "Вы уверены? Все данные будут удалены." : lang === "en" ? "Are you sure? Everything will be deleted." : "Ishonchingiz komilmi? Hamma narsa o'chadi."}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 h-11 rounded-xl bg-white dark:bg-[#1a1b24] text-sm font-semibold text-text-primary dark:text-text-primary border border-border dark:border-border/10 text-center">
                {lang === "ru" ? "Отмена" : lang === "en" ? "Cancel" : "Bekor qilish"}
              </button>
              <button onClick={() => { reset(); onClose(); }} className="flex-1 h-11 rounded-xl bg-destructive text-white text-sm font-semibold text-center">
                {lang === "ru" ? "Удалить всё" : lang === "en" ? "Delete all" : "Hammasini o'chirish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Sheet({ onClose, title, subtitle, action, children }: { onClose: () => void; title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[32px] bg-background shadow-hero animate-slide-down overflow-y-auto pb-10">
        <div className="mx-auto max-w-[480px] px-6 pt-6 pb-20">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">{title}</h2>
              {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
            </div>
            {action}
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-[#1e202e] text-text-secondary dark:text-text-primary shadow-soft border border-border dark:border-border/20 ml-2 hover:opacity-80 active:scale-95 transition-all">
              <X size={18} weight="bold" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Dev Panel ---------- */

function DevPanel() {
  const { state, update, pushNotification } = useFit();
  const [open, setOpen] = useState(false);

  const fastForward = () => update({ simulatedDayOffset: state.simulatedDayOffset + 1 });
  const simulate = () => {
    const lang = state.profile?.language || "uz";
    pushNotification({ 
      kind: "water", 
      title: t("waterReminderTitle", lang), 
      body: t("waterReminderBody", lang) 
    });
    setTimeout(() => pushNotification({ 
      kind: "challenge", 
      title: lang === "ru" ? "Напоминание о цели" : lang === "en" ? "Goal Reminder" : "Maqsad eslatmasi", 
      body: lang === "ru" ? "Вы выполнили задание цели сегодня?" : lang === "en" ? "Did you complete your daily goal task today?" : "Bugun 90 kunlik maqsad vazifangizni bajardingizmi?", 
      action: lang === "ru" ? "Перейти к целям" : lang === "en" ? "Go to goals" : "Maqsadga o'tish" 
    }), 800);
  };
  const fillMock = () => {
    const start = Date.now() - 30 * 86400 * 1000;
    const base = state.profile?.weight ?? 75;
    const mocks = Array.from({ length: 30 }, (_, i) => ({
      id: crypto.randomUUID(),
      date: new Date(start + i * 86400 * 1000).toISOString(),
      weight: Math.round((base - i * 0.05 + (Math.random() - 0.5) * 0.6) * 10) / 10,
      chest: 96 + Math.round(i * 0.08 * 10) / 10,
      biceps: 34 + Math.round(i * 0.06 * 10) / 10,
      waist: 82 - Math.round(i * 0.1 * 10) / 10,
      neck: 38,
      height: state.profile?.height ?? 175,
      thighs: 56,
    }));
    update({ measurements: [...state.measurements, ...mocks] });
  };

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + state.simulatedDayOffset);

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-[260px]">
      {open ? (
        <div className="rounded-3xl bg-surface shadow-card border border-border p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-text-primary">Dasturchi sinov paneli</div>
            <button onClick={() => setOpen(false)} className="text-text-muted"><CaretDown size={16} weight="bold" /></button>
          </div>
          <div className="mt-3 space-y-2">
            <DevBtn onClick={fastForward} icon={<FastForwardIcon size={16} weight="bold" />} title="1 kun oldinga surish" sub="Keyingi kunni simulyatsiya qilish" />
            <DevBtn onClick={simulate} icon={<Bell size={16} weight="bold" />} title="Xabarnomalarni yuborish" sub="Barcha bildirishnomalarni chiqarish" />
            <DevBtn onClick={fillMock} icon={<DatabaseIcon size={16} weight="bold" />} title="Test ma'lumotlarini to'ldirish" sub="30 kunlik o'lchov yaratish" />
          </div>
          <div className="mt-3 pt-3 border-t border-divider text-[10px] text-text-muted">
            Simulyatsiya sanasi: {currentDate.toLocaleDateString("uz-UZ", { month: "short", day: "numeric", year: "numeric" })}
            <br />(Faqat sinov maqsadida)
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-white shadow-button">
          <Lightning size={20} weight="fill" />
        </button>
      )}
    </div>
  );
}

function DevBtn({ onClick, icon, title, sub }: { onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 rounded-xl bg-secondary-bg p-2.5 text-left">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-brand shadow-soft">{icon}</div>
      <div>
        <div className="text-xs font-semibold text-text-primary">{title}</div>
        <div className="text-[10px] text-text-muted">{sub}</div>
      </div>
    </button>
  );
}


