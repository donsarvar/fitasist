import { useState } from "react";
import { Setting2 as GearSix, LogoutCurve as SignOut, Trash, ShieldTick as ShieldCheck, Edit2 as PencilSimple, Camera, Profile as User } from "iconsax-react";
import { useFit } from "@/lib/fitasist/store";
import { t } from "@/lib/fitasist/translations";
import { Sheet } from "./common/ui";

interface SettingsSheetProps {
  onClose: () => void;
  onAdminClick: () => void;
}

export function SettingsSheet({ onClose, onAdminClick }: SettingsSheetProps) {
  const { state, update, reset, logout, user } = useFit();
  const p = state.profile;
  const [form, setForm] = useState(p);
  const [confirmReset, setConfirmReset] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string" && form) {
        setForm({ ...form, photoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (form) update({ profile: form });
    onClose();
  };

  if (!form) return null;
  const lang = form.language || "uz";
  const displayPhoto = form.photoUrl || user?.photoURL;

  return (
    <Sheet onClose={onClose} title={t("settings", lang)} subtitle={lang === "ru" ? "Настройки приложения" : lang === "en" ? "App settings" : "Ilova sozlamalari"}>
      <div className="space-y-4">

        {/* Admin access (admin only) */}
        {user?.email === "salimovsarvar21@gmail.com" && (
          <button onClick={onAdminClick} className="w-full h-12 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-bold flex items-center justify-center gap-2 border border-amber-500/20 transition-all active:scale-95 mb-1">
            <ShieldCheck size={18} variant="Bold" /> FitAssist Admin
          </button>
        )}

        {/* Profile photo */}
        <div className="flex items-center gap-4">
          <label className="relative cursor-pointer group">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-brand shadow-button">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full gradient-primary flex items-center justify-center text-white font-bold text-xl">
                  {form.fio?.charAt(0) || "P"}
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" variant="Bold" />
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
          </label>
          <div className="flex-1">
            <div className="text-sm font-bold text-text-primary">{form.fio || t("friend", lang)}</div>
            <div className="text-xs text-text-muted">{user?.email}</div>
          </div>
        </div>

        {/* Full name */}
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{t("fio", lang)}</span>
          <input
            value={form.fio || ""}
            onChange={(e) => setForm({ ...form, fio: e.target.value })}
            placeholder={lang === "ru" ? "Ваше имя" : lang === "en" ? "Your name" : "Ismingiz"}
            className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand"
          />
        </label>

        {/* Personal goal */}
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{lang === "ru" ? "Личная цель" : lang === "en" ? "Personal Goal" : "Shaxsiy maqsad"}</span>
          <input
            value={form.goal || ""}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            placeholder={lang === "ru" ? "напр. 3 месяца -5 кг" : lang === "en" ? "e.g. lose 5kg in 3 months" : "masalan, 3 oyda 5 kg ozish"}
            className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand"
          />
        </label>

        {/* Language */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{t("language", lang)}</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {([{ k: "uz" as const, l: "O'zbekcha 🇺🇿" }, { k: "ru" as const, l: "Русский 🇷🇺" }, { k: "en" as const, l: "English 🇬🇧" }]).map((x) => (
              <button
                type="button"
                key={x.k}
                onClick={() => setForm({ ...form!, language: x.k })}
                className={"h-10 rounded-xl text-xs font-bold transition-all border " + ((form.language || "uz") === x.k ? "gradient-primary border-brand text-white shadow-soft" : "border-border dark:border-border/10 bg-secondary-bg dark:bg-[#15161f] text-text-secondary")}
              >
                {x.l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} className="w-full h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button">
          {lang === "ru" ? "Сохранить" : lang === "en" ? "Save" : "Saqlash"}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={async () => { await logout(); onClose(); }}
          className="w-full h-12 rounded-2xl bg-secondary-bg hover:bg-border text-text-primary text-sm font-semibold flex items-center justify-center gap-2 border border-border transition-all active:scale-95"
        >
          <SignOut size={16} variant="Bold" className="text-text-secondary" /> {t("logout", lang)}
        </button>

        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="w-full h-12 rounded-2xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2">
            <Trash size={16} variant="Bold" /> {lang === "ru" ? "Удалить все данные" : lang === "en" ? "Reset all data" : "Barcha malumotlarni ochirish"}
          </button>
        ) : (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
            <div className="text-sm font-semibold text-destructive">
              {lang === "ru" ? "Вы уверены? Все данные будут удалены." : lang === "en" ? "Are you sure? Everything will be deleted." : "Ishonchingiz komilmi? Hamma narsa ochadi."}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 h-11 rounded-xl bg-white dark:bg-[#1a1b24] text-sm font-semibold text-text-primary dark:text-text-primary border border-border dark:border-border/10 text-center">
                {lang === "ru" ? "Отмена" : lang === "en" ? "Cancel" : "Bekor qilish"}
              </button>
              <button onClick={() => { reset(); onClose(); }} className="flex-1 h-11 rounded-xl bg-destructive text-white text-sm font-semibold text-center">
                {lang === "ru" ? "Удалить всё" : lang === "en" ? "Delete all" : "Hammasini ochirish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
