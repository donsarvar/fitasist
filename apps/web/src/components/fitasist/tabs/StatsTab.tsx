import { useState } from "react";
import { ChartBar, Drop, Ruler } from "@phosphor-icons/react";
import { useFit } from "@/lib/fitasist/store";
import { bodyFatNavy } from "@/lib/fitasist/coach";
import { t } from "@/lib/fitasist/translations";
import { fmtDate } from "@/lib/fitasist/storage";
import { SectionTitle, Card, NumField } from "../common/ui";
import { HydrationTab } from "./HydrationTab";
import { MeasurementsTab } from "./MeasurementsTab";

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
          <linearGradient id="weightGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#4F6BFF" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#4F6BFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--color-divider)" strokeWidth="1" strokeDasharray="3" />
        <line x1={padding} y1={padding + chartH / 2} x2={width - padding} y2={padding + chartH / 2} stroke="var(--color-divider)" strokeWidth="1" strokeDasharray="3" />
        <line x1={padding} y1={padding + chartH} x2={width - padding} y2={padding + chartH} stroke="var(--color-divider)" strokeWidth="1" />

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

export function StatsTab() {
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

      {subTab === "body" && <MeasurementsTab />}
      {subTab === "water" && <HydrationTab />}
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
