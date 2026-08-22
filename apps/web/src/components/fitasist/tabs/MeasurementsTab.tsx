import { useState } from "react";
import { Delete02Icon, ArrowDown01Icon, ArrowUp01Icon } from "hugeicons-react";
import { useFit } from "@/lib/fitasist/store";
import { useMeasurements } from "@/hooks/useMeasurements";
import type { Measurement, Language } from "@/lib/fitasist/types";
import { t } from "@/lib/fitasist/translations";
import { fmtDate } from "@/lib/fitasist/storage";
import { Card } from "../common/ui";

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

function StatBig({ label, value, diff: d, sub }: { label: string; value: number | string; diff: number | null; sub?: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-text-primary tracking-tight">{value}</span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      {sub && <div className="text-[10px] text-text-muted uppercase tracking-wide">{sub}</div>}
      {d !== null && (
        <div className={`mt-1 flex items-center text-[11px] font-medium ${d < 0 ? "text-success" : "text-warning"}`}>
          {d < 0 ? <ArrowDown01Icon size={12} /> : <ArrowUp01Icon size={12} />}
          {Math.abs(d)}
        </div>
      )}
    </div>
  );
}

export function MeasurementsTab() {
  const { state } = useFit();
  const { measurements, latest, prev, saveMeasurement, deleteMeasurement, diff } = useMeasurements();
  const lang = state.profile?.language || "uz";
  const [mode, setMode] = useState<"log" | "history">("log");
  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Measurement>>({});

  const save = () => {
    saveMeasurement(form);
    setForm({});
  };

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
          {measurements.length === 0 && (
            <Card className="p-8 text-center text-sm text-text-muted">
              {lang === "ru" ? "Записей пока нет." : lang === "en" ? "No records yet." : "Hali yozuvlar yo'q."}
            </Card>
          )}
          {[...measurements].reverse().map((m) => (
            <Card key={m.id} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs font-semibold text-text-primary">{fmtDate(m.date, lang)}</div>
                <div className="mt-1 text-xs text-text-muted">
                  {m.weight ? `${m.weight}kg` : "—"} · {m.chest ? `${t("chest", lang)} ${m.chest}sm` : ""} {m.biceps ? `· ${t("wrist", lang)} ${m.biceps}sm` : ""}
                </div>
              </div>
              <button onClick={() => deleteMeasurement(m.id)} className="grid h-8 w-8 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Delete02Icon size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
