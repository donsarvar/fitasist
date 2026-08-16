import { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  Ruler,
  Trophy,
  Droplet,
  BarChart3,
  Bell,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Send,
  Sparkles,
  ChevronDown,
  X,
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  FastForward,
  Database,
  Zap,
  Trash2,
  Download,
  Upload,
  LogOut,
} from "lucide-react";
import { useFit } from "@/lib/fitasist/store";
import { calcAge, calorieTargetKcal, coachReply, dailyAdvice, hydrationTargetL, proteinTargetG, bodyFatNavy } from "@/lib/fitasist/coach";
import type { AppNotification, Challenge, Measurement } from "@/lib/fitasist/types";
import { fmtDate, today } from "@/lib/fitasist/storage";
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

type Tab = "dashboard" | "measurements" | "challenges" | "hydration" | "stats";

export function AppShell() {
  const { state, update, todayHydration, updateHydration, pushNotification } = useFit();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const toastTimer = useRef<number | null>(null);

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
      showToast({
        kind: "water",
        title: "Water Reminder",
        body: "Time to hydrate! Drink a glass of water to keep up your energy.",
        action: "Log Water",
      });
    }, 10 * 60 * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Creatine kidney alert
  useEffect(() => {
    const h = todayHydration();
    if (h.creatineG > 0 && h.waterMl / 1000 < 2.0) {
      const last = state.notifications.find((n) => n.kind === "creatine");
      const recently = last && Date.now() - new Date(last.createdAt).getTime() < 30 * 60 * 1000;
      if (!recently) {
        showToast({
          kind: "creatine",
          title: "Kidney Alert",
          body: "You need more water for your creatine intake!",
          action: "View Details",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydration]);

  const unread = state.notifications.filter((n) => !n.read).length;

  const screen = (() => {
    switch (tab) {
      case "dashboard":
        return <Dashboard />;
      case "measurements":
        return <Measurements />;
      case "challenges":
        return <Challenges />;
      case "hydration":
        return <Hydration />;
      case "stats":
        return <Stats />;
    }
  })();

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-[480px] relative min-h-dvh pb-32">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-header px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-white shadow-button">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gradient-primary">FitAsist</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn onClick={() => update({ theme: state.theme === "dark" ? "light" : "dark" })}>
              {state.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconBtn>
            <button
              onClick={() => setNotifOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft border border-border text-text-secondary"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white grid place-items-center">
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-white shadow-button"
              title="Settings"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="px-6 pt-4 animate-fade-in" key={tab}>
          {screen}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px]">
          <div className="relative glass-nav rounded-[30px] shadow-card px-3 py-2 flex items-center justify-between border border-white/60">
            {(
              [
                { k: "dashboard", icon: Home, label: "Home" },
                { k: "measurements", icon: Ruler, label: "Body" },
                { k: "challenges", icon: Trophy, label: "Goals" },
                { k: "hydration", icon: Droplet, label: "Water" },
                { k: "stats", icon: BarChart3, label: "Stats" },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = tab === item.k;
              return (
                <button
                  key={item.k}
                  onClick={() => setTab(item.k)}
                  className={`relative flex flex-col items-center gap-0.5 rounded-full py-2 px-3 transition-all ${
                    active ? "text-white" : "text-[#6B7280]"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full gradient-primary shadow-button -z-0" />
                  )}
                  <Icon className="h-4 w-4 relative z-10" />
                  <span className="text-[10px] font-semibold relative z-10">{item.label}</span>
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

        {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
        {notifOpen && <NotifSheet onClose={() => setNotifOpen(false)} />}
      </div>
    </div>
  );
}

/* ---------- Reusable pieces ---------- */

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft border border-border text-text-secondary"
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

function Dashboard() {
  const { state, todayHydration } = useFit();
  const p = state.profile;
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const proteinTarget = proteinTargetG(p);
  const waterTarget = hydrationTargetL(p);
  const h = todayHydration();
  const proteinDone = Math.min(h.wheyG * 0.8 + 40, proteinTarget);
  const waterDoneL = h.waterMl / 1000;

  const health = Math.max(50, Math.min(99, 70 + (h.waterMl / 1000 / waterTarget) * 20 + (h.wheyG > 0 ? 5 : 0)));

  const recent = useMemo(() => {
    const m = state.measurements.slice(-5);
    if (m.length < 2) return "Log measurements to see your weekly progress here.";
    const first = m[0].weight;
    const last = m[m.length - 1].weight;
    if (first && last) {
      const diff = (last - first).toFixed(1);
      const trend = Number(diff) < 0 ? `Weight down ${Math.abs(Number(diff))}kg` : `Weight up ${diff}kg`;
      return `${trend} across ${m.length} logs. Keep the momentum going!`;
    }
    return "Nice consistency — keep logging to unlock deeper insights.";
  }, [state.measurements]);

  const ask = () => {
    const q = input.trim();
    if (!q) return;
    const answer = coachReply(q, p);
    setMessages((prev) => [...prev, { role: "user", text: q }, { role: "ai", text: answer }]);
    setInput("");
  };

  return (
    <div>
      <div className="pt-2">
        <div className="text-xs font-medium text-text-muted">Good Morning,</div>
        <h1 className="text-[26px] font-bold text-text-primary leading-tight">
          Hi, {p?.fio?.split(" ")[0] ?? "friend"}! <span className="animate-floaty inline-block">👋</span>
        </h1>
        <p className="mt-1 text-sm text-text-muted">You're doing great today.</p>
      </div>

      {/* AI Hero */}
      <div className="mt-5 relative overflow-hidden rounded-3xl gradient-mesh text-white shadow-hero p-5">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-black/20 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="relative h-24 w-24 shrink-0">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/70 via-white/30 to-white/10 backdrop-blur-md border border-white/50 animate-ai-pulse" />
            <div className="absolute inset-6 rounded-full bg-white/80 blur-md" />
            <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ai-ring" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">AI Coach</div>
            <div className="mt-1 rounded-2xl rounded-tl-md bg-white/15 backdrop-blur-md border border-white/20 p-3 text-[13px] leading-relaxed">
              {dailyAdvice(p)}
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="relative mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-[12px] ${
                    m.role === "user" ? "bg-white text-text-primary" : "bg-white/15 backdrop-blur border border-white/20 text-white"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/95 pl-4 pr-2 py-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Ask your AI Fitness Coach..."
            className="flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-placeholder py-2"
          />
          <button onClick={ask} className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white shadow-button">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SectionTitle>Today's AI Summary</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <ScoreCard label="Health Score" value={Math.round(health).toString()} sub="Excellent" color="var(--success)" ring={health} />
        <RingCard label="Protein" value={`${Math.round(proteinDone)}g`} sub={`/ ${proteinTarget}g`} pct={Math.round((proteinDone / proteinTarget) * 100)} tint="brand" />
        <RingCard label="Hydration" value={`${waterDoneL.toFixed(1)}L`} sub={`/ ${waterTarget}L`} pct={Math.round((waterDoneL / waterTarget) * 100)} tint="info" />
      </div>

      <SectionTitle>Recent Progress</SectionTitle>
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

function ScoreCard({ label, value, sub, color, ring }: { label: string; value: string; sub: string; color: string; ring: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <Card className="p-4 flex flex-col items-center">
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
      <div className="mt-1 text-[10px] text-text-muted flex items-center gap-0.5"><ArrowUp className="h-2.5 w-2.5 text-success" />6 pts</div>
    </Card>
  );
}

function RingCard({ label, value, sub, pct, tint }: { label: string; value: string; sub: string; pct: number; tint: "brand" | "info" }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const gradId = `g-${tint}`;
  return (
    <Card className="p-4 flex flex-col items-center">
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{label}</div>
      <div className="relative mt-2 h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
              {tint === "brand" ? (
                <>
                  <stop offset="0" stopColor="#4F6BFF" />
                  <stop offset="1" stopColor="#7B5CFF" />
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

const measureGuides: Record<string, { title: string; body: string; icon: string }> = {
  height: { title: "How to measure Height", body: "Stand barefoot with your back to a wall. Look straight ahead. Mark the top of your head, then measure to the floor.", icon: "📏" },
  weight: { title: "How to measure Weight", body: "Weigh yourself in the morning, after using the bathroom and before eating. Use the same scale each time.", icon: "⚖️" },
  chest: { title: "How to measure Chest", body: "Exhale fully and measure at the widest part of your chest, keeping the tape parallel to the floor.", icon: "🫁" },
  biceps: { title: "How to measure Biceps", body: "Flex your arm at 90°. Wrap the tape around the largest part of your bicep.", icon: "💪" },
  waist: { title: "How to measure Waist", body: "Wrap the tape just above the navel. Relax — don't suck in.", icon: "📐" },
  thighs: { title: "How to measure Thighs", body: "Stand relaxed. Measure the widest part of your thigh, tape parallel to the floor.", icon: "🦵" },
  neck: { title: "How to measure Neck", body: "Wrap the tape just below the Adam's apple. Keep the tape slightly slanted downward.", icon: "🧣" },
};

function Measurements() {
  const { state, update } = useFit();
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
    { k: "height", label: "Height", unit: "cm" },
    { k: "weight", label: "Weight", unit: "kg" },
    { k: "chest", label: "Chest", unit: "cm" },
    { k: "biceps", label: "Biceps", unit: "cm" },
    { k: "waist", label: "Waist", unit: "cm" },
    { k: "thighs", label: "Thighs", unit: "cm" },
    { k: "neck", label: "Neck", unit: "cm" },
  ];

  return (
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">Measurements</h1>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Latest Summary</span>
          <span className="text-xs text-text-muted">{latest ? fmtDate(latest.date) : "No data"}</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatBig label="kg" value={latest?.weight ?? "—"} diff={diff(latest?.weight, prev?.weight)} />
          <StatBig label="cm" value={latest?.chest ?? "—"} diff={diff(latest?.chest, prev?.chest)} sub="chest" />
          <StatBig label="cm" value={latest?.biceps ?? "—"} diff={diff(latest?.biceps, prev?.biceps)} sub="biceps" />
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
            {m === "log" ? "Log Measurements" : "History"}
          </button>
        ))}
      </div>

      {mode === "log" ? (
        <>
          <Card className="mt-5 divide-y divide-divider overflow-hidden">
            {fields.map((f) => (
              <div key={f.k as string} className="flex items-center gap-3 px-4 py-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary-bg text-brand text-lg">
                  {measureGuides[f.k as string].icon}
                </div>
                <div className="flex-1 text-sm font-medium text-text-primary">{f.label}</div>
                <input
                  onFocus={() => setFocused(f.k as string)}
                  value={(form[f.k] as number | undefined) ?? ""}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value ? Number(e.target.value) : undefined })}
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
                    {measureGuides[focused].icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-text-primary">{measureGuides[focused].title}</h4>
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">{measureGuides[focused].body}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary-bg text-brand text-lg">💡</div>
                <p className="text-xs text-text-muted flex-1">Tap any field to see how to measure correctly.</p>
              </Card>
            )}
          </div>

          <button onClick={save} className="mt-5 w-full h-14 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
            Save Measurement
          </button>
        </>
      ) : (
        <div className="mt-5 space-y-3">
          {state.measurements.length === 0 && (
            <Card className="p-8 text-center text-sm text-text-muted">No records yet.</Card>
          )}
          {[...state.measurements].reverse().map((m) => (
            <Card key={m.id} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs font-semibold text-text-primary">{fmtDate(m.date)}</div>
                <div className="mt-1 text-xs text-text-muted">
                  {m.weight ? `${m.weight}kg` : "—"} · {m.chest ? `chest ${m.chest}cm` : ""} {m.biceps ? `· biceps ${m.biceps}cm` : ""}
                </div>
              </div>
              <button onClick={() => del(m.id)} className="grid h-8 w-8 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="h-4 w-4" />
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
          {diff < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
          {Math.abs(diff)}
        </div>
      )}
    </div>
  );
}

/* ---------- Challenges ---------- */

function Challenges() {
  const { state, update, todayKey } = useFit();
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
      <h1 className="text-[26px] font-bold text-text-primary">Challenges</h1>

      {main ? <ActiveChallengeCard c={main} onDo={() => doToday(main)} /> : (
        <Card className="mt-5 p-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-brand" />
          <p className="mt-3 text-sm text-text-muted">No active challenge. Create one below!</p>
        </Card>
      )}

      <SectionTitle>Create Challenge</SectionTitle>
      <Card className="p-4">
        <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-between text-sm font-semibold text-text-primary">
          <span className="flex items-center gap-2"><Plus className="h-4 w-4 text-brand" /> Add a new challenge</span>
          <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${showForm ? "rotate-180" : ""}`} />
        </button>
        {showForm && (
          <div className="mt-4 grid grid-cols-2 gap-3 animate-fade-in">
            <label className="col-span-2 block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 30 Days of Plank" className="mt-1 w-full h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Duration (days)</span>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="mt-1 w-full h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Start Date</span>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-brand" />
            </label>
            <label className="col-span-2 block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Daily Target</span>
              <input value={form.dailyTarget} onChange={(e) => setForm({ ...form, dailyTarget: e.target.value })} placeholder="e.g. 50 reps" className="mt-1 w-full h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-brand" />
            </label>
            <button onClick={create} className="col-span-2 h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">Create Challenge</button>
          </div>
        )}
      </Card>

      <SectionTitle>Completed Challenges</SectionTitle>
      {completed.length === 0 ? (
        <Card className="p-6 text-center text-xs text-text-muted">None yet — finish your first challenge!</Card>
      ) : (
        <div className="space-y-3">
          {completed.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-3 opacity-70">
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary">{c.name}</div>
                <div className="text-xs text-text-muted">Completed on {fmtDate(c.startDate)}</div>
              </div>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-success/15 text-success">
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
  const { todayKey } = useFit();
  const done = c.completedDays.length;
  const pct = (done / c.duration) * 100;
  const todayDone = c.completedDays.includes(todayKey());
  const currentDay = Math.min(done + 1, c.duration);

  const dots = Array.from({ length: Math.min(c.duration, 12) }, (_, i) => {
    const dayIdx = Math.round((i / 11) * (c.duration - 1));
    return dayIdx < done ? "done" : dayIdx === done ? "current" : "future";
  });

  return (
    <Card className="mt-5 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Active Challenge</div>
          <div className="mt-1 text-lg font-bold text-text-primary">{c.name}</div>
          <div className="text-xs text-text-muted">Day {currentDay} / {c.duration}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gradient-primary">{Math.round(pct)}%</div>
        </div>
      </div>

      <div className="relative mt-5 h-14 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-secondary-bg" />
        <div className="absolute left-0 h-1 rounded-full gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        <div className="relative flex-1 flex justify-between">
          {dots.map((s, i) => (
            <div key={i} className="relative">
              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  s === "done" ? "gradient-primary border-white" : s === "current" ? "bg-white border-brand animate-ai-pulse" : "bg-white border-border"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onDo}
        disabled={todayDone}
        className="mt-4 w-full h-14 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button disabled:opacity-40"
      >
        {todayDone ? "✅ Logged for today" : "I Did This Today! 🎯"}
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
  const [custom, setCustom] = useState<number | "">("");
  const h = todayHydration();
  const target = hydrationTargetL(state.profile);
  const doneL = h.waterMl / 1000;
  const pct = Math.min(100, (doneL / target) * 100);

  const add = (ml: number) => updateHydration({ waterMl: Math.max(0, h.waterMl + ml) });

  const warn = h.creatineG > 0 && doneL < 2.0;

  return (
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">Hydration</h1>

      <Card className="mt-5 p-5">
        <div className="flex items-center gap-5">
          <WaterBottle pct={pct} />
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Today</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-text-primary">{doneL.toFixed(1)}</span>
              <span className="text-lg text-text-muted">/ {target}</span>
            </div>
            <div className="text-xs text-text-muted">Liters</div>
            <div className="mt-3 text-lg font-bold text-gradient-primary">{Math.round(pct)}%</div>
            <div className="text-[11px] text-text-muted">of daily goal</div>
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
            placeholder="+Custom"
            className="w-full h-12 rounded-2xl border border-dashed border-brand/50 bg-brand/5 text-brand text-sm font-bold placeholder:text-brand/70 text-center outline-none"
          />
        </div>
      </div>

      <SectionTitle>Supplements</SectionTitle>
      <Card className="p-4 divide-y divide-divider">
        <SuppRow label="Creatine (g)">
          <input
            type="number"
            value={h.creatineG || ""}
            onChange={(e) => updateHydration({ creatineG: Number(e.target.value) || 0 })}
            className="w-16 h-9 rounded-lg border border-input bg-white text-right px-2 text-sm outline-none focus:border-brand"
          />
        </SuppRow>
        <SuppRow label="Whey Protein (g)">
          <input
            type="number"
            value={h.wheyG || ""}
            onChange={(e) => updateHydration({ wheyG: Number(e.target.value) || 0 })}
            className="w-16 h-9 rounded-lg border border-input bg-white text-right px-2 text-sm outline-none focus:border-brand"
          />
        </SuppRow>
        <SuppRow label="Vitamin D">
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
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-xs leading-relaxed text-[#7C4A03]">
            <span className="font-bold">⚠️ Baraka topgur!</span> You logged {h.creatineG}g of Creatine, but you've only drank {doneL.toFixed(1)} liters of water today. To prevent dehydration and protect your kidneys, drink at least another {Math.max(0.3, 2.0 - doneL).toFixed(1)} liters! 💧
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

  const chestData = state.measurements.slice(-30).map((m, i) => ({ i, w: m.weight, c: m.chest, b: m.biceps, date: fmtDate(m.date) }));

  const category = (v: number | null) => {
    if (v === null) return "";
    if (v < 10) return "Essential";
    if (v < 14) return "Athletic";
    if (v < 18) return "Fitness";
    if (v < 25) return "Acceptable";
    return "Obese";
  };

  return (
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">Stats</h1>

      <Card className="mt-5 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Body Fat Calculator</span>
          <div className="rounded-xl bg-secondary-bg p-1 flex text-xs">
            {(["male", "female"] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`px-3 py-1 rounded-lg font-semibold ${gender === g ? "gradient-primary text-white" : "text-text-muted"}`}>
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <NumField label="Height (cm)" value={form.height} onChange={(v) => setForm({ ...form, height: v })} />
          <NumField label="Neck (cm)" value={form.neck} onChange={(v) => setForm({ ...form, neck: v })} />
          <NumField label="Waist (cm)" value={form.waist} onChange={(v) => setForm({ ...form, waist: v })} />
          {gender === "female" && <NumField label="Hip/Chest (cm)" value={form.chest} onChange={(v) => setForm({ ...form, chest: v })} />}
        </div>

        <button onClick={calc} className="mt-4 w-full h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
          Calculate
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

      <SectionTitle>Body Shape</SectionTitle>
      <Card className="p-5">
        <BodyMorph shoulder={latest?.chest ?? form.chest} waist={latest?.waist ?? form.waist} />
      </Card>

      <SectionTitle>Progress (Last 30 Days)</SectionTitle>
      <Card className="p-4">
        {chestData.length < 2 ? (
          <div className="p-6 text-center text-xs text-text-muted">Log more measurements to see charts.</div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={chestData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4F6BFF" stopOpacity={0.35} />
                    <stop offset="1" stopColor="#4F6BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={28} />
                <RTooltip contentStyle={{ borderRadius: 16, border: "1px solid #E8EDF5", boxShadow: "0 12px 40px rgba(15,23,42,.08)", fontSize: 12 }} />
                <Area type="monotone" dataKey="w" name="Weight" stroke="#4F6BFF" strokeWidth={2.5} fill="url(#chartG)" />
                <Line type="monotone" dataKey="c" name="Chest" stroke="#7B5CFF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="b" name="Biceps" stroke="#22C55E" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
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
        className="mt-1 w-full h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}

function BodyFatGauge({ value }: { value: number }) {
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
        <div className="text-xs text-brand font-semibold">Body Fat</div>
      </div>
    </div>
  );
}

function BodyMorph({ shoulder, waist }: { shoulder: number; waist: number }) {
  const s = Math.max(0.7, Math.min(1.5, (shoulder / 100) * 1.05));
  const w = Math.max(0.5, Math.min(1.6, waist / 80));
  const shoulderW = 30 * s;
  const waistW = 18 * w;
  const shape = shoulderW > waistW + 6 ? "V-Shape" : waistW > shoulderW ? "Rounded" : "Balanced";
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 140" className="h-40">
        <defs>
          <linearGradient id="bm" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#4F6BFF" />
            <stop offset="1" stopColor="#7B5CFF" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="18" r="11" fill="url(#bm)" />
        <path
          d={`M ${50 - shoulderW} 38 Q ${50 - shoulderW - 3} 62 ${50 - waistW} 72 L ${50 - waistW - 2} 118 L ${50 - 4} 118 L ${50 - 2} 78 L ${50 + 2} 78 L ${50 + 4} 118 L ${50 + waistW + 2} 118 L ${50 + waistW} 72 Q ${50 + shoulderW + 3} 62 ${50 + shoulderW} 38 Z`}
          fill="url(#bm)"
          opacity="0.9"
        />
      </svg>
      <div className="flex-1">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Shape</div>
        <div className="text-xl font-bold text-text-primary">{shape}</div>
        <p className="mt-1 text-xs text-text-muted">
          Shoulder-to-waist ratio {(shoulder / Math.max(1, waist)).toFixed(2)}. Aim for &gt;1.4 for a classic V-taper.
        </p>
      </div>
    </div>
  );
}

/* ---------- Notifications sheet ---------- */

function NotifSheet({ onClose }: { onClose: () => void }) {
  const { state, clearNotifications, markAllRead } = useFit();
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);
  return (
    <Sheet onClose={onClose} title="Notifications" action={<button onClick={clearNotifications} className="text-xs font-semibold text-brand">Clear All</button>}>
      {state.notifications.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">No notifications yet.</div>
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
                {n.kind === "water" ? <Droplet className="h-5 w-5" /> : n.kind === "creatine" ? <AlertTriangle className="h-5 w-5" /> : n.kind === "challenge" ? <Trophy className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
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
        {n.kind === "water" ? <Droplet className="h-5 w-5" /> : n.kind === "creatine" ? <AlertTriangle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text-primary">{n.title}</div>
        <div className="text-xs text-text-secondary">{n.body}</div>
        {n.action && <button className="mt-2 text-xs font-semibold text-brand">{n.action}</button>}
      </div>
      <button onClick={onClose} className="text-text-muted h-6 w-6 grid place-items-center"><X className="h-4 w-4" /></button>
    </div>
  );
}

/* ---------- Settings ---------- */

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { state, update, reset } = useFit();
  const p = state.profile;
  const [form, setForm] = useState(p);
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    if (form) update({ profile: form });
    onClose();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitasist-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => {
      try {
        const data = JSON.parse(t);
        update(data);
        onClose();
      } catch {
        alert("Invalid file");
      }
    });
  };

  if (!form) return null;

  return (
    <Sheet onClose={onClose} title="Settings" subtitle={`${p?.fio} · Edit your profile and personal preferences`}>
      <div className="rounded-3xl bg-surface border border-border p-5 shadow-soft mb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-white text-lg font-bold">
            {p?.fio?.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{p?.fio}</div>
            <div className="text-xs text-text-muted">Age {calcAge(p?.birthYear ?? new Date().getFullYear())}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <NumField label="Height (cm)" value={form.height ?? 0} onChange={(v) => setForm({ ...form!, height: v })} />
        <NumField label="Weight (kg)" value={form.weight ?? 0} onChange={(v) => setForm({ ...form!, weight: v })} />

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Body Type</span>
          <select value={form.bodyType} onChange={(e) => setForm({ ...form!, bodyType: e.target.value as any })} className="mt-1 w-full h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none">
            <option value="skinny">Skinny</option>
            <option value="average">Average</option>
            <option value="bulk">Bulk</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Activity</span>
          <select value={form.activity} onChange={(e) => setForm({ ...form!, activity: e.target.value as any })} className="mt-1 w-full h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none">
            <option value="athlete">Athlete</option>
            <option value="active">Active</option>
            <option value="sedentary">Sedentary</option>
          </select>
        </label>

        <button onClick={save} className="w-full h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">Save Profile</button>
      </div>

      <div className="mt-6 space-y-3">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Data Management</div>
        <button onClick={exportData} className="w-full flex items-center gap-3 rounded-2xl bg-surface border border-border p-4 shadow-soft">
          <Download className="h-5 w-5 text-brand" />
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-text-primary">Export All Data</div>
            <div className="text-xs text-text-muted">Backup as JSON file</div>
          </div>
        </button>
        <label className="w-full flex items-center gap-3 rounded-2xl bg-surface border border-border p-4 shadow-soft cursor-pointer">
          <Upload className="h-5 w-5 text-brand" />
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-text-primary">Import Data</div>
            <div className="text-xs text-text-muted">Restore from JSON</div>
          </div>
          <input type="file" accept="application/json" onChange={importData} className="hidden" />
        </label>
      </div>

      <div className="mt-6">
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="w-full h-12 rounded-2xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" /> Clear All Data
          </button>
        ) : (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
            <div className="text-sm font-semibold text-destructive">Are you sure? This wipes everything.</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 h-11 rounded-xl bg-white text-sm font-semibold text-text-primary border border-border">Cancel</button>
              <button onClick={() => { reset(); onClose(); }} className="flex-1 h-11 rounded-xl bg-destructive text-white text-sm font-semibold">Delete All</button>
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
      <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[32px] bg-background shadow-hero animate-slide-down overflow-y-auto">
        <div className="mx-auto max-w-[480px] px-6 py-6">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">{title}</h2>
              {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
            </div>
            {action}
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft border border-border ml-2">
              <X className="h-4 w-4" />
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
    pushNotification({ kind: "water", title: "Water Reminder", body: "Time to hydrate! Drink a glass of water to keep your energy up." });
    setTimeout(() => pushNotification({ kind: "challenge", title: "Challenge Reminder", body: "Did you finish your 90-Day Challenge today?", action: "Go to Challenge" }), 800);
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
            <div className="text-xs font-bold text-text-primary">Dev Testing Control</div>
            <button onClick={() => setOpen(false)} className="text-text-muted"><ChevronDown className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 space-y-2">
            <DevBtn onClick={fastForward} icon={<FastForward className="h-4 w-4" />} title="Fast Forward 1 Day" sub="Simulate next day" />
            <DevBtn onClick={simulate} icon={<Bell className="h-4 w-4" />} title="Simulate Notifications" sub="Trigger all notifications" />
            <DevBtn onClick={fillMock} icon={<Database className="h-4 w-4" />} title="Fill Mock Data" sub="Generate 30 days of data" />
          </div>
          <div className="mt-3 pt-3 border-t border-divider text-[10px] text-text-muted">
            Current Date: {currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            <br />(For Testing Purposes Only)
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-white shadow-button">
          <Zap className="h-5 w-5" />
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
