import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FitProvider, useFit } from "@/lib/fitasist/store";
import { Onboarding } from "@/components/fitasist/Onboarding";
import { AppShell } from "@/components/fitasist/AppShell";
import { Login } from "@/components/fitasist/Login";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <FitProvider>
      <Gate />
    </FitProvider>
  );
}

function Gate() {
  const { state, user, authLoading, profileLoading } = useFit();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || authLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Login onAuthSuccess={() => {}} />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!state.profile) {
    return <Onboarding onComplete={() => { /* profile now set */ }} />;
  }

  return <AppShell />;
}
