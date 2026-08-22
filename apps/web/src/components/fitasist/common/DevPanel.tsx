import { Notification01Icon, Forward01Icon, Database01Icon } from "hugeicons-react";
import { useFit } from "@/lib/fitasist/store";
import { t } from "@/lib/fitasist/translations";
import { Sheet } from "./ui";

function DevBtn({ onClick, icon, title, sub }: { onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 rounded-2xl bg-secondary-bg hover:bg-border/60 p-3 text-left transition-all active-press">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white dark:bg-surface text-brand shadow-soft shrink-0">{icon}</div>
      <div>
        <div className="text-xs font-bold text-text-primary">{title}</div>
        <div className="text-[10px] text-text-muted">{sub}</div>
      </div>
    </button>
  );
}

export function DevPanel({ onClose }: { onClose: () => void }) {
  const { state, update, pushNotification } = useFit();

  const fastForward = () => update({ simulatedDayOffset: state.simulatedDayOffset + 1 });

  const simulate = () => {
    const lang = state.profile?.language || "uz";
    pushNotification({ kind: "water", title: t("waterReminderTitle", lang), body: t("waterReminderBody", lang) });
    setTimeout(() => pushNotification({ kind: "challenge", title: lang === "ru" ? "Напоминание о цели" : lang === "en" ? "Goal Reminder" : "Maqsad eslatmasi", body: lang === "ru" ? "Вы выполнили задание цели сегодня?" : lang === "en" ? "Did you complete your daily goal task today?" : "Bugun 90 kunlik maqsad vazifangizni bajardingizmi?", action: lang === "ru" ? "Перейти к целям" : lang === "en" ? "Go to goals" : "Maqsadga o'tish" }), 800);
  };

  const fillMock = () => {
    const start = Date.now() - 30 * 86400 * 1000;
    const base = state.profile?.weight ?? 75;
    const mocks = Array.from({ length: 30 }, (_, i) => ({ id: crypto.randomUUID(), date: new Date(start + i * 86400 * 1000).toISOString(), weight: Math.round((base - i * 0.05 + (Math.random() - 0.5) * 0.6) * 10) / 10, chest: 96 + Math.round(i * 0.08 * 10) / 10, biceps: 34 + Math.round(i * 0.06 * 10) / 10, waist: 82 - Math.round(i * 0.1 * 10) / 10, neck: 38, height: state.profile?.height ?? 175, thighs: 56 }));
    update({ measurements: [...state.measurements, ...mocks] });
  };

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + state.simulatedDayOffset);

  return (
    <Sheet onClose={onClose} title="Dasturchi sinov paneli" subtitle="Faqat test va sinov maqsadida">
      <div className="space-y-3">
        <DevBtn onClick={fastForward} icon={<Forward01Icon size={18} />} title="1 kun oldinga surish" sub="Keyingi kunni simulyatsiya qilish" />
        <DevBtn onClick={simulate} icon={<Notification01Icon size={18} />} title="Xabarnomalarni yuborish" sub="Barcha bildirishnomalarni chiqarish" />
        <DevBtn onClick={fillMock} icon={<Database01Icon size={18} />} title="Test ma'lumotlarini to'ldirish" sub="30 kunlik o'lchov yaratish" />
      </div>
      <div className="mt-4 pt-3 border-t border-divider text-xs text-text-muted">
        Simulyatsiya sanasi: <span className="font-bold text-text-primary">{currentDate.toLocaleDateString("uz-UZ", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>
    </Sheet>
  );
}
