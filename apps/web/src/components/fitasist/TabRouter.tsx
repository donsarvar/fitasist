import React, { Suspense, lazy } from "react";

const ProfilePage = lazy(() => import("./ProfilePage").then((m) => ({ default: m.ProfilePage })));
const ChatPage = lazy(() => import("./ChatPage").then((m) => ({ default: m.ChatPage })));
const AdminDashboard = lazy(() => import("./AdminDashboard").then((m) => ({ default: m.AdminDashboard })));

interface TabRouterProps {
  activeTab: string;
  onOpenSettings?: () => void;
  onCloseAdmin?: () => void;
}

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4F6BFF] border-t-transparent" />
      <p className="text-xs font-semibold text-slate-400 animate-pulse">Yuklanmoqda...</p>
    </div>
  );
}

export function TabRouter({ activeTab, onOpenSettings, onCloseAdmin }: TabRouterProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {activeTab === "profile" && <ProfilePage onOpenSettings={onOpenSettings} />}
      {activeTab === "chat" && <ChatPage />}
      {activeTab === "admin" && <AdminDashboard onClose={onCloseAdmin || (() => {})} />}
    </Suspense>
  );
}
