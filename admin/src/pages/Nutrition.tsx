import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { KPICard } from '../components/KPICard';
import { SimpleBarChart, SimpleDonutChart } from '../components/Charts';
import { Utensils, Flame, PieChart, ShieldCheck } from 'lucide-react';

export function NutritionPage() {
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState({
    totalLogs: 0,
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0,
    topFoods: [] as { name: string; count: number }[],
    sourceDistribution: [] as { name: string; value: number }[],
    mealTypeDistribution: [] as { name: string; value: number }[],
  });

  useEffect(() => {
    async function fetchNutritionData() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalLogs = 0;
        let sumCal = 0;
        let sumProt = 0;
        let sumCarb = 0;
        let sumFat = 0;

        const foodCounts: Record<string, number> = {};
        const sources: Record<string, number> = { search: 0, photo_ai: 0, manual: 0, cart: 0 };
        const mealTypes: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };

        for (const userDoc of usersSnap.docs) {
          const foodSnap = await getDocs(collection(db, 'users', userDoc.id, 'foodLogs'));
          foodSnap.forEach((doc) => {
            const data = doc.data();
            totalLogs++;
            sumCal += data.calories || 0;
            sumProt += data.protein || 0;
            sumCarb += data.carbs || 0;
            sumFat += data.fat || 0;

            if (data.foodName) {
              foodCounts[data.foodName] = (foodCounts[data.foodName] || 0) + 1;
            }
            if (data.source) {
              sources[data.source] = (sources[data.source] || 0) + 1;
            }
            if (data.mealType) {
              mealTypes[data.mealType] = (mealTypes[data.mealType] || 0) + 1;
            }
          });
        }

        const topFoodsList = Object.entries(foodCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        setNutritionData({
          totalLogs,
          avgCalories: totalLogs > 0 ? Math.round(sumCal / totalLogs) : 0,
          avgProtein: totalLogs > 0 ? Math.round(sumProt / totalLogs) : 0,
          avgCarbs: totalLogs > 0 ? Math.round(sumCarb / totalLogs) : 0,
          avgFat: totalLogs > 0 ? Math.round(sumFat / totalLogs) : 0,
          topFoods: topFoodsList,
          sourceDistribution: [
            { name: '🛒 Menyu/Savat', value: sources.cart || 1 },
            { name: '🔍 Qidiruv', value: sources.search || 1 },
            { name: '📸 AI Rasm', value: sources.photo_ai || 1 },
            { name: '✏️ Qo\'lda', value: sources.manual || 1 },
          ],
          mealTypeDistribution: [
            { name: 'Nonushta', value: mealTypes.breakfast || 1 },
            { name: 'Tushlik', value: mealTypes.lunch || 1 },
            { name: 'Kechki ovqat', value: mealTypes.dinner || 1 },
            { name: 'Perekus', value: mealTypes.snack || 1 },
          ],
        });
      } catch (err) {
        console.error('Error fetching nutrition analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNutritionData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-text-muted animate-pulse-soft">
        Ovqatlanish analitikasi yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">Ovqatlanish & Kaloriya Analitikasi</h2>
        <p className="text-xs text-text-muted mt-0.5">Foydalanuvchilarning iste'mol qilgan taomlari va makronutrientlar statistikasi</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Jami Yozilgan Taomlar" value={nutritionData.totalLogs} subtitle="Log qilingan ovqatlar" icon={Utensils} color="warning" />
        <KPICard title="O'rtacha Kaloriya" value={`${nutritionData.avgCalories} kcal`} subtitle="Bir taom uchun" icon={Flame} color="destructive" />
        <KPICard title="O'rtacha Oqsil" value={`${nutritionData.avgProtein} g`} subtitle="Protein tarkibi" icon={PieChart} color="brand" />
        <KPICard title="Uglevod & Yog'" value={`${nutritionData.avgCarbs}g / ${nutritionData.avgFat}g`} subtitle="C / F nisbati" icon={ShieldCheck} color="success" />
      </div>

      {/* Top Consumed Foods Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border p-5 shadow-soft">
          <h3 className="text-sm font-bold text-text-primary mb-1">Eng Ko'p Iste'mol Qilingan Taomlar</h3>
          <p className="text-[11px] text-text-muted mb-4">Top 8 uzbek milliy va tez tayyorlanadigan taomlar</p>
          <SimpleBarChart data={nutritionData.topFoods} xKey="name" dataKey="count" name="Soni" color="#f59e0b" />
        </div>

        {/* Source Distribution */}
        <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
          <h3 className="text-sm font-bold text-text-primary mb-1">Kiritish Manbalari</h3>
          <p className="text-[11px] text-text-muted mb-4">Savat vs Qidiruv vs AI Rasm vs Qo'lda</p>
          <SimpleDonutChart data={nutritionData.sourceDistribution} />
        </div>
      </div>

      {/* Meal Type Breakdown */}
      <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
        <h3 className="text-sm font-bold text-text-primary mb-1">Ovqat Qabul Qilish Vaqtlari Taqsimoti</h3>
        <p className="text-[11px] text-text-muted mb-4">Nonushta, Tushlik, Kechki ovqat va Perekus</p>
        <SimpleDonutChart data={nutritionData.mealTypeDistribution} />
      </div>
    </div>
  );
}
