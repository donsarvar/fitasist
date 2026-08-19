import { useState } from "react";
import { Trophy, Plus, CaretDown, Lightning, Drop, Ruler, Target, Check } from "@phosphor-icons/react";
import { useFit } from "@/lib/fitasist/store";
import { useChallenges } from "@/hooks/useChallenges";
import type { Challenge } from "@/lib/fitasist/types";
import { t } from "@/lib/fitasist/translations";
import { today, fmtDate } from "@/lib/fitasist/storage";
import { SectionTitle, Card } from "../common/ui";

export function ChallengesTab() {
  const { state } = useFit();
  const { activeChallenges, completedChallenges, mainChallenge, completeToday, createChallenge } = useChallenges();
  const lang = state.profile?.language || "uz";
  const [showForm, setShowForm] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [form, setForm] = useState({ name: "", duration: 30, dailyTarget: "", startDate: today() });

  const handleDoToday = (c: Challenge) => {
    const success = completeToday(c);
    if (success) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2500);
    }
  };

  const handleCreate = () => {
    createChallenge(form);
    setForm({ name: "", duration: 30, dailyTarget: "", startDate: today() });
    setShowForm(false);
  };

  return (
    <div>
      <h1 className="text-[26px] font-bold text-text-primary">{t("goalsTitle", lang)}</h1>

      {mainChallenge ? <ActiveChallengeCard c={mainChallenge} onDo={() => handleDoToday(mainChallenge)} /> : (
        <Card className="mt-5 p-8 text-center">
          <Trophy size={40} weight="fill" className="mx-auto text-brand" />
          <p className="mt-3 text-sm text-text-muted">
            {lang === "ru" ? "Активных целей нет. Создайте новую ниже!" : lang === "en" ? "No active goals. Create one below!" : "Faol maqsadlar yo'q. Quyida yangisini yarating!"}
          </p>
        </Card>
      )}

      <SectionTitle>{t("createNewGoal", lang)}</SectionTitle>
      <Card className="p-4">
        <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-between text-sm font-semibold text-text-primary">
          <span className="flex items-center gap-2"><Plus size={16} weight="bold" className="text-brand" /> {t("addNewGoal", lang)}</span>
          <CaretDown size={16} weight="bold" className={`text-text-muted transition-transform ${showForm ? "rotate-180" : ""}`} />
        </button>
        {showForm && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                {lang === "ru" ? "Быстрые шаблоны" : lang === "en" ? "Quick Templates" : "Tezkor shablonlar"}
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { icon: <Trophy size={14} weight="fill" className="text-amber-500" />, name: { uz: "Planka mashqi", ru: "Планка", en: "Plank Exercise" }, duration: 30, dailyTarget: { uz: "2 daqiqa", ru: "2 минуты", en: "2 minutes" } },
                  { icon: <Lightning size={14} weight="fill" className="text-blue-500" />, name: { uz: "Otjimaniya (Push-up)", ru: "Отжимания", en: "Push-ups" }, duration: 30, dailyTarget: { uz: "50 marta", ru: "50 раз", en: "50 times" } },
                  { icon: <Ruler size={14} weight="fill" className="text-emerald-500" />, name: { uz: "Kunlik yugurish", ru: "Ежедневный бег", en: "Daily Running" }, duration: 30, dailyTarget: { uz: "3 km", ru: "3 км", en: "3 km" } },
                  { icon: <Drop size={14} weight="fill" className="text-sky-500" />, name: { uz: "Suv ichish odati", ru: "Питье воды", en: "Water Intake" }, duration: 21, dailyTarget: { uz: "2 litr", ru: "2 литра", en: "2 liters" } },
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ name: tpl.name[lang] || tpl.name.uz, duration: tpl.duration, dailyTarget: tpl.dailyTarget[lang] || tpl.dailyTarget.uz, startDate: today() })}
                    className="flex flex-col items-start p-3 rounded-xl border border-border/40 hover:border-brand/40 bg-secondary-bg/30 text-left active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-text-primary text-[11px] leading-tight">{tpl.icon}<span>{tpl.name[lang] || tpl.name.uz}</span></div>
                    <div className="mt-1 text-[9px] text-text-muted">{tpl.duration} {lang === "ru" ? "дней" : lang === "en" ? "days" : "kun"} • {tpl.dailyTarget[lang] || tpl.dailyTarget.uz}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{lang === "ru" ? "Название цели" : lang === "en" ? "Goal Name" : "Maqsad nomi"}</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === "ru" ? "например, 30 дней Планка" : lang === "en" ? "e.g., 30 Days Plank" : "masalan, 30 kun Plank"} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{lang === "ru" ? "Длительность (дней)" : lang === "en" ? "Duration (days)" : "Davomiyligi (kun)"}</span>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{lang === "ru" ? "Дата начала" : lang === "en" ? "Start Date" : "Boshlanish sanasi"}</span>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <label className="col-span-2 block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{lang === "ru" ? "Дневная задача" : lang === "en" ? "Daily task" : "Kunlik vazifa"}</span>
                <input value={form.dailyTarget} onChange={(e) => setForm({ ...form, dailyTarget: e.target.value })} placeholder={lang === "ru" ? "например, 50 раз" : lang === "en" ? "e.g., 50 times" : "masalan, 50 marta"} className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand" />
              </label>
              <button onClick={handleCreate} className="col-span-2 h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
                {lang === "ru" ? "Создать цель" : lang === "en" ? "Create Goal" : "Maqsad yaratish"}
              </button>
            </div>
          </div>
        )}
      </Card>

      <SectionTitle>{t("completedGoals", lang)}</SectionTitle>
      {completedChallenges.length === 0 ? (
        <Card className="p-6 text-center space-y-2 border border-border">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 mx-auto font-bold text-xl">🏆</div>
          <h4 className="text-sm font-bold text-text-primary">Hali bajarilganlar yo'q</h4>
          <p className="text-xs text-text-muted">Birinchi maqsadingizni yakunlang va kuboklar vitrinasini boyiting!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {completedChallenges.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-3 bg-surface border border-border shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/15 text-amber-500 shrink-0 font-bold">🏆</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text-primary truncate">{c.name}</div>
                <div className="text-[11px] text-text-muted mt-0.5">Yakunlandi: {fmtDate(c.startDate, lang)} • {c.duration} kun</div>
              </div>
              <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 shrink-0">
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
  const pct = Math.round((done / c.duration) * 100);
  const todayDone = c.completedDays.includes(todayKey());

  return (
    <Card className="mt-5 p-6 relative overflow-hidden gradient-mesh text-white border-none shadow-hero">
      <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Faol Maqsad</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-[10px] font-extrabold text-amber-200 flex items-center gap-1 shadow-xs">🔥 {done} kunlik seriya</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 leading-snug">{c.name}</h2>
          <p className="text-xs text-white/80 font-medium">{done}-kun / {c.duration} kun ({c.dailyTarget})</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white leading-none">{pct}%</div>
          <div className="text-[9px] font-bold text-white/70 uppercase tracking-wider mt-1">Bajarildi</div>
        </div>
      </div>
      <div className="mt-4 w-full h-3 rounded-full bg-black/25 overflow-hidden p-0.5 relative z-10 border border-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 transition-all duration-700 shadow-sm" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-5 pt-4 border-t border-white/15 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-white/90 mb-2">
          <span>Haftalik tartib</span>
          <span className="text-white/70">{done} / {c.duration} kun bajarildi</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {Array.from({ length: 7 }, (_, i) => {
            const isCompleted = i < done;
            const isCurrent = i === done && !todayDone;
            return (
              <div key={i} className={`py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${isCompleted ? "bg-white/25 border-white/40 text-white shadow-soft font-bold" : isCurrent ? "bg-amber-400 text-slate-900 border-amber-300 font-extrabold scale-105 shadow-md" : "bg-white/5 border-white/10 text-white/50"}`}>
                <span className="text-[9px] uppercase tracking-wider">{i + 1}-kun</span>
                <span className="text-xs mt-0.5">{isCompleted ? "✅" : isCurrent ? "🎯" : "⚪"}</span>
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={onDo}
        disabled={todayDone}
        className={`mt-5 w-full h-14 rounded-2xl text-sm font-extrabold shadow-button transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10 ${todayDone ? "bg-emerald-500 text-white cursor-default opacity-90" : "bg-white text-brand hover:bg-white/95"}`}
      >
        {todayDone ? (
          <><Check className="h-5 w-5" /><span>Bugun uchun bajarildi! ✅</span></>
        ) : (
          <><Target className="h-5 w-5 text-brand" /><span>Bugun bajardim! 🎯</span></>
        )}
      </button>
    </Card>
  );
}

function ConfettiOverlay() {
  const colors = ["#4F6BFF", "#7B5CFF", "#22C55E", "#F59E0B", "#38BDF8"];
  const pieces = Array.from({ length: 80 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 0.6, dur: 1.4 + Math.random() * 1.2, color: colors[i % colors.length], w: 6 + Math.random() * 8, h: 8 + Math.random() * 14 }));
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div key={p.id} className="absolute rounded-sm" style={{ left: `${p.left}%`, top: 0, width: p.w, height: p.h, background: p.color, animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards` }} />
      ))}
    </div>
  );
}
