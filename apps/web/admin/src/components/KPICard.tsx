import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'brand' | 'success' | 'warning' | 'info' | 'destructive';
}

export function KPICard({ title, value, subtitle, change, isPositive, icon: Icon, color = 'brand' }: KPICardProps) {
  const colorMap = {
    brand: 'bg-brand/10 text-brand border-brand/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    info: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    destructive: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft hover:shadow-card transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">{value}</h3>
        {change && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-[11px] text-text-muted font-medium">{subtitle}</p>}
    </div>
  );
}
