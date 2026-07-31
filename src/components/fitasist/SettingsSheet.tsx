import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Shield, Globe, LogOut, Trash2 } from "lucide-react";
import { useFit } from "@/lib/fitasist/store";
import { auth } from "@/lib/firebase";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminClick?: () => void;
}

export function SettingsSheet({ open, onOpenChange, onAdminClick }: SettingsSheetProps) {
  const { state, update, user } = useFit();
  const lang = state.profile?.language || "uz";
  const isAdmin = user?.email === "salimovsarvar21@gmail.com";

  const handleLangChange = (newLang: "uz" | "ru" | "en") => {
    if (!state.profile) return;
    update({
      profile: {
        ...state.profile,
        language: newLang,
      },
    });
  };

  const handleLogout = () => {
    onOpenChange(false);
    auth.signOut().catch(console.error);
  };

  const handleResetData = () => {
    if (window.confirm("Barcha ma'lumotlaringizni o'chirishga ishonchingiz komilmi?")) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Sozlamalar
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Admin Entry Button */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
              <button
                onClick={() => {
                  onOpenChange(false);
                  if (onAdminClick) onAdminClick();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-transform"
              >
                <Shield className="h-4 w-4" />
                FitAssist
              </button>
            </div>
          )}

          {/* Language Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Til / Language / Язык
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["uz", "ru", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={`py-2.5 rounded-xl font-bold text-xs uppercase transition-all ${
                    lang === l
                      ? "bg-[#4F6BFF] text-white shadow-md shadow-[#4F6BFF]/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {l === "uz" ? "O'zbek" : l === "ru" ? "Русский" : "English"}
                </button>
              ))}
            </div>
          </div>

          {/* Logout & Reset Buttons */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Tizimdan chiqish
            </button>

            <button
              onClick={handleResetData}
              className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-rose-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Barcha kesh ma'lumotlarini tozalash
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
