import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  Droplets, 
  Ruler, 
  Trophy, 
  MessageSquare, 
  Moon, 
  Sun,
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  userEmail?: string | null;
  onLogout: () => void;
}

export function Sidebar({ darkMode, setDarkMode, userEmail, onLogout }: SidebarProps) {
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard, badge: 'Realtime' },
    { path: '/users', label: 'Foydalanuvchilar', icon: Users },
    { path: '/nutrition', label: 'Ovqatlanish', icon: Utensils },
    { path: '/hydration', label: 'Gidratatsiya', icon: Droplets },
    { path: '/measurements', label: "O'lchamlar", icon: Ruler },
    { path: '/challenges', label: 'Musobaqalar', icon: Trophy },
    { path: '/chats', label: 'AI Suhbatlar', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0 z-30 shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-xl shadow-soft">
          F
        </div>
        <div>
          <h1 className="font-extrabold text-base text-text-primary tracking-tight flex items-center gap-1.5">
            FitAssist <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand/10 text-brand font-bold">ADMIN</span>
          </h1>
          <p className="text-[11px] text-text-muted">Boshqaruv paneli v1.0</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Analitika & Menyu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-brand text-white shadow-soft font-bold'
                    : 'text-text-secondary hover:bg-secondary-bg hover:text-text-primary'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile & Dark Mode */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary-bg text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {darkMode ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-brand" />}
            <span>{darkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'}</span>
          </div>
          <span className="text-[10px] text-text-muted font-bold">{darkMode ? 'DARK' : 'LIGHT'}</span>
        </button>

        {/* User Card */}
        <div className="p-3 rounded-xl bg-secondary-bg/50 border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">Admin</p>
              <p className="text-[10px] text-text-muted truncate">{userEmail || 'admin@fitasist.uz'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Chiqish"
            className="p-1.5 text-text-muted hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
