import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Ruler, Weight as WeightIcon, User2, Activity, Dumbbell, Sofa, Trophy } from "lucide-react";
import { useFit } from "@/lib/fitasist/store";
import type { ActivityLevel, BodyType, Gender } from "@/lib/fitasist/types";

const TOTAL = 6;

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { update } = useFit();
  const [step, setStep] = useState(1);
  const [fio, setFio] = useState("");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [bodyType, setBodyType] = useState<BodyType | null>(null);
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [training, setTraining] = useState(false);

  const canNext =
    (step === 1 && fio.trim().length > 1 && String(birthYear).length === 4) ||
    (step === 2 && !!gender) ||
    step === 3 ||
    step === 4 ||
    (step === 5 && !!bodyType) ||
    (step === 6 && !!activity);

  const next = () => {
    if (step < TOTAL) setStep(step + 1);
    else finish();
  };
  const skip = () => setStep(step + 1);
  const back = () => step > 1 && setStep(step - 1);

  const finish = () => {
    setTraining(true);
    setTimeout(() => {
      update({
        profile: {
          fio: fio.trim(),
          birthYear: Number(birthYear),
          gender: gender!,
          height: height ? Number(height) : undefined,
          weight: weight ? Number(weight) : undefined,
          bodyType: bodyType!,
          activity: activity!,
          createdAt: new Date().toISOString(),
        },
      });
      onComplete();
    }, 2600);
  };

  if (training) return <TrainingScreen />;

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pt-10 pb-8">
        <header className="flex items-center justify-between">
          {step > 1 ? (
            <button onClick={back} className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-soft text-text-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}
          <span className="text-xs font-medium tracking-wide text-text-muted">Step {step} of {TOTAL}</span>
          <div className="h-10 w-10" />
        </header>

        <div className="mt-6 h-1.5 rounded-full bg-secondary-bg overflow-hidden">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${(step / TOTAL) * 100}%` }}
          />
        </div>

        <div className="mt-10 flex-1 animate-fade-in" key={step}>
          {step === 1 && (
            <StepShell title="Profile Info" subtitle="Let's start with the basics.">
              <Field label="Full Name (FIO)">
                <input
                  autoFocus
                  value={fio}
                  onChange={(e) => setFio(e.target.value)}
                  placeholder="e.g. Ali Valiyev"
                  className="input-primary"
                />
              </Field>
              <Field label="Birth Year">
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")}
                  placeholder="1995"
                  className="input-primary"
                />
              </Field>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="Gender" subtitle="Select your gender.">
              <div className="grid grid-cols-2 gap-4">
                <ChoiceCard active={gender === "male"} onClick={() => setGender("male")} icon={<User2 className="h-8 w-8" />} label="Male" tint="blue" />
                <ChoiceCard active={gender === "female"} onClick={() => setGender("female")} icon={<User2 className="h-8 w-8" />} label="Female" tint="pink" />
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="Height" subtitle="Enter your height (optional)." optional>
              <div className="rounded-3xl bg-surface p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-button">
                    <Ruler className="h-6 w-6" />
                  </div>
                  <div className="flex-1 flex items-baseline gap-2">
                    <input
                      inputMode="numeric"
                      value={height}
                      onChange={(e) => setHeight(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")}
                      placeholder="175"
                      className="w-full bg-transparent text-4xl font-bold text-text-primary outline-none"
                    />
                    <span className="text-lg font-medium text-text-muted">cm</span>
                  </div>
                </div>
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell title="Weight" subtitle="Enter your weight (optional)." optional>
              <div className="rounded-3xl bg-surface p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-button">
                    <WeightIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 flex items-baseline gap-2">
                    <input
                      inputMode="numeric"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")}
                      placeholder="70"
                      className="w-full bg-transparent text-4xl font-bold text-text-primary outline-none"
                    />
                    <span className="text-lg font-medium text-text-muted">kg</span>
                  </div>
                </div>
              </div>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell title="Body Type" subtitle="Select your body type.">
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { k: "skinny", label: "Ozgin", sub: "Skinny", d: 0.7 },
                    { k: "average", label: "O'rtacha", sub: "Average", d: 1 },
                    { k: "bulk", label: "Semiz", sub: "Bulk", d: 1.4 },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setBodyType(b.k)}
                    className={`group rounded-3xl border p-4 pt-5 transition-all ${
                      bodyType === b.k
                        ? "border-brand bg-white shadow-hero"
                        : "border-border bg-surface shadow-soft hover:-translate-y-0.5"
                    }`}
                  >
                    <BodySilhouette scale={b.d} highlighted={bodyType === b.k} />
                    <div className="mt-2 text-sm font-semibold text-text-primary">{b.label}</div>
                    <div className="text-[11px] text-text-muted">{b.sub}</div>
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 6 && (
            <StepShell title="Activity Level" subtitle="How active are you?">
              <div className="space-y-3">
                {(
                  [
                    { k: "athlete", label: "Sportsmen", sub: "Professional Athlete", icon: <Trophy className="h-5 w-5" /> },
                    { k: "active", label: "Aktiv shug'ullanadi", sub: "Regular / Active Exercise", icon: <Dumbbell className="h-5 w-5" /> },
                    { k: "sedentary", label: "Shug'ullanmaydi", sub: "Sedentary / No Exercise", icon: <Sofa className="h-5 w-5" /> },
                  ] as const
                ).map((a) => (
                  <button
                    key={a.k}
                    onClick={() => setActivity(a.k)}
                    className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      activity === a.k ? "border-brand bg-white shadow-hero" : "border-border bg-surface shadow-soft"
                    }`}
                  >
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${activity === a.k ? "gradient-primary text-white" : "bg-secondary-bg text-brand"}`}>
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-text-primary">{a.label}</div>
                      <div className="text-xs text-text-muted">{a.sub}</div>
                    </div>
                    {activity === a.k && (
                      <div className="grid h-6 w-6 place-items-center rounded-full gradient-primary text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </StepShell>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          {(step === 3 || step === 4) && (
            <button onClick={skip} className="flex-1 h-14 rounded-2xl border border-border bg-surface text-sm font-semibold text-text-secondary">
              Skip
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext}
            className="flex-1 h-14 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {step === TOTAL ? "Finish" : "Next"}
            {step !== TOTAL && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <style>{`
        .input-primary {
          width: 100%;
          height: 56px;
          border-radius: 18px;
          background: white;
          border: 1px solid var(--input);
          padding: 0 18px;
          font-size: 15px;
          color: var(--text-primary);
          outline: none;
          transition: box-shadow .15s, border-color .15s;
        }
        .input-primary:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 4px rgba(79,107,255,.10);
        }
      `}</style>
    </div>
  );
}

function StepShell({ title, subtitle, optional, children }: { title: string; subtitle: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight text-text-primary">
        {title} {optional && <span className="text-sm font-medium text-text-muted">(Optional)</span>}
      </h1>
      <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ChoiceCard({ active, onClick, icon, label, tint }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; tint: "blue" | "pink" }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-3xl p-6 pt-8 flex flex-col items-center gap-3 border transition-all ${
        active ? "border-brand bg-white shadow-hero" : "border-border bg-surface shadow-soft"
      }`}
    >
      <div
        className={`grid h-16 w-16 place-items-center rounded-2xl ${
          active ? "gradient-primary text-white shadow-button" : tint === "blue" ? "bg-[#EEF2FF] text-brand" : "bg-[#FCE7F3] text-pink-500"
        }`}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold text-text-primary">{label}</div>
      {active && (
        <div className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full gradient-primary text-white">
          <Check className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}

function BodySilhouette({ scale, highlighted }: { scale: number; highlighted: boolean }) {
  const shoulderW = 26 * scale;
  const waistW = 18 * scale;
  const color = highlighted ? "url(#bg-grad)" : "#CBD5E1";
  return (
    <svg viewBox="0 0 80 110" className="mx-auto h-24">
      <defs>
        <linearGradient id="bg-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#4F6BFF" />
          <stop offset="1" stopColor="#7B5CFF" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="14" r="9" fill={color} />
      <path
        d={`M ${40 - shoulderW} 30 Q ${40 - shoulderW - 3} 50 ${40 - waistW} 60 L ${40 - waistW - 2} 95 L ${40 - 4} 95 L ${40 - 2} 65 L ${40 + 2} 65 L ${40 + 4} 95 L ${40 + waistW + 2} 95 L ${40 + waistW} 60 Q ${40 + shoulderW + 3} 50 ${40 + shoulderW} 30 Z`}
        fill={color}
      />
    </svg>
  );
}

function TrainingScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const messages = [
    "Injecting profile details...",
    "Analyzing calorie requirements...",
    "Setting up local knowledge base...",
    "AI Assistant is ready!",
  ];
  useState(() => {
    messages.forEach((m, i) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, m]);
        setProgress(((i + 1) / messages.length) * 100);
      }, 400 + i * 500);
    });
  });
  return (
    <div className="min-h-dvh grid place-items-center bg-background px-6">
      <div className="w-full max-w-[420px] text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-text-primary">Pre-training your <br /> AI Assistant...</h2>

        <div className="relative mx-auto mt-10 h-52 w-52">
          <div className="absolute inset-0 rounded-full gradient-mesh blur-2xl opacity-70 animate-ai-pulse" />
          <div className="absolute inset-6 rounded-full gradient-mesh animate-ai-pulse" />
          <div className="absolute inset-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40" />
          <div className="absolute inset-0 rounded-full border-2 border-brand/40 animate-ai-ring" />
          <div className="absolute inset-0 rounded-full border-2 border-brand-indigo/40 animate-ai-ring" style={{ animationDelay: "0.8s" }} />
        </div>

        <div className="mt-10 rounded-3xl bg-surface shadow-card p-5 text-left">
          <div className="space-y-2">
            {logs.map((m, i) => (
              <div key={i} className="flex items-center gap-2 animate-fade-in">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm text-text-secondary">{m}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-secondary-bg overflow-hidden">
              <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-semibold text-brand">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-xs text-text-muted">
          <Activity className="h-3.5 w-3.5" />
          Running locally, no internet required
        </div>
      </div>
    </div>
  );
}
