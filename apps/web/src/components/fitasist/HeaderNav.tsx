import React from "react";
import { Moon, Sun, Bell, Settings } from "lucide-react";
import { useFit } from "@/lib/fitasist/store";

interface HeaderNavProps {
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
}

export function HeaderNav({ onOpenSettings, onOpenNotifications }: HeaderNavProps) {
  const { state, update } = useFit();
  const isDark = state.theme === "dark";

  const toggleTheme = () => {
    update({ theme: isDark ? "light" : "dark" });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#4F6BFF] to-[#7B5CFF] flex items-center justify-center shadow-md shadow-[#4F6BFF]/20">
            <span className="text-white font-black text-xl">F</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              FitAsist
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Smart Fitness Coach
            </p>
          </div>
        </div>

        {/* Global Controls: Theme Toggle & Settings Sheet Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all active:scale-95"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </button>

          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              aria-label="Notifications"
              className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all active:scale-95 relative"
            >
              <Bell className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
