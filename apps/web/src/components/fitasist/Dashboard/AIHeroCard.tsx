import { memo } from "react";
import { MessageText as ChatCircleText, MagicStar as Sparkle } from "iconsax-react";
import { useFit } from "@/lib/fitasist/store";
import { dailyAdvice } from "@/lib/fitasist/coach";
import { t } from "@/lib/fitasist/translations";

interface Props {
  onOpenChat: () => void;
}

export const AIHeroCard = memo(function AIHeroCard({ onOpenChat }: Props) {
  const { state } = useFit();
  const p = state.profile;

  return (
    <div className="mt-5 relative overflow-hidden isolate rounded-[28px] gradient-mesh text-white shadow-hero p-5 flex flex-col gap-4 border border-white/25">
      {/* Ambient background glows */}
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-300/20 blur-2xl pointer-events-none" />

      <div className="relative flex items-start gap-3.5">
        {/* Apple Intelligence Glowing Orb */}
        <div className="relative h-16 w-16 shrink-0 mt-0.5">
          <div className="absolute inset-0 rounded-full bg-white/25 blur-xl" />
          <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-white/80 via-white/40 to-white/10 backdrop-blur-md border border-white/60 animate-ai-pulse shadow-glow" />
          <div className="absolute inset-3.5 rounded-full bg-white/90 blur-sm" />
          <div className="absolute inset-0 rounded-full border border-white/40 animate-ai-ring" />
          <div className="absolute inset-0 grid place-items-center text-white/90">
            <Sparkle size={18} variant="Bold" />
          </div>
        </div>

        {/* Coach Advice Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
            <span>{t("coachAdviceHeader", p?.language)}</span>
          </div>
          <div className="mt-1 rounded-2xl rounded-tl-sm bg-white/15 backdrop-blur-md border border-white/20 p-3 text-[13px] leading-relaxed font-medium text-white/95 shadow-soft">
            {dailyAdvice(p)}
          </div>
        </div>
      </div>

      <button
        onClick={onOpenChat}
        className="relative w-full h-11 rounded-2xl bg-white text-brand text-xs font-bold shadow-button flex items-center justify-center gap-2 hover:bg-white/95 active-press transition-all select-none"
      >
        <ChatCircleText size={16} variant="Bold" className="text-brand" />
        <span>{t("talkToCoach", p?.language)}</span>
      </button>
    </div>
  );
});

