import type { ReactNode } from "react";
import { CloseCircle } from "iconsax-react";

// ─── IconBtn ────────────────────────────────────────────────────────────────
export function IconBtn({
  children,
  onClick,
  title,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={
        "grid h-9 w-9 place-items-center rounded-full bg-white/90 dark:bg-surface-elevated/90 backdrop-blur-md shadow-ring text-text-secondary dark:text-text-primary hover:text-brand dark:hover:text-brand active-press border border-white/60 dark:border-white/10 transition-all select-none " +
        className
      }
    >
      {children}
    </button>
  );
}

// ─── Button ─────────────────────────────────────────────────────────────────
export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const sizeCls =
    size === "sm"
      ? "h-9 px-3.5 text-xs rounded-xl gap-1.5"
      : size === "lg"
        ? "h-12 px-6 text-sm font-bold rounded-2xl gap-2.5"
        : "h-11 px-5 text-xs font-bold rounded-2xl gap-2";

  const variantCls =
    variant === "primary"
      ? "gradient-primary text-white shadow-button hover:opacity-95"
      : variant === "secondary"
        ? "bg-secondary-bg dark:bg-surface-elevated text-text-primary shadow-ring border border-border dark:border-white/10 hover:bg-border/60"
        : variant === "danger"
          ? "bg-destructive text-white shadow-button hover:opacity-90"
          : "bg-transparent text-text-muted hover:text-text-primary hover:bg-secondary-bg";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-bold tracking-tight select-none active-press transition-all disabled:opacity-50 disabled:pointer-events-none ${sizeCls} ${variantCls} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── SectionTitle ───────────────────────────────────────────────────────────
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-end justify-between">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{children}</h3>
      {action}
    </div>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────
export function Card({
  className = "",
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const base =
    "rounded-3xl bg-surface/90 dark:bg-surface/90 backdrop-blur-md shadow-ring border border-white/80 dark:border-white/[0.08] transition-all " +
    className;

  if (onClick) {
    return (
      <div onClick={onClick} className={base + " active-press cursor-pointer"}>
        {children}
      </div>
    );
  }

  return <div className={base}>{children}</div>;
}

// ─── PillBadge ──────────────────────────────────────────────────────────────
export function PillBadge({
  children,
  tint = "brand",
}: {
  children: ReactNode;
  tint?: "brand" | "success" | "warning" | "destructive" | "neutral";
}) {
  const tintCls =
    tint === "brand"
      ? "bg-brand/10 text-brand border-brand/20"
      : tint === "success"
        ? "bg-success/10 text-success border-success/20"
        : tint === "warning"
          ? "bg-warning/10 text-warning border-warning/20"
          : tint === "destructive"
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : "bg-secondary-bg text-text-muted border-border";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border tabular-nums ${tintCls}`}
    >
      {children}
    </span>
  );
}

// ─── NumField ────────────────────────────────────────────────────────────────
export function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full h-11 rounded-2xl border border-input dark:border-white/10 bg-white dark:bg-surface-elevated text-text-primary px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 font-semibold tabular-nums transition-all"
      />
    </label>
  );
}

// ─── TextField ───────────────────────────────────────────────────────────────
export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 rounded-2xl border border-input dark:border-white/10 bg-white dark:bg-surface-elevated text-text-primary px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 font-medium transition-all"
      />
    </label>
  );
}

// ─── Sheet ───────────────────────────────────────────────────────────────────
export function Sheet({
  onClose,
  title,
  subtitle,
  action,
  children,
}: {
  onClose: () => void;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[480px] max-h-[90dvh] rounded-t-[36px] bg-background/95 dark:bg-[#0c0d14]/95 backdrop-blur-xl shadow-glass border-t border-white/40 dark:border-white/10 animate-slide-down overflow-y-auto pb-10 z-10">
        <div className="px-6 pt-5 pb-20">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border dark:bg-white/20" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">{title}</h2>
              {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {action}
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-surface-elevated text-text-secondary dark:text-text-primary shadow-ring border border-white/60 dark:border-white/10 hover:opacity-80 active-press transition-all"
              >
                <CloseCircle size={18} variant="Linear" />
              </button>
            </div>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
