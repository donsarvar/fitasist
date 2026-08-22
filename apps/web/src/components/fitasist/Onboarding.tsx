import { BACKEND_URL } from "@/lib/fitasist/config";
import { useState } from "react";
import { ArrowLeft2 as ArrowLeft, ArrowRight2 as ArrowRight, TickSquare as Check, Ruler, Weight as WeightIcon, Profile as User2, Activity, Flash as Dumbbell, UserTag as Sofa, Cup as Trophy } from "iconsax-react";
import { useFit } from "@/lib/fitasist/store";
import type { ActivityLevel, BodyType, Gender, Language } from "@/lib/fitasist/types";

const TOTAL = 6;

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { update, user } = useFit();
  const [step, setStep] = useState(1);
  const [fio, setFio] = useState("");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [bodyType, setBodyType] = useState<BodyType | null>(null);
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [lang, setLang] = useState<Language>("uz");
  const [training, setTraining] = useState(false);

  const canNext =
    (step === 1 && fio.trim().length > 1 && String(birthYear).length === 4) ||
    (step === 2 && gender !== null) ||
    step === 3 ||
    step === 4 ||
    (step === 5 && bodyType !== null) ||
    (step === 6 && activity !== null);

  const next = () => {
    if (step < TOTAL) setStep(step + 1);
    else finish();
  };
  const skip = () => setStep(step + 1);
  const back = () => step > 1 && setStep(step - 1);

  const finish = () => {
    setTraining(true);
    const newProfile = {
      fio: fio.trim(),
      birthYear: Number(birthYear),
      gender: gender!,
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      bodyType: bodyType!,
      activity: activity!,
      language: lang,
      createdAt: new Date().toISOString(),
      email: user?.email || null,
    };

    setTimeout(() => {
      update({ profile: newProfile });

      // Notify Telegram Admin Bot
      fetch(`${BACKEND_URL}/notify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_user",
          user: newProfile
        })
      }).catch(err => console.error("Telegram admin notification error:", err));

      onComplete();
    }, 2600);
  };

  const t = (key: string) => {
    const dict: Record<Language, Record<string, string>> = {
      uz: {
        stepText: "qadam",
        personalInfo: "Shaxsiy ma'lumotlar",
        basicInfo: "Asosiy ma'lumotlarni kiriting.",
        fullName: "To'liq ism (FIO)",
        fullNamePlaceholder: "masalan, Sarvarbek Salimov",
        birthYear: "Tug'ilgan yil",
        gender: "Jins",
        genderSub: "Jinsingizni tanlang.",
        male: "Erkak",
        female: "Ayol",
        height: "Bo'y",
        heightSub: "Bo'yingizni kiriting (ixtiyoriy).",
        weight: "Vazn",
        weightSub: "Vazningizni kiriting (ixtiyoriy).",
        bodyType: "Tana turi",
        bodyTypeSub: "Tana turingizni tanlang.",
        bodySkinny: "Ozg'in",
        bodyAverage: "O'rtacha",
        bodyBulk: "Semiz",
        bodyEcto: "Ektomorf",
        bodyMeso: "Mezomorf",
        bodyEndo: "Endomorf",
        activity: "Faollik darajasi",
        activitySub: "Qanchalik faol mashq qilasiz?",
        actAthlete: "Sportchi",
        actAthleteSub: "Professional sportchi",
        actActive: "Faol mashq qiladi",
        actActiveSub: "Muntazam / Faol mashqlar",
        actSedentary: "Mashq qilmaydi",
        actSedentarySub: "Kam harakatli / Mashqsiz",
        skip: "O'tkazish",
        next: "Keyingisi",
        finish: "Yakunlash",
      },
      ru: {
        stepText: "шаг",
        personalInfo: "Личные данные",
        basicInfo: "Введите основную информацию.",
        fullName: "Полное имя (ФИО)",
        fullNamePlaceholder: "например, Сарварбек Салимов",
        birthYear: "Год рождения",
        gender: "Пол",
        genderSub: "Выберите ваш пол.",
        male: "Мужской",
        female: "Женский",
        height: "Рост",
        heightSub: "Введите ваш рост (необязательно).",
        weight: "Вес",
        weightSub: "Введите ваш вес (необязательно).",
        bodyType: "Тип телосложения",
        bodyTypeSub: "Выберите ваш тип телосложения.",
        bodySkinny: "Худощавый",
        bodyAverage: "Средний",
        bodyBulk: "Плотный",
        bodyEcto: "Эктоморф",
        bodyMeso: "Мезоморф",
        bodyEndo: "Эндоморф",
        activity: "Уровень активности",
        activitySub: "Как часто вы тренируетесь?",
        actAthlete: "Спортсмен",
        actAthleteSub: "Профессиональный спортсмен",
        actActive: "Активно тренируюсь",
        actActiveSub: "Регулярные / Активные тренировки",
        actSedentary: "Не тренируюсь",
        actSedentarySub: "Малоподвижный образ жизни",
        skip: "Пропустить",
        next: "Далее",
        finish: "Завершить",
      },
      en: {
        stepText: "step",
        personalInfo: "Personal Info",
        basicInfo: "Enter your basic information.",
        fullName: "Full Name",
        fullNamePlaceholder: "e.g., Sarvarbek Salimov",
        birthYear: "Birth Year",
        gender: "Gender",
        genderSub: "Select your gender.",
        male: "Male",
        female: "Female",
        height: "Height",
        heightSub: "Enter your height (optional).",
        weight: "Weight",
        weightSub: "Enter your weight (optional).",
        bodyType: "Body Type",
        bodyTypeSub: "Select your body type.",
        bodySkinny: "Slim",
        bodyAverage: "Average",
        bodyBulk: "Heavy",
        bodyEcto: "Ectomorph",
        bodyMeso: "Mesomorph",
        bodyEndo: "Endomorph",
        activity: "Activity Level",
        activitySub: "How active are you?",
        actAthlete: "Athlete",
        actAthleteSub: "Professional athlete",
        actActive: "Active",
        actActiveSub: "Regular / Active workouts",
        actSedentary: "Sedentary",
        actSedentarySub: "Low activity / No workouts",
        skip: "Skip",
        next: "Next",
        finish: "Finish",
      }
    };
    return dict[lang]?.[key] || dict["uz"]?.[key] || key;
  };

  if (training) return <TrainingScreen />;

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pt-[calc(16px+env(safe-area-inset-top))] pb-8">
        <header className="flex items-center justify-between">
          {step > 1 ? (
            <button onClick={back} className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-soft text-text-secondary">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}
          <span className="text-xs font-medium tracking-wide text-text-muted">
            {lang === "en" ? `Step ${step} / ${TOTAL}` : `${step}-${t("stepText")} / ${TOTAL}`}
          </span>
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
            <StepShell title={t("personalInfo")} subtitle={t("basicInfo")}>
              <Field label={t("fullName")}>
                <input
                  autoFocus
                  value={fio}
                  onChange={(e) => setFio(e.target.value)}
                  placeholder={t("fullNamePlaceholder")}
                  className="input-primary"
                />
              </Field>
              <Field label={t("birthYear")}>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")}
                  placeholder="2000"
                  className="input-primary"
                />
              </Field>
              <Field label="Muloqot tili / Язык / Language">
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { k: "uz", l: "O'zbekcha 🇺🇿" },
                    { k: "ru", l: "Русский 🇷🇺" },
                    { k: "en", l: "English 🇬🇧" },
                  ] as const).map((x) => (
                    <button
                      type="button"
                      key={x.k}
                      onClick={() => setLang(x.k)}
                      className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                        lang === x.k
                          ? "gradient-primary border-brand text-white shadow-soft"
                          : "border-border dark:border-border/10 bg-secondary-bg dark:bg-[#15161f] text-text-secondary"
                      }`}
                    >
                      {x.l}
                    </button>
                  ))}
                </div>
              </Field>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title={t("gender")} subtitle={t("genderSub")}>
              <div className="grid grid-cols-2 gap-4">
                {/* Male Card */}
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`relative rounded-3xl border p-4 flex flex-col items-center justify-between transition-all overflow-hidden ${
                    gender === "male"
                      ? "border-brand bg-gradient-to-b from-brand/10 via-surface to-surface shadow-hero ring-2 ring-brand/20 scale-[1.02]"
                      : "border-border/70 dark:border-border/20 bg-surface shadow-soft hover:border-brand/40 active:scale-[0.98]"
                  }`}
                >
                  <div className="w-full h-44 flex items-center justify-center p-1 relative">
                    {gender === "male" && (
                      <div className="absolute inset-0 bg-brand/15 blur-xl rounded-full pointer-events-none" />
                    )}
                    <img
                      src="/body_types/male_mesomorph.png"
                      alt={t("male")}
                      className="h-full max-w-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 text-center relative z-10">
                    <div className="text-base font-extrabold text-text-primary">{t("male")}</div>
                    <div className="text-[11px] font-semibold text-text-muted mt-0.5">Erkak / Male</div>
                  </div>
                  {gender === "male" && (
                    <div className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full gradient-primary text-white shadow-xs z-20">
                      <Check className="h-3.5 w-3.5" variant="Bold" />
                    </div>
                  )}
                </button>

                {/* Female Card */}
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`relative rounded-3xl border p-4 flex flex-col items-center justify-between transition-all overflow-hidden ${
                    gender === "female"
                      ? "border-pink-500 bg-gradient-to-b from-pink-500/10 via-surface to-surface shadow-hero ring-2 ring-pink-500/20 scale-[1.02]"
                      : "border-border/70 dark:border-border/20 bg-surface shadow-soft hover:border-pink-500/40 active:scale-[0.98]"
                  }`}
                >
                  <div className="w-full h-44 flex items-center justify-center p-1 relative">
                    {gender === "female" && (
                      <div className="absolute inset-0 bg-pink-500/15 blur-xl rounded-full pointer-events-none" />
                    )}
                    <img
                      src="/body_types/female_mesomorph.png"
                      alt={t("female")}
                      className="h-full max-w-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 text-center relative z-10">
                    <div className="text-base font-extrabold text-text-primary">{t("female")}</div>
                    <div className="text-[11px] font-semibold text-text-muted mt-0.5">Ayol / Female</div>
                  </div>
                  {gender === "female" && (
                    <div className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full bg-pink-500 text-white shadow-xs z-20">
                      <Check className="h-3.5 w-3.5" variant="Bold" />
                    </div>
                  )}
                </button>
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title={t("height")} subtitle={t("heightSub")} optional>
              <div className="rounded-3xl bg-surface p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-button">
                    <Ruler size={24} />
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
            <StepShell title={t("weight")} subtitle={t("weightSub")} optional>
              <div className="rounded-3xl bg-surface p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-button">
                    <WeightIcon size={24} />
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
            <StepShell title={t("bodyType")} subtitle={t("bodyTypeSub")}>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { k: "skinny", label: t("bodySkinny"), sub: t("bodyEcto"), imgKey: "ectomorph" },
                    { k: "average", label: t("bodyAverage"), sub: t("bodyMeso"), imgKey: "mesomorph" },
                    { k: "bulk", label: t("bodyBulk"), sub: t("bodyEndo"), imgKey: "endomorph" },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setBodyType(b.k)}
                    className={`group rounded-[24px] border bg-white dark:bg-surface px-1 pt-1 pb-5 flex flex-col items-center transition-all ${
                      bodyType === b.k
                        ? "border-brand shadow-hero ring-2 ring-brand/10"
                        : "border-transparent shadow-soft active:scale-[0.98]"
                    }`}
                  >
                    <div className="w-full h-40 flex items-center justify-center p-2 mb-1">
                       <img 
                         src={`/body_types/${gender === 'male' ? 'male' : 'female'}_${b.imgKey}.png`} 
                         alt={b.label} 
                         className="h-full max-w-full object-contain transition-transform duration-300 group-active:scale-95" 
                       />
                    </div>
                    <div className="text-[15px] font-bold text-text-primary mt-1">{b.label}</div>
                    <div className="text-[12px] font-medium text-text-muted mt-0.5">{b.sub}</div>
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 6 && (
            <StepShell title={t("activity")} subtitle={t("activitySub")}>
              <div className="space-y-3">
                {(
                  [
                    { k: "athlete", label: t("actAthlete"), sub: t("actAthleteSub"), icon: <Trophy size={20} /> },
                    { k: "active", label: t("actActive"), sub: t("actActiveSub"), icon: <Dumbbell size={20} /> },
                    { k: "sedentary", label: t("actSedentary"), sub: t("actSedentarySub"), icon: <Sofa size={20} /> },
                  ] as const
                ).map((a) => (
                  <button
                    key={a.k}
                    onClick={() => setActivity(a.k)}
                    className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      activity === a.k ? "border-brand bg-white dark:bg-surface-elevated shadow-hero" : "border-border bg-surface shadow-soft"
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
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </StepShell>
          )}
        </div>

        <div className="mt-8 pb-[env(safe-area-inset-bottom)] flex items-center gap-3">
          {(step === 3 || step === 4) && (
            <button onClick={skip} className="flex-1 h-14 rounded-2xl border border-border bg-surface text-sm font-semibold text-text-secondary">
              {t("skip")}
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext}
            className="flex-1 h-14 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {step === TOTAL ? t("finish") : t("next")}
            {step !== TOTAL && <ArrowRight size={16} />}
          </button>
        </div>
      </div>

      <style>{`
        .input-primary {
          width: 100%;
          height: 56px;
          border-radius: 18px;
          background: var(--surface);
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
        {title} {optional && <span className="text-sm font-medium text-text-muted">(Ixtiyoriy)</span>}
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
        active ? "border-brand bg-white dark:bg-surface-elevated shadow-hero" : "border-border bg-surface shadow-soft"
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
          <Check size={16} />
        </div>
      )}
    </button>
  );
}

// BodySilhouette removed as we use exact PNG assets now

function TrainingScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const messages = [
    "Profil ma'lumotlari yuklanmoqda...",
    "Kaloriya ehtiyoji tahlil qilinmoqda...",
    "Mahalliy bilimlar bazasi sozlanmoqda...",
    "AI Yordamchi tayyor!",
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
        <h2 className="text-2xl font-bold text-text-primary">AI Yordamchingiz <br /> tayyorlanmoqda...</h2>

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
          Google Gemini AI bilan quvvatlangan
        </div>
      </div>
    </div>
  );
}
