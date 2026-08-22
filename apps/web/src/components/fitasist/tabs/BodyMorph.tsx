import { memo } from "react";
import { useFit } from "@/lib/fitasist/store";
import { t } from "@/lib/fitasist/translations";

interface BodyMorphProps {
  shoulder: number;
  waist: number;
}

export const BodyMorph = memo(function BodyMorph({ shoulder, waist }: BodyMorphProps) {
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
      <div className="w-24 h-36 flex items-center justify-center p-1 bg-secondary-bg dark:bg-surface-elevated rounded-2xl overflow-hidden shrink-0 border border-white/60 dark:border-white/10 shadow-ring">
        <img
          src={`/body_types/${gender}_${imgKey}.png`}
          alt={shape}
          className="h-full w-auto object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t("bodyShape", lang)}</div>
        <div className="text-lg font-bold text-text-primary mt-0.5 tracking-tight">{shape}</div>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed font-medium">{desc}</p>
        <div className="mt-2 text-[11px] font-medium text-text-muted">
          {lang === "ru" ? "Соотношение плеч к талии: " : lang === "en" ? "Shoulder-to-waist ratio: " : "Yelka-bel nisbati: "}
          <span className="font-bold text-brand tabular-nums">{ratio.toFixed(2)}</span>
          {lang === "ru" ? " (Цель >1.4)" : lang === "en" ? " (Target >1.4)" : " (Maqsad >1.4)"}
        </div>
      </div>
    </div>
  );
});
