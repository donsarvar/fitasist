
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../../lib/firebase";
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithCredential,
  getRedirectResult,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { LogIn, Mail, Lock, AlertCircle, Chrome, Smartphone } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

declare global {
  interface Window {
    handleNativeGoogleSignIn?: (data: { idToken: string }) => Promise<void>;
    handleNativeGoogleSignInError?: (errorMsg: string) => void;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function Login({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Catch returning from redirect auth
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          onAuthSuccess();
        }
      } catch (err: any) {
        console.error("Redirect auth error:", err);
        setError(`Google orqali qaytishda xatolik: ${err.message || err.code}`);
      }
    };
    checkRedirect();
  }, [onAuthSuccess]);

  useEffect(() => {
    window.handleNativeGoogleSignIn = async ({ idToken }) => {
      setLoading(true);
      setError(null);
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        onAuthSuccess();
      } catch (err: any) {
        console.error("Native Firebase sign-in failed:", err);
        setError(`Google orqali kirishda xatolik: ${err.message || err.code}`);
        setLoading(false);
      }
    };

    window.handleNativeGoogleSignInError = (errorMsg: string) => {
      console.error("Native Google Sign-In failed:", errorMsg);
      // Suppress showing error if it's just user canceling the flow
      if (!errorMsg.includes("12501") && !errorMsg.toLowerCase().includes("cancel")) {
        setError(`Google orqali kirishda xatolik: ${errorMsg}`);
      }
      setLoading(false);
    };

    return () => {
      delete window.handleNativeGoogleSignIn;
      delete window.handleNativeGoogleSignInError;
    };
  }, [onAuthSuccess]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        if (result.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          await signInWithCredential(auth, credential);
          onAuthSuccess();
        } else {
          throw new Error("Google hisobidan kirish kaliti (idToken) qaytmadi.");
        }
      } else {
        const isWebView = window.navigator.userAgent.includes("FitAsistApp");
        if (isWebView && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GOOGLE_SIGN_IN' }));
          // Keep loading=true until native sign-in callback returns
        } else if (isWebView) {
          await signInWithRedirect(auth, googleProvider);
        } else {
          await signInWithPopup(auth, googleProvider);
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      // Fallback for some restricted browsers
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        setError("Brauzer oynani ochishni taqiqladi. Iltimos pochta orqali kiring.");
      } else {
        setError(`Google orqali kirishda xatolik yuz berdi: ${err.message || err.code}`);
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
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error("Email auth error:", err);
      
      // Helper to check for Google Provider
      const checkGoogleProvider = async (emailAddr: string) => {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, emailAddr);
          return methods.includes("google.com");
        } catch (e) {
          return false;
        }
      };

      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        const isGoogle = await checkGoogleProvider(email);
        if (isGoogle) {
          setError("Ushbu hisob Google orqali yaratilgan. Iltimos, pastdagi Google tugmasini bosib tizimga kiring.");
        } else {
          setError("Email yoki parol noto'g'ri. Agar avval Google orqali kirgan bo'lsangiz, pastdagi Google tugmasidan foydalaning.");
        }
      } else if (err.code === "auth/email-already-in-use") {
        const isGoogle = await checkGoogleProvider(email);
        if (isGoogle) {
          setError("Ushbu email allaqachon band va Google orqali ochilgan. Iltimos, pastdagi Google tugmasini bosib tizimga kiring.");
        } else {
          setError("Bu email allaqachon ro'yxatdan o'tgan. Iltimos, boshqa email kiriting yoki tizimga kiring.");
        }
      } else if (err.code === "auth/invalid-email") {
        setError("Email formati noto'g'ri.");
      } else if (err.code === "auth/weak-password") {
        setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email va parol orqali kirish Firebase'da yoqilmagan. Iltimos, Firebase Console'dan 'Email/Password' usulini yoqing.");
      } else {
        setError(`Avtorizatsiyada xatolik yuz berdi: ${err.message || err.code}`);
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

        {/* Social Logins */}
        <div className="mt-5 w-full flex flex-col gap-2.5">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-surface border border-border shadow-soft flex items-center justify-center gap-3 text-sm font-semibold text-text-primary hover:bg-secondary-bg active:scale-98 transition-all disabled:opacity-75"
          >
            <Chrome className="h-4.5 w-4.5 text-brand" />
            Google akkaunt orqali kirish
          </button>

          {/* Scalable Placeholder for Future SMS Auth Button */}
          {/* 
            Ertaga SMS tizimini ulamoqchi bo'lganingizda, faqatgina ushbu izohni olib tashlab,
            onClick hodisasini telefon orqali kirish funksiyasiga bog'lashingiz kifoya.
            Dizayn Flexbox yordamida yozilganligi uchun hech narsa buzilmaydi.
          */}
          {/*
          <button
            onClick={() => {
              // Kelajakda SMS tizimi funksiyasi shu yerga ulanadi
              alert("Telefon raqam orqali kirish tizimi tez kunda ishga tushadi!");
            }}
            className="w-full h-12 rounded-2xl bg-surface border border-border shadow-soft flex items-center justify-center gap-3 text-sm font-semibold text-text-primary hover:bg-secondary-bg active:scale-98 transition-all"
          >
            <Smartphone className="h-4.5 w-4.5 text-success" />
            Telefon raqami (SMS) orqali kirish
          </button>
          */}
        </div>
      </div>
    </div>
  );
}
