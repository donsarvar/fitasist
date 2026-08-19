import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";

// ─── IconBtn ────────────────────────────────────────────────────────────────
export function IconBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-[#12131a] shadow-soft border border-border dark:border-border/10 text-text-secondary dark:text-text-primary"
    >
      {children}
    </button>
  );
}

// ─── SectionTitle ───────────────────────────────────────────────────────────
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-end justify-between">
      <h3 className="text-sm font-semibold text-text-secondary">{children}</h3>
      {action}
    </div>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────
export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={"rounded-3xl bg-surface shadow-soft border border-border " + className}>
      {children}
    </div>
  );
}

// ─── NumField ────────────────────────────────────────────────────────────────
export function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand font-medium"
      />
    </label>
  );
}

// ─── TextField ───────────────────────────────────────────────────────────────
export function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 rounded-xl border border-input dark:border-border/10 bg-white dark:bg-[#12131a] text-text-primary dark:text-text-primary px-3 text-sm outline-none focus:border-brand font-medium"
      />
    </label>
  );
}

// ─── Sheet ───────────────────────────────────────────────────────────────────
export function Sheet({ onClose, title, subtitle, action, children }: { onClose: () => void; title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[32px] bg-background shadow-hero animate-slide-down overflow-y-auto pb-10">
        <div className="mx-auto max-w-[480px] px-6 pt-6 pb-20">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">{title}</h2>
              {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
            </div>
            {action}
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-[#1e202e] text-text-secondary dark:text-text-primary shadow-soft border border-border dark:border-border/20 ml-2 hover:opacity-80 active:scale-95 transition-all">
              <X size={18} weight="bold" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
