import React, { useState } from "react";
import { useFit } from "@/lib/fitasist/store";
import {
  Setting2 as GearSix,
  Edit2 as PencilSimple,
  Camera,
  DirectRight as Target,
  Flash as Fire,
  Activity as Heartbeat,
  Ruler,
  Weight as Scales,
  Flash as Lightning,
  InfoCircle as Question,
  CloseCircle as X,
} from "iconsax-react";
import { calcAge, calorieTargetKcal, hydrationTargetL, proteinTargetG } from "@/lib/fitasist/coach";
import { t } from "@/lib/fitasist/translations";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { BodyType, ActivityLevel, UserProfile } from "@/lib/fitasist/types";
function compressAvatarToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // fallback to original file if canvas fails
          return;
        }

        // Set avatar size to 180x180 (perfect square resolution for mobile/web avatar)
        const size = 180;
        canvas.width = size;
        canvas.height = size;

        // Draw cropped/centered image to canvas
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        // Convert canvas to Blob (JPEG with 0.8 quality, ~15-20KB size)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => {
        reject(new Error("Image load error"));
      };
    };
    reader.onerror = () => {
      reject(new Error("File read error"));
    };
  });
}

export function ProfilePage({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { state, update, user } = useFit();
  const p = state.profile;
  const lang = p?.language || "uz";

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [bmiInfoOpen, setBmiInfoOpen] = useState(false);

  // Form state for editing
  const [form, setForm] = useState<Partial<UserProfile>>({});

  const openEditModal = () => {
    setForm({
      fio: p?.fio || "",
      birthYear: p?.birthYear || 2000,
      birthDate: p?.birthDate || "",
      gender: p?.gender || "male",
      height: p?.height ?? 175,
      weight: p?.weight ?? 70,
      bodyType: p?.bodyType || "average",
      activity: p?.activity || "active",
      goal: p?.goal || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveForm = () => {
    if (!form.fio?.trim()) return;
    update({
      profile: {
        ...p!,
        fio: form.fio.trim(),
        birthYear: form.birthYear || p?.birthYear || 2000,
        birthDate: form.birthDate || p?.birthDate,
        gender: form.gender || p?.gender || "male",
        height: Number(form.height) || p?.height || 175,
        weight: Number(form.weight) || p?.weight || 70,
        bodyType: (form.bodyType as BodyType) || p?.bodyType || "average",
        activity: (form.activity as ActivityLevel) || p?.activity || "active",
        goal: form.goal?.trim() || "",
      },
    });
    setEditModalOpen(false);
  };

  // Avatar Upload Handler: compresses image and updates profile state reliably
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      // Compress to lightweight JPEG blob (~15-20KB) on the client-side
      const compressedBlob = await compressAvatarToBlob(file);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedBlob);
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        
        // Update local and Firestore profile state instantly with compressed avatar
        if (p) {
          update({ profile: { ...p, photoUrl: dataUrl } });
        }

        // Optional sync to Firebase Storage if bucket is active
        if (user) {
          try {
            const storageRef = ref(storage, `users/${user.uid}/profile_photo.jpg`);
            const snapshot = await uploadBytes(storageRef, compressedBlob);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            update({ profile: { ...p!, photoUrl: downloadUrl } });
          } catch (storageErr) {
            console.warn("Firebase Storage bucket optional sync skipped, used Data URL avatar fallback:", storageErr);
          }
        }
      };
    } catch (err) {
      console.error("Profile photo upload failed:", err);
      alert("Profil rasmini yuklashda xatolik yuz berdi. Iltimos qayta urining.");
    } finally {
      setPhotoUploading(false);
    }
  };

  // BMI Calculation
  const heightM = (p?.height || 175) / 100;
  const weightKg = p?.weight || 70;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  const getBmiStatus = (val: number) => {
    if (val < 18.5) {
      return {
        label: lang === "ru" ? "Дефицит массы" : lang === "en" ? "Underweight" : "Ozg'in (Vazn yetishmaydi)",
        color: "text-amber-500",
        bg: "bg-amber-500/10 border-amber-500/20",
        barPct: Math.min(Math.max((val / 35) * 100, 15), 100),
      };
    }
    if (val <= 24.9) {
      return {
        label: lang === "ru" ? "Нормальный вес" : lang === "en" ? "Normal weight" : "Normadagi vazn (Sog'lom)",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        barPct: Math.min(Math.max((val / 35) * 100, 15), 100),
      };
    }
    if (val <= 29.9) {
      return {
        label: lang === "ru" ? "Избыточный вес" : lang === "en" ? "Overweight" : "Ortiqcha vazn",
        color: "text-amber-500",
        bg: "bg-amber-500/10 border-amber-500/20",
        barPct: Math.min(Math.max((val / 35) * 100, 15), 100),
      };
    }
    return {
      label: lang === "ru" ? "Ожирение" : lang === "en" ? "Obese" : "Semizlik",
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
      barPct: Math.min(Math.max((val / 35) * 100, 15), 100),
    };
  };

  const bmiInfo = getBmiStatus(bmi);
  const age = p ? new Date().getFullYear() - (p.birthYear || 2000) : 25;

  const getBodyTypeLabel = (bt?: string) => {
    if (bt === "skinny") return lang === "ru" ? "Худощавое" : lang === "en" ? "Skinny" : "Ozg'in";
    if (bt === "bulk") return lang === "ru" ? "Плотное" : lang === "en" ? "Bulk" : "Semiz";
    return lang === "ru" ? "Среднее" : lang === "en" ? "Average" : "O'rtacha";
  };

  const getActivityLabel = (act?: string) => {
    if (act === "athlete") return lang === "ru" ? "Спортсмен 🏃‍♂️" : lang === "en" ? "Athlete 🏃‍♂️" : "Sportchi 🏃‍♂️";
    if (act === "active") return lang === "ru" ? "Активный 💪" : lang === "en" ? "Active 💪" : "Faol 💪";
    return lang === "ru" ? "Малоподвижный 🛋️" : lang === "en" ? "Sedentary 🛋️" : "Kam harakat 🛋️";
  };

  // Daily target goals
  const targetCal = calorieTargetKcal(p);
  const targetWater = hydrationTargetL(p);
  const targetProtein = proteinTargetG(p);

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">FitAsist Profile</span>
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            {lang === "ru" ? "Мой профиль" : lang === "en" ? "My Profile" : "Mening Profilim"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-surface border border-border shadow-soft text-text-secondary hover:text-brand transition-colors"
            title="Sozlamalar"
          >
            <GearSix size={20} variant="Bold" />
          </button>
        </div>
      </div>

      {/* 🌟 1. HERO PROFILE CARD */}
      <div className="relative overflow-hidden isolate rounded-3xl gradient-mesh text-white p-6 shadow-hero">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-md overflow-hidden grid place-items-center shadow-lg">
              {p?.photoUrl || user?.photoURL ? (
                <img src={p?.photoUrl || user?.photoURL || ""} alt={p?.fio} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black uppercase text-white">{p?.fio?.charAt(0) || "U"}</span>
              )}
            </div>

            <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white text-brand grid place-items-center shadow-md cursor-pointer hover:scale-110 transition-transform">
              <Camera size={16} variant="Bold" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white truncate">{p?.fio || "Do'stim"}</h2>
              <button
                onClick={openEditModal}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Tahrirlash"
              >
                <PencilSimple className="h-3.5 w-3.5" variant="Bold" />
              </button>
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-white/80">
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 font-medium">
                🎂 {age} yosh ({p?.birthYear || 2000})
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 font-medium">
                {p?.gender === "female" ? "Ayol 👩" : "Erkak 👨"}
              </span>
            </div>

            {p?.email && (
              <p className="mt-2 text-[11px] text-white/70 truncate">{p.email}</p>
            )}
          </div>
        </div>

        {/* Goal Progress Banner */}
        <div className="mt-5 pt-4 border-t border-white/20 relative z-10">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-white/90 truncate">
              <Target className="h-4 w-4 text-amber-300 shrink-0" variant="Bold" />
              <span className="truncate">{p?.goal ? p.goal : "Shaxsiy maqsadingiz kiritilmagan"}</span>
            </span>
            <button onClick={openEditModal} className="text-[11px] underline text-white/80 hover:text-white shrink-0 ml-2">
              Tahrirlash
            </button>
          </div>

          {/* Visual Goal Ring / Bar */}
          <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-1000 shadow-sm"
              style={{ width: `75%` }}
            />
          </div>
        </div>
      </div>

      {/* 📊 2. BMI & HEALTH STATUS WIDGET */}
      <div className="p-5 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand shrink-0">
              <Heartbeat className="h-5 w-5 text-brand" variant="Bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-primary truncate">BMI — Tana Massasi Indeksi</h3>
                <button
                  onClick={() => setBmiInfoOpen(!bmiInfoOpen)}
                  className={`h-6 w-6 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                    bmiInfoOpen
                      ? "bg-brand text-white border-brand shadow-soft"
                      : "bg-secondary-bg hover:bg-brand/10 text-text-muted hover:text-brand border-border"
                  }`}
                  title="BMI haqida ma'lumot"
                >
                  <Question className="h-3.5 w-3.5" variant="Bold" />
                </button>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">Bo'y va vazningiz mutanosibligi ko'rsatkichi</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-brand leading-none">{bmi}</div>
            <div className="text-[10px] font-bold text-text-muted mt-1">kg/m²</div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`p-3 rounded-2xl border ${bmiInfo.bg} flex items-center justify-between`}>
          <span className={`text-xs font-bold ${bmiInfo.color}`}>{bmiInfo.label}</span>
          <span className="text-[10px] text-text-muted font-medium">Sog'lom me'yor: 18.5 - 24.9</span>
        </div>

        {/* Progress gauge bar */}
        <div className="space-y-1 pt-1">
          <div className="w-full h-2 rounded-full bg-secondary-bg overflow-hidden relative border border-border">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-700"
              style={{ width: `${bmiInfo.barPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-medium text-text-muted px-0.5">
            <span>15 (Ozg'in)</span>
            <span>22 (Me'yor)</span>
            <span>35 (Semiz)</span>
          </div>
        </div>

        {/* EXPANDABLE INFO EXPLANATION PANEL */}
        {bmiInfoOpen && (
          <div className="mt-3 pt-3 border-t border-border animate-fade-in space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-text-primary">
              <span className="text-brand">
                Sodda va tushunarli qo'llanma:
              </span>
              <button onClick={() => setBmiInfoOpen(false)} className="text-[10px] text-text-muted hover:text-text-primary underline">
                Yopish
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Underweight */}
              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                <div className="font-bold text-amber-500 text-xs flex items-center justify-between">
                  <span>🟡 &lt; 18.5 — Ozg'in (Vazn yetishmaydi)</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Vazningiz bo'yingizga nisbatan kam. Mushak va sog'lom vazn yig'ish uchun ko'proq kaloriya hamda oqsil iste'mol qilish tavsiya etiladi.
                </p>
              </div>

              {/* Normal */}
              <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                <div className="font-bold text-emerald-500 text-xs flex items-center justify-between">
                  <span>🟢 18.5 – 24.9 — Normadagi vazn (Sog'lom)</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Vazningiz ideal va sog'lom me'yorda! Ushbu formani saqlash hamda muntazam mashqlarni davom ettirish kifoya.
                </p>
              </div>

              {/* Overweight */}
              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                <div className="font-bold text-amber-500 text-xs flex items-center justify-between">
                  <span>🟠 25.0 – 29.9 — Ortiqcha vazn</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Vazn biroz ortiqcha. Kardio mashg'ulotlar va engil kaloriya defitsiti orqali osongina me'yorga kelishingiz mumkin.
                </p>
              </div>

              {/* Obese */}
              <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1">
                <div className="font-bold text-rose-500 text-xs flex items-center justify-between">
                  <span>🔴 ≥ 30.0 — Semizlik</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Tana vazni yuqori. Salomatlikni tiklash va yog' foizini kamaytirish uchun muntazam mashg'ulotlar hamda parxez zarur.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📏 3. PHYSICAL METRICS GRID (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {lang === "ru" ? "Параметры тела" : lang === "en" ? "Body Parameters" : "Tana ko'rsatkichlari"}
          </h3>
          <button onClick={openEditModal} className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
            <PencilSimple className="h-3 w-3" variant="Bold" /> Tahrirlash
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Height Card */}
          <div onClick={openEditModal} className="p-4 rounded-3xl bg-surface border border-border shadow-soft hover:border-brand/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Bo'yingiz</span>
              <Ruler className="h-4 w-4 text-brand group-hover:scale-110 transition-transform" variant="Bold" />
            </div>
            <div className="text-2xl font-black text-text-primary">{p?.height ?? 175} <span className="text-xs font-normal text-text-muted">sm</span></div>
            <div className="mt-1 text-[10px] text-text-muted">Tana tuzilishi uchun</div>
          </div>

          {/* Weight Card */}
          <div onClick={openEditModal} className="p-4 rounded-3xl bg-surface border border-border shadow-soft hover:border-brand/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Vazningiz</span>
              <Scales className="h-4 w-4 text-brand group-hover:scale-110 transition-transform" variant="Bold" />
            </div>
            <div className="text-2xl font-black text-text-primary">{p?.weight ?? 70} <span className="text-xs font-normal text-text-muted">kg</span></div>
            <div className="mt-1 text-[10px] text-text-muted">Kaloriya hisobi uchun</div>
          </div>

          {/* Body Type Card */}
          <div onClick={openEditModal} className="p-4 rounded-3xl bg-surface border border-border shadow-soft hover:border-brand/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Tana Turi</span>
              <Lightning className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" variant="Bold" />
            </div>
            <div className="text-base font-bold text-text-primary truncate">{getBodyTypeLabel(p?.bodyType)}</div>
            <div className="mt-1 text-[10px] text-text-muted">Metabolizm tezligi</div>
          </div>

          {/* Activity Level Card */}
          <div onClick={openEditModal} className="p-4 rounded-3xl bg-surface border border-border shadow-soft hover:border-brand/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Faollik</span>
              <Fire className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" variant="Bold" />
            </div>
            <div className="text-base font-bold text-text-primary truncate">{getActivityLabel(p?.activity)}</div>
            <div className="mt-1 text-[10px] text-text-muted">Kunlik harakat</div>
          </div>
        </div>
      </div>

      {/* 🎯 4. DAILY TARGET NUTRITION GOALS */}
      <div className="p-5 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Target className="h-4 w-4 text-brand" variant="Bold" /> Kunlik Me'yorlar
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-secondary-bg border border-border">
            <div className="text-[10px] font-bold text-text-muted uppercase">Kaloriya</div>
            <div className="text-base font-bold text-brand mt-1">{targetCal} <span className="text-[9px] font-normal">kkal</span></div>
          </div>

          <div className="p-3 rounded-2xl bg-secondary-bg border border-border">
            <div className="text-[10px] font-bold text-text-muted uppercase">Oqsil (B)</div>
            <div className="text-base font-bold text-emerald-500 mt-1">{targetProtein}g</div>
          </div>

          <div className="p-3 rounded-2xl bg-secondary-bg border border-border">
            <div className="text-[10px] font-bold text-text-muted uppercase">Suv</div>
            <div className="text-base font-bold text-info mt-1">{targetWater}L</div>
          </div>
        </div>
      </div>

      {/* EDIT PARAMETERS MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setEditModalOpen(false)} />

          <div className="relative w-full max-w-[440px] max-h-[90dvh] bg-background border border-border rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-slide-up overflow-y-auto z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text-primary">Profil ko'rsatkichlarini tahrirlash</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1.5 rounded-full bg-secondary-bg text-text-muted hover:text-text-primary">
                <X size={18} variant="Bold" />
              </button>
            </div>

            {/* F.I.O */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Ismingiz / F.I.O</label>
              <input
                type="text"
                value={form.fio || ""}
                onChange={(e) => setForm({ ...form, fio: e.target.value })}
                className="mt-1 w-full h-11 rounded-2xl border border-input bg-surface text-text-primary px-4 text-xs font-semibold outline-none focus:border-brand"
                placeholder="Ismingizni kiriting..."
              />
            </div>

            {/* Shaxsiy Maqsad */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">🎯 Shaxsiy Maqsad / Eslatma</label>
              <textarea
                rows={2}
                value={form.goal || ""}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="Masalan: 3 oyda 5 kg ozib 75 kg bo'lish..."
                className="mt-1 w-full rounded-2xl border border-input bg-surface text-text-primary p-3 text-xs font-medium outline-none focus:border-brand resize-none"
              />
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Bo'y (sm)</label>
                <input
                  type="number"
                  value={form.height || ""}
                  onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                  className="mt-1 w-full h-11 rounded-2xl border border-input bg-surface text-text-primary px-4 text-xs font-bold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Vazn (kg)</label>
                <input
                  type="number"
                  value={form.weight || ""}
                  onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                  className="mt-1 w-full h-11 rounded-2xl border border-input bg-surface text-text-primary px-4 text-xs font-bold outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Body Type */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Tana Turi</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { k: "skinny", l: "Ozg'in" },
                  { k: "average", l: "O'rtacha" },
                  { k: "bulk", l: "Semiz" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.k}
                    onClick={() => setForm({ ...form, bodyType: item.k as BodyType })}
                    className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                      form.bodyType === item.k
                        ? "gradient-primary border-brand text-white shadow-soft"
                        : "border-border bg-secondary-bg text-text-secondary"
                    }`}
                  >
                    {item.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Faollik Darajasi</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { k: "athlete", l: "Sportchi" },
                  { k: "active", l: "Faol" },
                  { k: "sedentary", l: "Kam harakat" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.k}
                    onClick={() => setForm({ ...form, activity: item.k as ActivityLevel })}
                    className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                      form.activity === item.k
                        ? "gradient-primary border-brand text-white shadow-soft"
                        : "border-border bg-secondary-bg text-text-secondary"
                    }`}
                  >
                    {item.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 h-12 rounded-2xl border border-border bg-secondary-bg text-text-primary text-xs font-bold hover:bg-border transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="flex-1 h-12 rounded-2xl gradient-primary text-white text-xs font-bold shadow-button hover:opacity-90 active:scale-95 transition-all"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
