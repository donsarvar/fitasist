import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, googleProvider } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { isAdminUser } from './lib/adminAuth';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { UsersPage } from './pages/Users';
import { NutritionPage } from './pages/Nutrition';
import { HydrationPage } from './pages/Hydration';
import { MeasurementsPage } from './pages/Measurements';
import { ChallengesPage } from './pages/Challenges';
import { ChatLogsPage } from './pages/ChatLogs';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('admin_theme') === 'dark';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin_theme', 'light');
    }
  }, [darkMode]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google auth error:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-text-muted">Tizim yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  // Auth Guard Screen
  if (!user || !isAdminUser(user.uid, user.email)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background p-4 animate-fade-in">
        <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-card text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-2xl shadow-soft">
            F
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">FitAssist Admin Panel</h1>
            <p className="text-xs text-text-muted mt-1">Ushbu tizim faqat ruxsati bor adminlar uchun</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-extrabold text-sm shadow-soft hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Google Orqali Kirish
          </button>

          {user && !isAdminUser(user.uid, user.email) && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2 text-left">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>Sizning hisobingiz admin huquqlariga ega emas ({user.email})</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-text-primary antialiased">
      {/* Sidebar Navigation */}
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} userEmail={user.email} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/hydration" element={<HydrationPage />} />
          <Route path="/measurements" element={<MeasurementsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/chats" element={<ChatLogsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
