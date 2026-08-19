import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { useFit } from "@/lib/fitasist/store";
import { useHydration } from "@/hooks/useHydration";
import { t } from "@/lib/fitasist/translations";
import { SectionTitle, Card } from "../common/ui";

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
        <path d="M35 10 h30 v14 c0 4 8 6 8 20 v100 c0 8 -6 12 -14 12 h-18 c-8 0 -14 -4 -14 -12 v-100 c0 -14 8 -16 8 -20 z" fill="rgba(200,220,240,.25)" stroke="#CFDCEC" strokeWidth="1.5" />
        <g clipPath="url(#bottleClip)">
          <rect x="0" y={fillY * 1.6} width="100" height="160" fill="url(#waterFill)" />
          <path d={`M 0 ${fillY * 1.6} Q 25 ${fillY * 1.6 - 6}, 50 ${fillY * 1.6} T 100 ${fillY * 1.6} V 160 H 0 Z`} fill="#7DD3FC" opacity="0.5" className="animate-wave" />
        </g>
        <rect x="38" y="4" width="24" height="10" rx="3" fill="#CBD5E1" />
        <rect x="42" y="40" width="4" height="80" rx="2" fill="white" opacity="0.35" />
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
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">{t("waterBalance", lang)}</h1>

      <Card className="mt-5 p-5">
        <div className="flex items-center gap-5">
          <WaterBottle pct={pct} />
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{t("today", lang)}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-text-primary">{doneL.toFixed(1)}</span>
              <span className="text-lg text-text-muted">/ {targetL}</span>
            </div>
            <div className="text-xs text-text-muted">{lang === "ru" ? "Литры" : lang === "en" ? "Liters" : "Litr"}</div>
            <div className="mt-3 text-lg font-bold text-gradient-primary">{Math.round(pct)}%</div>
            <div className="text-[11px] text-text-muted">{t("dailyGoal", lang)}</div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[250, 350, 500].map((v) => (
          <button key={v} onClick={() => addWater(v)} className="h-12 rounded-2xl bg-white border border-border text-brand text-sm font-bold shadow-soft">+{v}ml</button>
        ))}
        <div className="relative">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")}
            onKeyDown={(e) => { if (e.key === "Enter" && custom) { addWater(Number(custom)); setCustom(""); } }}
            placeholder={lang === "ru" ? "+Другое" : lang === "en" ? "+Other" : "+Boshqa"}
            className="w-full h-12 rounded-2xl border border-dashed border-brand/50 bg-brand/5 text-brand text-sm font-bold placeholder:text-brand/70 text-center outline-none"
          />
        </div>
      </div>

      <SectionTitle>{t("supplements", lang)}</SectionTitle>
      <Card className="p-4 divide-y divide-divider">
        <SuppRow label={t("creatine", lang)}>
          <input type="number" value={h.creatineG || ""} onChange={(e) => updateSupplements({ creatineG: Number(e.target.value) || 0 })} placeholder="0" className="w-20 h-9 rounded-lg border border-border/80 dark:border-border/20 bg-secondary-bg/50 text-text-primary text-center px-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all font-semibold" />
        </SuppRow>
        <SuppRow label={t("proteinSupplement", lang)}>
          <input type="number" value={h.wheyG || ""} onChange={(e) => updateSupplements({ wheyG: Number(e.target.value) || 0 })} placeholder="0" className="w-20 h-9 rounded-lg border border-border/80 dark:border-border/20 bg-secondary-bg/50 text-text-primary text-center px-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all font-semibold" />
        </SuppRow>
        <SuppRow label={t("vitaminD", lang)}>
          <button onClick={() => updateSupplements({ vitaminD: !h.vitaminD })} className={`w-11 h-6 rounded-full relative transition-colors ${h.vitaminD ? "gradient-primary" : "bg-secondary-bg"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${h.vitaminD ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </SuppRow>
      </Card>

      {creatineWarning && (
        <div className="mt-5 rounded-3xl bg-warning/15 border border-warning/30 p-4 shadow-soft flex gap-3 animate-fade-in">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-warning text-white shrink-0">
            <Warning size={20} weight="fill" />
          </div>
          <p className="text-xs leading-relaxed text-[#7C4A03]">
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
