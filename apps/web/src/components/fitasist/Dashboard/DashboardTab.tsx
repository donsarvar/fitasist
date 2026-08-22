import { useMemo } from "react";
import { Edit2 } from "iconsax-react";
import { useFit } from "@/lib/fitasist/store";
import { useCalories } from "@/hooks/useCalories";
import { useHydration } from "@/hooks/useHydration";
import { t } from "@/lib/fitasist/translations";
import { SectionTitle, Card } from "../common/ui";
import { AIHeroCard } from "./AIHeroCard";
import { MarathonCard } from "./MarathonCard";
import { RingCard } from "./RingCard";
import { ScoreCard } from "./ScoreCard";
import { MiniTrend } from "./MiniTrend";

interface Props {
  onOpenChat: () => void;
  onOpenCalorie: () => void;
  onOpenSettings: () => void;
  onOpenMarathons: () => void;
}

export function DashboardTab({ onOpenChat, onOpenCalorie, onOpenSettings, onOpenMarathons }: Props) {
  const { state } = useFit();
  const { calTarget, calDone, proteinTarget, proteinDone } = useCalories();
  const { targetL: waterTarget, doneL: waterDoneL, hydration: h } = useHydration();
  const p = state.profile;

  const health = Math.max(50, Math.min(99,
    70 +
    (h.waterMl / 1000 / (waterTarget || 2.5)) * 15 +
    (calDone > 0 ? 10 : 0) +
    (h.wheyG > 0 ? 5 : 0)
  ));

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
        <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{t("goodMorning", p?.language)}</div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary leading-tight mt-0.5">
          {t("hello", p?.language)} {p?.fio?.split(" ")[0] ?? t("friend", p?.language)}! <span className="animate-floaty inline-block">👋</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-text-muted">{t("awesomeDay", p?.language)}</p>
      </div>

      <AIHeroCard onOpenChat={onOpenChat} />

      <MarathonCard onOpenMarathons={onOpenMarathons} />

      {/* Personal Motivational Goal Banner */}
      {p?.goal ? (
        <div className="mt-4 p-4 rounded-3xl bg-surface/90 backdrop-blur-md shadow-ring border border-white/80 dark:border-white/[0.08] flex items-center justify-between gap-3 group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand font-bold text-base shrink-0 shadow-soft">🎯</div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Shaxsiy Maqsadingiz</span>
              <p className="text-xs font-bold text-text-primary mt-0.5 leading-snug truncate">{p.goal}</p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-secondary-bg text-text-muted hover:text-brand active-press transition-colors shrink-0"
            title="Maqsadni tahrirlash"
          >
            <Edit2 size={16} variant="Bold" />
          </button>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-3xl bg-surface/80 backdrop-blur-md border border-dashed border-border dark:border-white/10 shadow-ring flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-brand/10 text-brand font-bold text-sm shrink-0">🎯</div>
            <div>
              <p className="text-xs font-bold text-text-primary">Shaxsiy maqsadingizni belgilang</p>
              <p className="text-[10px] font-medium text-text-muted">Masalan: &quot;3 oyda 5 kg ozish!&quot;</p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-button hover:opacity-95 active-press transition-all shrink-0"
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
          pct={Math.round((calDone / (calTarget || 2000)) * 100)}
          tint="warning"
          onClick={onOpenCalorie}
        />
        <RingCard
          label={t("protein", p?.language)}
          value={`${Math.round(proteinDone)}g`}
          sub={`/ ${proteinTarget}g`}
          pct={Math.round((proteinDone / (proteinTarget || 120)) * 100)}
          tint="brand"
        />
        <RingCard
          label={t("waterIntake", p?.language)}
          value={`${waterDoneL.toFixed(1)}L`}
          sub={`/ ${waterTarget}L`}
          pct={Math.round((waterDoneL / (waterTarget || 2.5)) * 100)}
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
