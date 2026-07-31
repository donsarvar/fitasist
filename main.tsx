import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { FitProvider, useFit } from "./src/lib/fitasist/store";
import { Onboarding } from "./src/components/fitasist/Onboarding";
import { AppShell } from "./src/components/fitasist/AppShell";
import { Login } from "./src/components/fitasist/Login";
import "./src/styles.css";

function Gate() {
  const { state, user, authLoading, profileLoading } = useFit();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || authLoading) {
    return (
      <div className="min-h-dvh bg-[#F5F7FB] dark:bg-[#0B0E14] flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#4F6BFF] to-[#7B5CFF] flex items-center justify-center shadow-lg shadow-[#4F6BFF]/30">
            <span className="text-white font-extrabold text-2xl">F</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">FitAsist</span>
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4F6BFF] border-t-transparent mt-2" />
        <p className="text-xs font-semibold text-slate-400 animate-pulse">Yuklanmoqda...</p>
      </div>
    );
  }

  // If user is not authenticated, show Login screen
  if (!user) {
    return <Login onAuthSuccess={() => {}} />;
  }

  // If profile is still loading from Firestore, show loading spinner
  if (profileLoading) {
    return (
      <div className="min-h-dvh bg-[#F5F7FB] dark:bg-[#0B0E14] flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#4F6BFF] to-[#7B5CFF] flex items-center justify-center shadow-lg shadow-[#4F6BFF]/30">
            <span className="text-white font-extrabold text-2xl">F</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">FitAsist</span>
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4F6BFF] border-t-transparent mt-2" />
        <p className="text-xs font-semibold text-slate-400 animate-pulse">Profil yuklanmoqda...</p>
      </div>
    );
  }

  // If user is logged in and profile loading finished, but profile is empty, show Onboarding questions
  if (!state.profile) {
    return <Onboarding onComplete={() => {}} />;
  }

  return <AppShell />;
}

function App() {
  return (
    <React.StrictMode>
      <FitProvider>
        <Gate />
      </FitProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
