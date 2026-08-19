import { memo } from "react";
import { ChatCircleText } from "@phosphor-icons/react";
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
    <div className="mt-5 relative overflow-hidden isolate rounded-3xl gradient-mesh text-white shadow-hero p-5 flex flex-col gap-4">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/70 via-white/30 to-white/10 backdrop-blur-md border border-white/50 animate-ai-pulse" />
          <div className="absolute inset-5 rounded-full bg-white/80 blur-md" />
          <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ai-ring" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{t("coachAdviceHeader", p?.language)}</div>
          <div className="mt-1 rounded-2xl rounded-tl-md bg-white/15 backdrop-blur-md border border-white/20 p-3 text-[13px] leading-relaxed font-medium">
            {dailyAdvice(p)}
          </div>
        </div>
      </div>

      <button
        onClick={onOpenChat}
        className="relative mt-1 w-full h-12 rounded-2xl bg-white text-brand text-xs font-bold shadow-button flex items-center justify-center gap-2 hover:bg-white/90 active:scale-98 transition-all"
      >
        <ChatCircleText size={16} weight="fill" className="text-brand" />
        {t("talkToCoach", p?.language)}
      </button>
    </div>
  );
});
