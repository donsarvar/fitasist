import { useEffect } from "react";
import { DropletIcon, Alert01Icon, Target02Icon, SparklesIcon, Notification01Icon, CancelCircleIcon } from "hugeicons-react";
import { useFit } from "@/lib/fitasist/store";
import type { AppNotification } from "@/lib/fitasist/types";
import { t } from "@/lib/fitasist/translations";
import { Sheet } from "../common/ui";

// ─── ToastCard ───────────────────────────────────────────────────────────────
export function ToastCard({ n, onClose }: { n: AppNotification; onClose: () => void }) {
  return (
    <div className="rounded-3xl bg-surface shadow-card border border-border p-4 flex gap-3">
      <div className={"grid h-10 w-10 place-items-center rounded-2xl " + (n.kind === "creatine" ? "bg-destructive/15 text-destructive" : "bg-info/15 text-info")}>
        {n.kind === "water" ? <DropletIcon size={20} /> : n.kind === "creatine" ? <Alert01Icon size={20} /> : <Notification01Icon size={20} />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text-primary">{n.title}</div>
        <div className="text-xs text-text-secondary">{n.body}</div>
        {n.action && <button className="mt-2 text-xs font-semibold text-brand">{n.action}</button>}
      </div>
      <button onClick={onClose} className="text-text-muted h-6 w-6 grid place-items-center"><CancelCircleIcon size={16} /></button>
    </div>
  );
}

// ─── NotifSheet ───────────────────────────────────────────────────────────────
export function NotifSheet({ onClose }: { onClose: () => void }) {
  const { state, clearNotifications, markAllRead } = useFit();
  const lang = state.profile?.language || "uz";

  useEffect(() => { markAllRead(); }, [markAllRead]);

  return (
    <Sheet
      onClose={onClose}
      title={t("notificationsTitle", lang)}
      action={<button onClick={clearNotifications} className="text-xs font-semibold text-brand">{t("clearAll", lang)}</button>}
    >
      {state.notifications.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">{t("noNotifications", lang)}</div>
      ) : (
        <div className="space-y-3">
          {state.notifications.map((n) => (
            <div key={n.id} className="rounded-2xl bg-surface border border-border p-4 shadow-soft flex gap-3">
              <div className={"grid h-10 w-10 place-items-center rounded-xl " + (n.kind === "creatine" ? "bg-destructive/10 text-destructive" : n.kind === "water" ? "bg-info/10 text-info" : n.kind === "challenge" ? "bg-warning/10 text-warning" : "bg-brand/10 text-brand")}>
                {n.kind === "water" ? <DropletIcon size={20} /> : n.kind === "creatine" ? <Alert01Icon size={20} /> : n.kind === "challenge" ? <Target02Icon size={20} /> : <SparklesIcon size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold text-text-primary">{n.title}</div>
                  <div className="text-[10px] text-text-muted">{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="text-xs text-text-secondary">{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
