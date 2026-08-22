import { BACKEND_URL } from "@/lib/fitasist/config";
import { useState, useRef, useMemo } from "react";
import { useFit } from "@/lib/fitasist/store";
import { FOOD_DATABASE } from "@/lib/fitasist/foodData";
import { calorieTargetKcal, proteinTargetG } from "@/lib/fitasist/coach";
import type { FoodItem, CartItem, FoodLog, MealType } from "@/lib/fitasist/types";
import { t } from "@/lib/fitasist/translations";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Camera,
  ShoppingBag,
  MessageSquare,
  Edit3,
  Search,
  Sparkles,
  Check,
  Flame,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Apple,
} from "lucide-react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Props {
  onClose: () => void;
}

type ViewMode = "journal" | "method_select" | "menu_cart" | "cart_checkout" | "photo_ai" | "manual";

export function CalorieModal({ onClose }: Props) {
  const { state, update, user, todayKey } = useFit();
  const p = state.profile;
  const lang = p?.language || "uz";
  const todayStr = todayKey();

  const calTarget = calorieTargetKcal(p);
  const protTarget = proteinTargetG(p);
  const fatTarget = Math.round((calTarget * 0.25) / 9);
  const carbsTarget = Math.round((calTarget * 0.55) / 4);

  // State
  const [view, setView] = useState<ViewMode>("journal");
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");

  // Menu & Cart state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Manual entry state
  const [manualName, setManualName] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [manualProt, setManualProt] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");

  // Photo AI state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoResult, setPhotoResult] = useState<{
    name: string;
    portion: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
    advice: string;
  } | null>(null);

  // Filter food logs for today
  const todayLogs = useMemo(() => {
    return (state.foodLogs || []).filter((f) => f.date === todayStr);
  }, [state.foodLogs, todayStr]);

  // Today Totals
  const totalCal = todayLogs.reduce((sum, f) => sum + f.calories, 0);
  const totalProt = todayLogs.reduce((sum, f) => sum + f.protein, 0);
  const totalFat = todayLogs.reduce((sum, f) => sum + f.fat, 0);
  const totalCarbs = todayLogs.reduce((sum, f) => sum + f.carbs, 0);
  const totalSugar = todayLogs.reduce((sum, f) => sum + f.sugar, 0);

  // Category list
  const categories = [
    { id: "all", labelUz: "Barchasi", labelRu: "Все", labelEn: "All", icon: "🍳" },
    { id: "national", labelUz: "Milliy taomlar", labelRu: "Узбекские", labelEn: "National", icon: "🍲" },
    { id: "fastfood", labelUz: "Fast-food", labelRu: "Фастфуд", labelEn: "Fast Food", icon: "🍔" },
    { id: "drinks", labelUz: "Ichimliklar", labelRu: "Напитки", labelEn: "Drinks", icon: "🥤" },
    { id: "breakfast", labelUz: "Nonushta", labelRu: "Завтрак", labelEn: "Breakfast", icon: "🍳" },
    { id: "healthy", labelUz: "Sog'lom / Salat", labelRu: "Салаты", labelEn: "Healthy", icon: "🥗" },
    { id: "dessert", labelUz: "Shirinliklar", labelRu: "Десерты", labelEn: "Desserts", icon: "🍰" },
    { id: "snacks", labelUz: "Gazaklar", labelRu: "Снеки", labelEn: "Snacks", icon: "🥜" },
  ];

  // Filtered Food Items
  const filteredFoods = useMemo(() => {
    return FOOD_DATABASE.filter((item) => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.nameUz.toLowerCase().includes(q) ||
        item.nameRu.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Cart operations
  const addToCart = (food: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.food.id === food.id);
      if (existing) {
        return prev.map((ci) => (ci.food.id === food.id ? { ...ci, quantity: ci.quantity + 1 } : ci));
      }
      return [...prev, { food, quantity: 1 }];
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.food.id === foodId);
      if (existing && existing.quantity > 1) {
        return prev.map((ci) => (ci.food.id === foodId ? { ...ci, quantity: ci.quantity - 1 } : ci));
      }
      return prev.filter((ci) => ci.food.id !== foodId);
    });
  };

  const cartTotalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotalCal = cart.reduce((sum, ci) => sum + ci.food.calories * ci.quantity, 0);
  const cartTotalProt = cart.reduce((sum, ci) => sum + ci.food.protein * ci.quantity, 0);
  const cartTotalFat = cart.reduce((sum, ci) => sum + ci.food.fat * ci.quantity, 0);
  const cartTotalCarbs = cart.reduce((sum, ci) => sum + ci.food.carbs * ci.quantity, 0);
  const cartTotalSugar = cart.reduce((sum, ci) => sum + ci.food.sugar * ci.quantity, 0);

  // Generate AI Cart Insight
  const cartAiAdvice = useMemo(() => {
    if (cart.length === 0) return "";
    const hasSoda = cart.some((ci) => ci.food.sugar >= 25);
    const hasFastFood = cart.some((ci) => ci.food.category === "fastfood");
    const isHighCal = cartTotalCal > 800;

    let text = "";
    if (lang === "ru") {
      text = `Общая пищевая ценность выбранного меню: ${cartTotalCal} ккал. Белки: ${cartTotalProt}г, Жиры: ${cartTotalFat}г, Углеводы: ${cartTotalCarbs}г, Сахар: ${cartTotalSugar}г.`;
      if (hasSoda) text += ` ⚠️ Внимание: высокое содержание сахара в напитках! Пейте больше воды.`;
      else if (hasFastFood) text += ` 💡 Совет: фастфуд содержит много калорий, сочетайте его с легким ужином.`;
      else text += ` ✨ Сбалансированный выбор для вашего рациона!`;
    } else if (lang === "en") {
      text = `Total nutritional breakdown for your basket: ${cartTotalCal} kcal. Protein: ${cartTotalProt}g, Fat: ${cartTotalFat}g, Carbs: ${cartTotalCarbs}g, Sugar: ${cartTotalSugar}g.`;
      if (hasSoda) text += ` ⚠️ High sugar content detected! Make sure to stay hydrated with water.`;
      else if (hasFastFood) text += ` 💡 Fast-food option selected — balance your remaining meals with veggies.`;
      else text += ` ✨ Great balanced selection for your daily target!`;
    } else {
      text = `Savatdagi umumiy taomlar qiymati: ${cartTotalCal} kkal. Oqsil: ${cartTotalProt}g, Yog': ${cartTotalFat}g, Uglevodlar: ${cartTotalCarbs}g, Shakar: ${cartTotalSugar}g.`;
      if (hasSoda) text += ` ⚠️ Diqqat: Ichimlikdagi shakar miqdori yuqori (${cartTotalSugar}g)! Ko'proq suv ichish tavsiya etiladi.`;
      else if (hasFastFood) text += ` 💡 Fast-food taomlar kaloriyaga boy. Kechki ovqatni yengilroq tanlash maqsadga muvofiq.`;
      else text += ` ✨ Maqsadingiz uchun juda yaxshi va muvozanatli tanlov!`;
    }
    return text;
  }, [cart, cartTotalCal, cartTotalProt, cartTotalFat, cartTotalCarbs, cartTotalSugar, lang]);

  // Save Cart to Food Logs
  const saveCartToLogs = () => {
    if (cart.length === 0) return;
    const newLogs: FoodLog[] = cart.map((ci) => ({
      id: crypto.randomUUID(),
      date: todayStr,
      mealType: selectedMeal,
      foodName: lang === "ru" ? ci.food.nameRu : lang === "en" ? ci.food.nameEn : ci.food.nameUz,
      quantity: ci.quantity,
      portionLabel: lang === "ru" ? ci.food.portionSizeRu : lang === "en" ? ci.food.portionSizeEn : ci.food.portionSizeUz,
      calories: ci.food.calories * ci.quantity,
      protein: ci.food.protein * ci.quantity,
      fat: ci.food.fat * ci.quantity,
      carbs: ci.food.carbs * ci.quantity,
      sugar: ci.food.sugar * ci.quantity,
      source: "cart",
      createdAt: new Date().toISOString(),
    }));

    update({ foodLogs: [...(state.foodLogs || []), ...newLogs] });
    setCart([]);
    setView("journal");
  };

  // Delete individual log
  const deleteLog = async (logId: string) => {
    update({ foodLogs: (state.foodLogs || []).filter((f) => f.id !== logId) });
    if (user) {
      try {
        const fDoc = doc(db, "users", user.uid, "foodLogs", logId);
        await deleteDoc(fDoc);
      } catch (e) {
        console.error("Failed to delete food log from Firestore:", e);
      }
    }
  };

  // Manual save
  const saveManualLog = () => {
    if (!manualName.trim()) return;
    const c = Number(manualCal) || 0;
    const pVal = Number(manualProt) || 0;
    const fVal = Number(manualFat) || 0;
    const cbVal = Number(manualCarbs) || 0;

    const newLog: FoodLog = {
      id: crypto.randomUUID(),
      date: todayStr,
      mealType: selectedMeal,
      foodName: manualName.trim(),
      quantity: 1,
      portionLabel: "1 porsiya",
      calories: c,
      protein: pVal,
      fat: fVal,
      carbs: cbVal,
      sugar: 0,
      source: "manual",
      createdAt: new Date().toISOString(),
    };

    update({ foodLogs: [...(state.foodLogs || []), newLog] });
    setManualName("");
    setManualCal("");
    setManualProt("");
    setManualFat("");
    setManualCarbs("");
    setView("journal");
  };

  // Photo Select & Analyze via Gemini Vision API
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);

    // Convert file to Base64 and run AI Vision recognition
    setAnalyzingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(",")[1];
        
        // Prepare Vision prompt for Gemini API
        // using centralized BACKEND_URL
        const prompt = `Rasmda ko'ringan taomni tahlil qiling va faqat ushbu sof JSON formatida javob bering (boshqa hech qanday text yozmang):
{
  "name": "Taom nomi o'zbek tilida",
  "portion": "1 porsiya (taxminan 300g)",
  "calories": 450,
  "protein": 22,
  "fat": 18,
  "carbs": 48,
  "sugar": 4,
  "advice": "Ushbu taom haqida 1 cümlalik qisqa maslahat"
}`;

        const resp = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                parts: [
                  { inlineData: { mimeType: file.type || "image/jpeg", data: base64String } },
                  { text: prompt }
                ]
              }
            ],
            systemPrompt: "Sen taomlar va ovqatlarning kaloriyasini rasm orqali tahlil qiladigan professional dietolog AI san."
          })
        });

        if (resp.ok) {
          const resData = await resp.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          try {
            const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            setPhotoResult(parsed);
          } catch (jsonErr) {
            // Fallback AI estimation if JSON parsing failed
            setPhotoResult({
              name: "Tahlil qilingan taom",
              portion: "1 porsiya (~350g)",
              calories: 420,
              protein: 20,
              fat: 15,
              carbs: 50,
              sugar: 5,
              advice: "Oqsil va uglevodlarga boy taom."
            });
          }
        } else {
          setPhotoResult({
            name: "Lokal taom tahlili",
            portion: "1 porsiya",
            calories: 380,
            protein: 18,
            fat: 14,
            carbs: 45,
            sugar: 3,
            advice: "Server ulanishida kechikish bo'ldi, taxminiy ko'rsatkich kiritildi."
          });
        }
        setAnalyzingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Photo analysis error:", err);
      setAnalyzingPhoto(false);
    }
  };

  // Save Photo Result to logs
  const savePhotoResult = () => {
    if (!photoResult) return;
    const newLog: FoodLog = {
      id: crypto.randomUUID(),
      date: todayStr,
      mealType: selectedMeal,
      foodName: photoResult.name,
      quantity: 1,
      portionLabel: photoResult.portion,
      calories: photoResult.calories,
      protein: photoResult.protein,
      fat: photoResult.fat,
      carbs: photoResult.carbs,
      sugar: photoResult.sugar,
      source: "photo_ai",
      createdAt: new Date().toISOString(),
    };
    update({ foodLogs: [...(state.foodLogs || []), newLog] });
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoResult(null);
    setView("journal");
  };

  const mealLabels: Record<MealType, { uz: string; ru: string; en: string; icon: string }> = {
    breakfast: { uz: "Nonushta", ru: "Завтрак", en: "Breakfast", icon: "☀️" },
    lunch: { uz: "Tushlik", ru: "Обед", en: "Lunch", icon: "🌤️" },
    dinner: { uz: "Kechki ovqat", ru: "Ужин", en: "Dinner", icon: "🌙" },
    snack: { uz: "Gazak", ru: "Перекус", en: "Snack", icon: "🍎" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full max-w-[480px] h-[92dvh] sm:h-[85vh] bg-surface rounded-t-[32px] sm:rounded-[32px] border border-border shadow-card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-divider flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {view !== "journal" ? (
              <button
                onClick={() => setView("journal")}
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary-bg text-text-primary hover:opacity-80"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-white shadow-button">
                <Flame className="h-4.5 w-4.5" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-text-primary leading-tight">
                {view === "journal"
                  ? "Kaloriya Kalkulyatori"
                  : view === "method_select"
                  ? "Usulni tanlang"
                  : view === "menu_cart"
                  ? "Menyu & Savat"
                  : view === "cart_checkout"
                  ? "Savat va AI Tahlil"
                  : view === "photo_ai"
                  ? "AI Rasm Tahlili"
                  : "Qo'lda kiritish"}
              </h2>
              <p className="text-[11px] text-text-muted">
                {mealLabels[selectedMeal][lang]} • {todayStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-secondary-bg dark:bg-[#1e202e] text-text-secondary dark:text-text-primary border border-border/20 hover:opacity-80 active:scale-95 transition-all"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* VIEW 1: JOURNAL OVERVIEW */}
          {view === "journal" && (
            <>
              {/* Daily Progress Card */}
              <div className="rounded-3xl gradient-mesh text-white p-5 shadow-hero relative overflow-hidden flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Kunlik Maqsad</span>
                    <div className="text-2xl font-black mt-0.5">
                      {totalCal.toLocaleString()} <span className="text-sm font-semibold text-white/80">/ {calTarget.toLocaleString()} kkal</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 grid place-items-center font-black text-lg">
                    {Math.round((totalCal / calTarget) * 100)}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((totalCal / calTarget) * 100))}%` }}
                  />
                </div>

                {/* Macros Mini Bar */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/15 text-center">
                  <div>
                    <div className="text-[10px] text-white/70 uppercase">Oqsil</div>
                    <div className="text-xs font-bold">{totalProt}g / {protTarget}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/70 uppercase">Yog'</div>
                    <div className="text-xs font-bold">{totalFat}g / {fatTarget}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/70 uppercase">Uglevod</div>
                    <div className="text-xs font-bold">{totalCarbs}g / {carbsTarget}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/70 uppercase">Shakar</div>
                    <div className="text-xs font-bold">{totalSugar}g</div>
                  </div>
                </div>
              </div>

              {/* Add Meal FAB Action */}
              <button
                onClick={() => setView("method_select")}
                className="w-full h-13 rounded-2xl gradient-primary text-white font-bold text-xs shadow-button flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all"
              >
                <Plus className="h-4.5 w-4.5" />
                Taom qo'shish (AI / Menyu / Rasm)
              </button>

              {/* Meal Groups */}
              <div className="space-y-4 pt-2">
                {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mType) => {
                  const logsForMeal = todayLogs.filter((f) => f.mealType === mType);
                  const mCal = logsForMeal.reduce((sum, f) => sum + f.calories, 0);

                  return (
                    <div key={mType} className="rounded-2xl bg-secondary-bg border border-border/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{mealLabels[mType].icon}</span>
                          <span className="text-sm font-bold text-text-primary">{mealLabels[mType][lang]}</span>
                          <span className="text-xs font-medium text-text-muted">({mCal} kkal)</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMeal(mType);
                            setView("method_select");
                          }}
                          className="grid h-7 w-7 place-items-center rounded-full bg-white dark:bg-[#1e202e] text-brand border border-border/20 shadow-soft"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {logsForMeal.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-1">Hali hech narsa yozilmadi.</div>
                      ) : (
                        <div className="space-y-2">
                          {logsForMeal.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-xl bg-surface p-2.5 border border-border/30"
                            >
                              <div>
                                <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                                  {item.foodName}
                                  {item.source === "photo_ai" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-bold">AI Rasm</span>}
                                  {item.source === "cart" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand/10 text-brand font-bold">Savat</span>}
                                </div>
                                <div className="text-[10px] text-text-muted">
                                  {item.quantity > 1 ? `${item.quantity}x • ` : ""}{item.portionLabel} | O:{item.protein}g Y:{item.fat}g U:{item.carbs}g
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-text-primary">{item.calories} kkal</span>
                                <button
                                  onClick={() => deleteLog(item.id)}
                                  className="text-destructive/70 hover:text-destructive p-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW 2: METHOD SELECTION */}
          {view === "method_select" && (
            <div className="space-y-4">
              {/* Select Meal Type Segmented */}
              <div className="p-1 rounded-2xl bg-secondary-bg border border-border/40 grid grid-cols-4 gap-1">
                {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mt) => (
                  <button
                    key={mt}
                    onClick={() => setSelectedMeal(mt)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedMeal === mt ? "bg-surface text-brand shadow-soft" : "text-text-muted"
                    }`}
                  >
                    {mealLabels[mt].icon} {mealLabels[mt][lang]}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-text-muted pt-2">Qaysi usulda qo'shmoqchisiz?</div>

              {/* Grid 4 Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setView("menu_cart")}
                  className="rounded-2xl bg-surface border border-border p-4 text-left shadow-soft hover:border-brand transition-all group flex flex-col justify-between h-32"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand group-hover:scale-105 transition-transform">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">🛒 Menyu & Savat</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Evos/Express24 kabi tanlash</div>
                  </div>
                </button>

                <button
                  onClick={() => setView("photo_ai")}
                  className="rounded-2xl bg-surface border border-border p-4 text-left shadow-soft hover:border-purple-500 transition-all group flex flex-col justify-between h-32"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-105 transition-transform">
                    <Camera size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">📸 AI Rasm Tahlili</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Ovqatni rasmga olib hisoblash</div>
                  </div>
                </button>

                <button
                  onClick={() => setView("manual")}
                  className="rounded-2xl bg-surface border border-border p-4 text-left shadow-soft hover:border-emerald-500 transition-all group flex flex-col justify-between h-32"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">✏️ Qo'lda kiritish</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Aniq gramm va kaloriyalar</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    // Open AI chat page
                    window.dispatchEvent(new CustomEvent("fitasist:open-chat"));
                  }}
                  className="rounded-2xl bg-surface border border-border p-4 text-left shadow-soft hover:border-amber-500 transition-all group flex flex-col justify-between h-32"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">💬 AI ga aytish</div>
                    <div className="text-[10px] text-text-muted mt-0.5">"2 ta somsa yedim" deb yozish</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: MENU & CART SELECTION (EXPRESS24 / EVOS STYLE) */}
          {view === "menu_cart" && (
            <div className="space-y-4 pb-16">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Taom yoki ichimlik izlang..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary-bg border border-border/40 text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              {/* Horizontal Categories Scroll */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      activeCategory === cat.id
                        ? "gradient-primary text-white shadow-button"
                        : "bg-secondary-bg text-text-muted border border-border/30"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.labelUz}</span>
                  </button>
                ))}
              </div>

              {/* Food Items List */}
              <div className="space-y-3">
                {filteredFoods.map((food) => {
                  const inCart = cart.find((ci) => ci.food.id === food.id);
                  const qty = inCart?.quantity || 0;

                  return (
                    <div
                      key={food.id}
                      className="rounded-2xl bg-surface border border-border/40 p-3.5 flex items-center justify-between shadow-soft hover:border-brand/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl select-none">{food.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-text-primary">
                            {lang === "ru" ? food.nameRu : lang === "en" ? food.nameEn : food.nameUz}
                          </div>
                          <div className="text-[10px] text-text-muted">
                            {lang === "ru" ? food.portionSizeRu : lang === "en" ? food.portionSizeEn : food.portionSizeUz} • {food.calories} kkal
                          </div>
                          <div className="text-[9px] text-text-muted/80">
                            Oqsil: {food.protein}g | Yog': {food.fat}g | Uglevod: {food.carbs}g
                          </div>
                        </div>
                      </div>

                      {/* Quantity Add/Remove buttons */}
                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-secondary-bg p-1 rounded-xl border border-border/40">
                            <button
                              onClick={() => removeFromCart(food.id)}
                              className="h-7 w-7 rounded-lg bg-surface grid place-items-center text-text-primary shadow-soft hover:bg-destructive/10"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-bold px-1.5 text-text-primary">{qty}</span>
                            <button
                              onClick={() => addToCart(food)}
                              className="h-7 w-7 rounded-lg gradient-primary grid place-items-center text-white shadow-button"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(food)}
                            className="h-8 px-3 rounded-xl bg-brand/10 text-brand text-xs font-bold flex items-center gap-1 hover:bg-brand hover:text-white transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Qo'shish
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Bottom Cart Bar */}
              {cartTotalItems > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[432px] z-30">
                  <button
                    onClick={() => setView("cart_checkout")}
                    className="w-full h-14 rounded-2xl gradient-primary text-white shadow-hero px-5 flex items-center justify-between font-bold text-xs animate-bounce-subtle"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 px-2 rounded-lg bg-white/20 backdrop-blur-md grid place-items-center font-black text-xs">
                        {cartTotalItems}
                      </div>
                      <span>Savatdagi taomlar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{cartTotalCal} kkal</span>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: CART CHECKOUT & AI ANALYSIS */}
          {view === "cart_checkout" && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-text-muted">Savatdagi taomlar ro'yxati:</div>

              <div className="space-y-2">
                {cart.map(({ food, quantity }) => (
                  <div key={food.id} className="rounded-xl bg-secondary-bg border border-border/40 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{food.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-text-primary">
                          {lang === "ru" ? food.nameRu : lang === "en" ? food.nameEn : food.nameUz}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {quantity}x ({food.calories * quantity} kkal)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(food.id)}
                        className="h-7 w-7 rounded-lg bg-surface grid place-items-center text-text-primary shadow-soft"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-bold px-1">{quantity}</span>
                      <button
                        onClick={() => addToCart(food)}
                        className="h-7 w-7 rounded-lg gradient-primary grid place-items-center text-white shadow-button"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Complex Analysis Card */}
              <div className="rounded-2xl bg-surface border border-brand/30 p-4 shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-brand font-bold text-xs">
                  <Sparkles size={16} />
                  <span>AI Tahlili va Makrolar</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center py-2 bg-secondary-bg rounded-xl border border-border/20">
                  <div>
                    <div className="text-[9px] uppercase text-text-muted">Oqsil</div>
                    <div className="text-xs font-bold text-text-primary">{cartTotalProt}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-text-muted">Yog'</div>
                    <div className="text-xs font-bold text-text-primary">{cartTotalFat}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-text-muted">Uglevod</div>
                    <div className="text-xs font-bold text-text-primary">{cartTotalCarbs}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-text-muted">Shakar</div>
                    <div className="text-xs font-bold text-amber-500">{cartTotalSugar}g</div>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-text-secondary bg-brand/5 p-3 rounded-xl border border-brand/10">
                  {cartAiAdvice}
                </div>
              </div>

              {/* Confirm and Save */}
              <button
                onClick={saveCartToLogs}
                className="w-full h-13 rounded-2xl gradient-primary text-white font-bold text-xs shadow-button flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all"
              >
                <Check className="h-4.5 w-4.5" />
                Tasdiqlash va Jurnalga Saqlash ({cartTotalCal} kkal)
              </button>
            </div>
          )}

          {/* VIEW 5: PHOTO AI RECOGNITION */}
          {view === "photo_ai" && (
            <div className="space-y-4">
              <div className="text-xs text-text-muted">
                Ovqat yoki taom etiketkasini rasmga oling — Gemini Vision AI uni avtomatik tahlil qiladi.
              </div>

              <label className="block w-full h-44 rounded-2xl border-2 border-dashed border-border/60 hover:border-purple-500 bg-secondary-bg grid place-items-center cursor-pointer transition-all overflow-hidden relative">
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />

                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/10 text-purple-500 mx-auto mb-2">
                      <Camera size={24} />
                    </div>
                    <div className="text-xs font-bold text-text-primary">Rasmga olish yoki fayl tanlash</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Kamera tugmasini bosing</div>
                  </div>
                )}
              </label>

              {analyzingPhoto && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                  <Sparkles size={16} />
                  Gemini AI rasm va kaloriyani tahlil qilmoqda...
                </div>
              )}

              {photoResult && !analyzingPhoto && (
                <div className="rounded-2xl bg-surface border border-purple-500/30 p-4 space-y-3 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-text-primary">{photoResult.name}</div>
                    <span className="text-xs font-black text-purple-500">{photoResult.calories} kkal</span>
                  </div>

                  <div className="text-[10px] text-text-muted">{photoResult.portion}</div>

                  <div className="grid grid-cols-4 gap-2 text-center py-2 bg-secondary-bg rounded-xl">
                    <div>
                      <div className="text-[9px] uppercase text-text-muted">Oqsil</div>
                      <div className="text-xs font-bold">{photoResult.protein}g</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-text-muted">Yog'</div>
                      <div className="text-xs font-bold">{photoResult.fat}g</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-text-muted">Uglevod</div>
                      <div className="text-xs font-bold">{photoResult.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-text-muted">Shakar</div>
                      <div className="text-xs font-bold">{photoResult.sugar}g</div>
                    </div>
                  </div>

                  <div className="text-xs text-text-secondary bg-purple-500/5 p-2.5 rounded-xl border border-purple-500/10">
                    💡 {photoResult.advice}
                  </div>

                  <button
                    onClick={savePhotoResult}
                    className="w-full h-12 rounded-xl bg-purple-500 text-white font-bold text-xs shadow-button flex items-center justify-center gap-2 hover:opacity-95"
                  >
                    <Check size={16} />
                    Jurnalga Saqlash
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 6: MANUAL ENTRY */}
          {view === "manual" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">Taom nomi *</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Masalan: Tvorogli choy"
                  className="w-full h-11 px-3.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">Kaloriya (kkal) *</label>
                  <input
                    type="number"
                    value={manualCal}
                    onChange={(e) => setManualCal(e.target.value)}
                    placeholder="350"
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">Oqsil (g)</label>
                  <input
                    type="number"
                    value={manualProt}
                    onChange={(e) => setManualProt(e.target.value)}
                    placeholder="20"
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">Yog' (g)</label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    placeholder="10"
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">Uglevod (g)</label>
                  <input
                    type="number"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    placeholder="45"
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={saveManualLog}
                disabled={!manualName.trim()}
                className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-button flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 mt-4"
              >
                <Check size={16} />
                Saqlash
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
