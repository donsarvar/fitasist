import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FitProvider, useFit } from "@/lib/fitasist/store";
import { Onboarding } from "@/components/fitasist/Onboarding";
import { AppShell } from "@/components/fitasist/AppShell";

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
  const { state } = useFit();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) {
    return <div className="min-h-dvh bg-background" />;
  }
  if (!state.profile) {
    return <Onboarding onComplete={() => { /* profile now set */ }} />;
  }
  return <AppShell />;
}
