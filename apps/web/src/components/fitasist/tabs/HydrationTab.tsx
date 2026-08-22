import { useState } from "react";
import { Alert01Icon } from "hugeicons-react";
import { useFit } from "@/lib/fitasist/store";
import { useHydration } from "@/hooks/useHydration";
import { t } from "@/lib/fitasist/translations";
import { SectionTitle, Card } from "../common/ui";

function SuppRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3.5 flex items-center justify-between">
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      {children}
    </div>
  );
}

function WaterBottle({ pct }: { pct: number }) {
  const fillY = 100 - Math.min(100, Math.max(0, pct));
  return (
    <div className="relative h-40 w-24 shrink-0">
      <svg viewBox="0 0 100 160" className="h-full w-full">
        <defs>
          <linearGradient id="waterFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <clipPath id="bottleClip">
            <path d="M35 10 h30 v14 c0 4 8 6 8 20 v100 c0 8 -6 12 -14 12 h-18 c-8 0 -14 -4 -14 -12 v-100 c0 -14 8 -16 8 -20 z" />
          </clipPath>
        </defs>
        <path
          d="M35 10 h30 v14 c0 4 8 6 8 20 v100 c0 8 -6 12 -14 12 h-18 c-8 0 -14 -4 -14 -12 v-100 c0 -14 8 -16 8 -20 z"
          fill="rgba(56, 189, 248, 0.08)"
          stroke="currentColor"
          className="text-border dark:text-white/10"
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
        <rect x="38" y="4" width="24" height="10" rx="3" fill="#94A3B8" />
        <rect x="42" y="40" width="4" height="80" rx="2" fill="white" opacity="0.4" />
      </svg>
    </div>
  );
}

export function HydrationTab() {
  const { state } = useFit();
  const { hydration: h, targetL, doneL, pct, creatineWarning, addWater, updateSupplements } = useHydration();
  const lang = state.profile?.language || "uz";
  const [custom, setCustom] = useState<number | "">("");

  return (
    <div className="pb-10">
      <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary">{t("waterBalance", lang)}</h1>

      <Card className="mt-5 p-5">
        <div className="flex items-center gap-5">
          <WaterBottle pct={pct} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t("today", lang)}</div>
            <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-4xl font-black text-text-primary tracking-tight">{doneL.toFixed(1)}</span>
              <span className="text-lg font-bold text-text-muted">/ {targetL}</span>
              <span className="text-xs font-semibold text-text-muted">{lang === "ru" ? "л" : lang === "en" ? "L" : "L"}</span>
            </div>
            <div className="mt-3 text-xl font-black text-gradient-primary tabular-nums">{Math.round(pct)}%</div>
            <div className="text-[11px] font-semibold text-text-muted">{t("dailyGoal", lang)}</div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[250, 350, 500].map((v) => (
          <button
            key={v}
            onClick={() => addWater(v)}
            className="h-12 rounded-2xl bg-surface/90 dark:bg-surface-elevated/90 backdrop-blur-md border border-white/80 dark:border-white/10 text-brand text-xs font-black shadow-ring active-press transition-all select-none tabular-nums"
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
                addWater(Number(custom));
                setCustom("");
              }
            }}
            placeholder={lang === "ru" ? "+Другое" : lang === "en" ? "+Other" : "+Boshqa"}
            className="w-full h-12 rounded-2xl border border-dashed border-brand/50 bg-brand/5 dark:bg-brand/10 text-brand text-xs font-bold placeholder:text-brand/60 text-center outline-none transition-all tabular-nums"
          />
        </div>
      </div>

      <SectionTitle>{t("supplements", lang)}</SectionTitle>
      <Card className="p-4 divide-y divide-border/60 dark:divide-white/[0.06]">
        <SuppRow label={t("creatine", lang)}>
          <input
            type="number"
            value={h.creatineG || ""}
            onChange={(e) => updateSupplements({ creatineG: Number(e.target.value) || 0 })}
            placeholder="0"
            className="w-20 h-9 rounded-xl border border-input dark:border-white/10 bg-secondary-bg/50 dark:bg-surface-elevated text-text-primary text-center px-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-bold tabular-nums"
          />
        </SuppRow>
        <SuppRow label={t("proteinSupplement", lang)}>
          <input
            type="number"
            value={h.wheyG || ""}
            onChange={(e) => updateSupplements({ wheyG: Number(e.target.value) || 0 })}
            placeholder="0"
            className="w-20 h-9 rounded-xl border border-input dark:border-white/10 bg-secondary-bg/50 dark:bg-surface-elevated text-text-primary text-center px-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-bold tabular-nums"
          />
        </SuppRow>
        <SuppRow label={t("vitaminD", lang)}>
          <button
            onClick={() => updateSupplements({ vitaminD: !h.vitaminD })}
            className={`w-12 h-7 rounded-full relative transition-colors active-press ${
              h.vitaminD ? "gradient-primary shadow-button" : "bg-secondary-bg dark:bg-surface-elevated border border-border"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${
                h.vitaminD ? "left-[24px]" : "left-1"
              }`}
            />
          </button>
        </SuppRow>
      </Card>

      {creatineWarning && (
        <div className="mt-5 rounded-3xl bg-warning/10 border border-warning/30 p-4 shadow-soft flex gap-3 animate-fade-in">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-warning text-white shrink-0 shadow-soft">
            <Alert01Icon size={20} />
          </div>
          <p className="text-xs leading-relaxed text-warning-foreground dark:text-warning font-medium">
            {lang === "ru" ? (
              <><span className="font-bold">⚠️ Внимание!</span> Вы сегодня приняли {h.creatineG}г креатина, но на данный момент выпили всего {doneL.toFixed(1)} л воды. Чтобы избежать нагрузки на почки и обезвоживания, вам необходимо выпить еще как минимум {Math.max(0.3, 2.0 - doneL).toFixed(1)} л воды! 💧</>
            ) : lang === "en" ? (
              <><span className="font-bold">⚠️ Warning!</span> You took {h.creatineG}g of creatine today, but have only drank {doneL.toFixed(1)} L of water so far. To prevent kidney strain and dehydration, you must drink at least another {Math.max(0.3, 2.0 - doneL).toFixed(1)} L of water! 💧</>
            ) : (
              <><span className="font-bold">⚠️ Diqqat!</span> Siz bugun {h.creatineG}g Kreatin qabul qildingiz, lekin hozirgacha faqat {doneL.toFixed(1)} litr suv ichgansiz. Buyrakka yuklama tushmasligi va suvsizlanishning oldini olish uchun kamida yana {Math.max(0.3, 2.0 - doneL).toFixed(1)} litr suv ichishingiz shart! 💧</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
