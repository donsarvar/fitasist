import { useState } from "react";
import { Notification01Icon, ArrowDown01Icon, FlashIcon, Forward01Icon, Database01Icon } from "hugeicons-react";
import { useFit } from "@/lib/fitasist/store";
import { t } from "@/lib/fitasist/translations";

function DevBtn({ onClick, icon, title, sub }: { onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 rounded-xl bg-secondary-bg p-2.5 text-left">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-brand shadow-soft">{icon}</div>
      <div>
        <div className="text-xs font-semibold text-text-primary">{title}</div>
        <div className="text-[10px] text-text-muted">{sub}</div>
      </div>
    </button>
  );
}

export function DevPanel() {
  const { state, update, pushNotification } = useFit();
  const [open, setOpen] = useState(false);

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
    <div className="fixed bottom-24 right-4 z-40 max-w-[260px]">
      {open ? (
        <div className="rounded-3xl bg-surface shadow-card border border-border p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-text-primary">Dasturchi sinov paneli</div>
            <button onClick={() => setOpen(false)} className="text-text-muted"><ArrowDown01Icon size={16} /></button>
          </div>
          <div className="mt-3 space-y-2">
            <DevBtn onClick={fastForward} icon={<Forward01Icon size={16} />} title="1 kun oldinga surish" sub="Keyingi kunni simulyatsiya qilish" />
            <DevBtn onClick={simulate} icon={<Notification01Icon size={16} />} title="Xabarnomalarni yuborish" sub="Barcha bildirishnomalarni chiqarish" />
            <DevBtn onClick={fillMock} icon={<Database01Icon size={16} />} title="Test ma'lumotlarini to'ldirish" sub="30 kunlik o'lchov yaratish" />
          </div>
          <div className="mt-3 pt-3 border-t border-divider text-[10px] text-text-muted">
            Simulyatsiya sanasi: {currentDate.toLocaleDateString("uz-UZ", { month: "short", day: "numeric", year: "numeric" })}
            <br />(Faqat sinov maqsadida)
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-white shadow-button">
          <FlashIcon size={20} />
        </button>
      )}
    </div>
  );
}
