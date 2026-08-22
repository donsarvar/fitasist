import React, { useState } from "react";
import {
  FireIcon,
  Dumbbell01Icon,
  DropletIcon,
  RunningShoesIcon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  LockKeyIcon,
} from "hugeicons-react";
import { Sheet } from "../../common/ui";

interface Achievement {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  unlocked: boolean;
  progress: string;
  bgGrad: string;
  iconColor: string;
}

interface AchievementsSectionProps {
  streak: number;
  completedGoalsCount: number;
  hydrationDays: number;
}

export const AchievementsSection = React.memo(function AchievementsSection({
  streak,
  completedGoalsCount,
  hydrationDays,
}: AchievementsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const achievements: Achievement[] = [
    {
      id: "streak_7",
      icon: <FireIcon size={24} />,
      title: "7 DAY STREAK",
      desc: "Ketma-ket 7 kun barcha maqsadlarni bajardingiz",
      unlocked: streak >= 7,
      progress: `${Math.min(7, streak)} / 7 kun`,
      bgGrad: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-500",
    },
    {
      id: "workouts_10",
      icon: <Dumbbell01Icon size={24} />,
      title: "10 WORKOUTS",
      desc: "10 ta mashg'ulot yoki fitnes maqsadini yakunladingiz",
      unlocked: completedGoalsCount >= 1 || streak >= 10,
      progress: `${Math.min(10, streak)} / 10 ta`,
      bgGrad: "from-brand/20 to-brand-indigo/10",
      iconColor: "text-brand",
    },
    {
      id: "hydration_master",
      icon: <DropletIcon size={24} />,
      title: "HYDRATION MASTER",
      desc: "Kunlik suv me'yorini to'liq bajardingiz",
      unlocked: hydrationDays >= 5 || streak >= 3,
      progress: `${Math.min(5, hydrationDays || 1)} / 5 kun`,
      bgGrad: "from-sky-500/20 to-blue-500/10",
      iconColor: "text-sky-500",
    },
    {
      id: "first_5k",
      icon: <RunningShoesIcon size={24} />,
      title: "FIRST 5K",
      desc: "Marafon yoki yugurish maqsadida 5 km masofani zabt etdingiz",
      unlocked: completedGoalsCount >= 1,
      progress: completedGoalsCount >= 1 ? "Bajarildi" : "0 / 5 km",
      bgGrad: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-muted">
          Yutuqlaringiz
        </span>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-xs font-bold text-brand hover:opacity-80 flex items-center gap-0.5 active-press"
        >
          <span>Barchasini ko'rish</span>
          <ArrowRight01Icon size={14} />
        </button>
      </div>

      {/* Badges Grid (4 items horizontal/grid) */}
      <div className="grid grid-cols-4 gap-2.5">
        {achievements.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setModalOpen(true)}
            className={
              "flex flex-col items-center justify-between p-3 rounded-2xl glass-card border border-white/70 dark:border-white/10 shadow-soft transition-all active-press min-h-[110px] " +
              (item.unlocked ? "opacity-100" : "opacity-75")
            }
          >
            {/* Glowing Icon Circle */}
            <div
              className={`relative h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br ${item.bgGrad} ${item.iconColor} shadow-inner border border-white/40 dark:border-white/10`}
            >
              {item.icon}
              {item.unlocked && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                  ✓
                </div>
              )}
            </div>

            {/* Badge Title */}
            <span className="mt-2 text-[9px] font-black text-center text-text-primary uppercase tracking-tight leading-tight line-clamp-2">
              {item.title}
            </span>
          </button>
        ))}
      </div>

      {/* All Achievements Modal */}
      {modalOpen && (
        <Sheet
          onClose={() => setModalOpen(false)}
          title="Yutuqlar va Medallar"
          subtitle="FitAsist faolligingiz uchun nishonlar"
        >
          <div className="space-y-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={
                  "p-4 rounded-2xl border flex items-center gap-3.5 transition-all " +
                  (a.unlocked
                    ? "bg-surface border-brand/30 shadow-soft"
                    : "bg-secondary-bg/50 border-border/60 opacity-80")
                }
              >
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${a.bgGrad} ${a.iconColor} shrink-0 shadow-inner`}
                >
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-text-primary uppercase tracking-tight">
                      {a.title}
                    </h4>
                    {a.unlocked ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                        Ochilgan
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-secondary-bg text-text-muted text-[9px] font-semibold flex items-center gap-0.5">
                        <LockKeyIcon size={10} /> Qulflangan
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{a.desc}</p>
                  <div className="mt-1.5 text-[10px] font-bold text-brand">
                    Taraqqiyot: {a.progress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
});
