import { useState } from "react";
import { Chart2 as ChartBar, Drop, Ruler } from "iconsax-react";
import { useFit } from "@/lib/fitasist/store";
import { bodyFatNavy } from "@/lib/fitasist/coach";
import { t } from "@/lib/fitasist/translations";
import { fmtDate } from "@/lib/fitasist/storage";
import { SectionTitle, Card, NumField, Button } from "../common/ui";
import { HydrationTab } from "./HydrationTab";
import { MeasurementsTab } from "./MeasurementsTab";
import { BodyFatGauge } from "./BodyFatGauge";
import { BodyMorph } from "./BodyMorph";
import { SimpleProgressChart } from "./SimpleProgressChart";

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

  const chestData = state.measurements
    .slice(-30)
    .map((m) => ({ w: m.weight, c: m.chest, b: m.biceps, date: fmtDate(m.date, lang) }));

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
      {/* Tab Segment Selector */}
      <div className="p-1 rounded-2xl bg-surface/90 backdrop-blur-md border border-white/60 dark:border-white/10 flex items-center shadow-ring">
        <button
          onClick={() => setSubTab("analytics")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active-press ${
            subTab === "analytics"
              ? "gradient-primary text-white shadow-button"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <ChartBar size={14} variant="Bold" />
          <span>{lang === "ru" ? "Аналитика" : lang === "en" ? "Analytics" : "Analitika"}</span>
        </button>

        <button
          onClick={() => setSubTab("body")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active-press ${
            subTab === "body"
              ? "gradient-primary text-white shadow-button"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Ruler size={14} variant="Bold" />
          <span>{lang === "ru" ? "Замеры" : lang === "en" ? "Body" : "O'lchovlar"}</span>
        </button>

        <button
          onClick={() => setSubTab("water")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active-press ${
            subTab === "water"
              ? "gradient-primary text-white shadow-button"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Drop size={14} variant="Bold" />
          <span>{lang === "ru" ? "Вода" : lang === "en" ? "Water" : "Suv"}</span>
        </button>
      </div>

      {subTab === "body" && <MeasurementsTab />}
      {subTab === "water" && <HydrationTab />}
      {subTab === "analytics" && (
        <>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {t("fatCalculator", lang)}
              </span>
              <div className="rounded-xl bg-secondary-bg dark:bg-surface-elevated p-1 flex text-xs border border-white/40 dark:border-white/10 shadow-ring">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all active-press ${
                      gender === g ? "gradient-primary text-white shadow-button" : "text-text-muted"
                    }`}
                  >
                    {g === "male" ? t("maleLabel", lang) : t("femaleLabel", lang)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumField
                label={t("height", lang) + " (sm)"}
                value={form.height}
                onChange={(v) => setForm({ ...form, height: v })}
              />
              <NumField
                label={t("neck", lang) + " (sm)"}
                value={form.neck}
                onChange={(v) => setForm({ ...form, neck: v })}
              />
              <NumField
                label={t("waist", lang) + " (sm)"}
                value={form.waist}
                onChange={(v) => setForm({ ...form, waist: v })}
              />
              {gender === "female" && (
                <NumField
                  label={t("chest", lang) + "/" + t("waist", lang) + " (sm)"}
                  value={form.chest}
                  onChange={(v) => setForm({ ...form, chest: v })}
                />
              )}
            </div>

            <Button onClick={calc} className="mt-4 w-full" size="lg">
              {t("calculate", lang)}
            </Button>

            {bf !== null && (
              <div className="mt-6 animate-fade-in">
                <BodyFatGauge value={bf} />
                <div className="mt-3 grid grid-cols-5 gap-1 text-[9px] font-bold text-center tabular-nums">
                  {(["Essential", "Athletic", "Fitness", "Acceptable", "Obese"] as const).map(
                    (c, i) => (
                      <div
                        key={c}
                        className={`py-1.5 rounded-xl transition-all ${
                          category(bf) === c
                            ? "gradient-primary text-white shadow-button font-black"
                            : "bg-secondary-bg dark:bg-surface-elevated text-text-muted border border-border/40"
                        }`}
                      >
                        <div>{c}</div>
                        <div className="text-[8px] opacity-75 mt-0.5">
                          {["0-10%", "10-14%", "14-18%", "18-25%", "25%+"][i]}
                        </div>
                      </div>
                    )
                  )}
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
              <div className="p-6 text-center text-xs font-medium text-text-muted">
                {t("moreMeasurements", lang)}
              </div>
            ) : (
              <SimpleProgressChart data={chestData} />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
