import React, { useState } from "react";
import {
  Target02Icon,
  FlashIcon,
  RulerIcon,
  DropletIcon,
  CheckmarkCircle01Icon,
} from "hugeicons-react";
import { today } from "@/lib/fitasist/storage";
import { Sheet } from "../../common/ui";

interface NewGoalSheetProps {
  onClose: () => void;
  onCreate: (form: {
    name: string;
    duration: number;
    dailyTarget: string;
    startDate: string;
  }) => void;
  lang?: string;
}

const TEMPLATES = [
  {
    icon: <Target02Icon size={16} className="text-amber-500" />,
    name: "Planka mashqi",
    duration: 30,
    dailyTarget: "2 daqiqa",
  },
  {
    icon: <FlashIcon size={16} className="text-blue-500" />,
    name: "Otjimaniya (Push-up)",
    duration: 30,
    dailyTarget: "50 marta",
  },
  {
    icon: <RulerIcon size={16} className="text-emerald-500" />,
    name: "Kunlik yugurish",
    duration: 30,
    dailyTarget: "3 km",
  },
  {
    icon: <DropletIcon size={16} className="text-sky-500" />,
    name: "Suv ichish odati",
    duration: 21,
    dailyTarget: "2 litr",
  },
];

export function NewGoalSheet({ onClose, onCreate, lang = "uz" }: NewGoalSheetProps) {
  const [form, setForm] = useState({
    name: "",
    duration: 30,
    dailyTarget: "",
    startDate: today(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate({
      name: form.name.trim(),
      duration: Number(form.duration) || 30,
      dailyTarget: form.dailyTarget.trim(),
      startDate: form.startDate,
    });
    onClose();
  };

  return (
    <Sheet
      onClose={onClose}
      title="Yangi Maqsad Yaratish"
      subtitle="O'zingizga yangi chaqiruv yoki odat belgilang"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Templates */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
            Tezkor Shablonlar
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setForm({
                    name: tpl.name,
                    duration: tpl.duration,
                    dailyTarget: tpl.dailyTarget,
                    startDate: today(),
                  })
                }
                className={
                  "flex flex-col items-start p-3 rounded-2xl border text-left transition-all active-press " +
                  (form.name === tpl.name
                    ? "bg-brand/10 border-brand text-brand font-bold shadow-soft"
                    : "bg-secondary-bg/40 border-border/50 hover:border-brand/40 text-text-primary")
                }
              >
                <div className="flex items-center gap-1.5 font-extrabold text-[11px] leading-tight">
                  {tpl.icon}
                  <span>{tpl.name}</span>
                </div>
                <div className="mt-1 text-[9px] text-text-muted">
                  {tpl.duration} kun • {tpl.dailyTarget}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3 pt-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
              Maqsad nomi
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masalan: 30 kunlik Otjimaniya"
              className="mt-1 w-full h-12 rounded-2xl border border-input dark:border-white/10 bg-white dark:bg-[#12131a] text-text-primary px-3.5 text-sm outline-none focus:border-brand transition-all"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                Davomiyligi (kun)
              </span>
              <input
                type="number"
                min={1}
                max={365}
                required
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
                }
                className="mt-1 w-full h-12 rounded-2xl border border-input dark:border-white/10 bg-white dark:bg-[#12131a] text-text-primary px-3.5 text-sm outline-none focus:border-brand transition-all"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                Boshlanish sanasi
              </span>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="mt-1 w-full h-12 rounded-2xl border border-input dark:border-white/10 bg-white dark:bg-[#12131a] text-text-primary px-3.5 text-sm outline-none focus:border-brand transition-all"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
              Kunlik vazifa
            </span>
            <input
              value={form.dailyTarget}
              onChange={(e) =>
                setForm({ ...form, dailyTarget: e.target.value })
              }
              placeholder="Masalan: 50 marta yoki 2 km"
              className="mt-1 w-full h-12 rounded-2xl border border-input dark:border-white/10 bg-white dark:bg-[#12131a] text-text-primary px-3.5 text-sm outline-none focus:border-brand transition-all"
            />
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-13 rounded-2xl gradient-primary text-white text-sm font-bold shadow-button hover:opacity-95 transition-all active-press mt-2"
        >
          Maqsadni Yaratish
        </button>
      </form>
    </Sheet>
  );
}
