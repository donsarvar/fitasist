
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../../lib/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { LogIn, Mail, Lock, AlertCircle, Chrome } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

export function Login({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Capacitor.isNativePlatform()) {
        // skipNativeAuth: true bo'lgani uchun biz idToken olib,
        // JS Firebase SDK ga beramiz — onAuthStateChanged ishonchli ishlaydi
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result.credential?.idToken;
        if (!idToken) {
          setError("Google token olinmadi. Qayta urinib ko'ring.");
          return;
        }
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        // onAuthStateChanged avtomatik trigger bo'ladi → Gate AppShell ga o'tadi
      } else {
        // Web brauzerda popup orqali
        await signInWithPopup(auth, googleProvider);
      }
      // auth.currentUser yangilanganda store.tsx dagi onAuthStateChanged
      // setUser ni chaqiradi va Gate AppShell ko'rsatadi
    } catch (err: any) {
      console.error("Google login error:", err);
      const code: string = err?.code || "";
      const msg: string = err?.message || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // Foydalanuvchi o'zi yopdi — xato ko'rsatish shart emas
      } else if (code === "auth/popup-blocked") {
        setError("Brauzer oynani ochishni taqiqladi. Iltimos email orqali kiring.");
      } else if (code === "auth/network-request-failed") {
        setError("Internet ulanishini tekshiring va qayta urinib ko'ring.");
      } else {
        setError(`Google orqali kirishda xatolik: ${msg || code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged trigger bo'ladi → Gate AppShell ga o'tadi
    } catch (err: any) {
      console.error("Email auth error:", err);
      const code: string = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Email yoki parol noto'g'ri. Iltimos qayta tekshiring.");
      } else if (code === "auth/email-already-in-use") {
        setError("Bu email allaqachon ro'yxatdan o'tgan. Kirish tugmasini bosing.");
      } else if (code === "auth/invalid-email") {
        setError("Email formati noto'g'ri.");
      } else if (code === "auth/weak-password") {
        setError("Parol juda zaif. Kamida 6 ta belgi kiriting.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Email/parol orqali kirish yoqilmagan. Firebase Console ni tekshiring.");
      } else if (code === "auth/network-request-failed") {
        setError("Internet ulanishini tekshiring va qayta urinib ko'ring.");
      } else if (code === "auth/too-many-requests") {
        setError("Ko'p marta noto'g'ri urinish. Keyinroq qayta urinib ko'ring.");
      } else {
        setError(`Xatolik yuz berdi: ${err.message || code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-6 pt-[calc(32px+env(safe-area-inset-top))] pb-12">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Logo Icon */}
        <div className="grid h-16 w-16 place-items-center rounded-3xl gradient-primary text-white text-3xl font-black shadow-hero mb-4 select-none">
          F
        </div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">FitAsist ilovasiga xush kelibsiz</h2>
        <p className="mt-1.5 text-xs text-text-muted text-center max-w-[280px]">
          Sog'liq, mashqlar va shaxsiy AI murabbiyingiz bir joyda
        </p>

        {error && (
          <div className="mt-6 w-full flex items-center gap-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-xs font-semibold text-destructive animate-fade-in">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="mt-6 w-full space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-text-placeholder" />
            <input
              type="email"
              placeholder="Email manzilingiz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              className="w-full h-12 rounded-2xl border border-input bg-surface pl-11 pr-4 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-text-placeholder" />
            <input
              type="password"
              placeholder="Parolingiz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="w-full h-12 rounded-2xl border border-input bg-surface pl-11 pr-4 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-button flex items-center justify-center gap-2 disabled:opacity-70 active:scale-98 transition-all"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Yuklanmoqda..." : isRegister ? "Ro'yxatdan o'tish" : "Tizimga kirish"}
          </button>
        </form>

        {/* Form switcher */}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
          }}
          className="mt-4 text-xs font-bold text-brand hover:opacity-90"
        >
          {isRegister ? "Akkauntingiz bormi? Kirish" : "Yangi akkaunt ochish (Ro'yxatdan o'tish)"}
        </button>

        {/* Divider */}
        <div className="mt-6 w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-divider" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Yoki</span>
          <div className="flex-1 h-px bg-divider" />
        </div>

        {/* Google Login */}
        <div className="mt-5 w-full">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-surface border border-border shadow-soft flex items-center justify-center gap-3 text-sm font-semibold text-text-primary hover:bg-secondary-bg active:scale-98 transition-all disabled:opacity-75"
          >
            <Chrome className="h-4.5 w-4.5 text-brand" />
            Google akkaunt orqali kirish
          </button>
        </div>
      </div>
    </div>
  );
}
