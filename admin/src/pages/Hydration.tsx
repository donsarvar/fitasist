import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { KPICard } from '../components/KPICard';
import { SimpleAreaChart, SimpleDonutChart } from '../components/Charts';
import { Droplets, Sparkles, Activity, Award } from 'lucide-react';

export function HydrationPage() {
  const [loading, setLoading] = useState(true);
  const [hydrationStats, setHydrationStats] = useState({
    totalLogs: 0,
    avgWaterLitres: 0,
    creatineUsersPercent: 0,
    vitaminDUsersPercent: 0,
    hydrationTrends: [] as { date: string; water: number }[],
  });

  useEffect(() => {
    async function fetchHydrationData() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalLogs = 0;
        let sumWater = 0;
        let creatineUsers = 0;
        let vitDUsers = 0;
        const dateMap: Record<string, number> = {};

        for (const userDoc of usersSnap.docs) {
          const hydraSnap = await getDocs(collection(db, 'users', userDoc.id, 'hydration'));
          hydraSnap.forEach((doc) => {
            const data = doc.data();
            totalLogs++;
            const waterL = (data.waterMl || 0) / 1000;
            sumWater += waterL;

            if (data.creatineG && data.creatineG > 0) creatineUsers++;
            if (data.vitaminD) vitDUsers++;

            if (data.date) {
              dateMap[data.date] = (dateMap[data.date] || 0) + waterL;
            }
          });
        }

        const trendList = Object.entries(dateMap)
          .map(([date, water]) => ({ date, water: Math.round(water * 10) / 10 }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-10);

        setHydrationStats({
          totalLogs,
          avgWaterLitres: totalLogs > 0 ? Math.round((sumWater / totalLogs) * 10) / 10 : 0,
          creatineUsersPercent: totalLogs > 0 ? Math.round((creatineUsers / totalLogs) * 100) : 0,
          vitaminDUsersPercent: totalLogs > 0 ? Math.round((vitDUsers / totalLogs) * 100) : 0,
          hydrationTrends: trendList.length > 0 ? trendList : [
            { date: 'Bugun', water: 2.5 },
            { date: 'Kecha', water: 2.1 },
          ],
        });
      } catch (err) {
        console.error('Error fetching hydration stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHydrationData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-text-muted animate-pulse-soft">
        Gidratatsiya analitikasi yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">Gidratatsiya & Qo'shimchalar Analitikasi</h2>
        <p className="text-xs text-text-muted mt-0.5">Suv iste'moli va Creatine / Whey / Vitamin D ko'rsatkichlari</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Jami Suv Loglari" value={hydrationStats.totalLogs} subtitle="Yozilgan kunlar" icon={Droplets} color="info" />
        <KPICard title="O'rtacha Suv" value={`${hydrationStats.avgWaterLitres} L`} subtitle="Kunga to'g'ri keladigan" icon={Activity} color="brand" />
        <KPICard title="Kreatin Qabul Iste'molchilar" value={`${hydrationStats.creatineUsersPercent}%`} subtitle="Creatine qabul qilganlar" icon={Sparkles} color="warning" />
        <KPICard title="Vitamin D Qabuli" value={`${hydrationStats.vitaminDUsersPercent}%`} subtitle="Vitamindan foydalanuvchilar" icon={Award} color="success" />
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
        <h3 className="text-sm font-bold text-text-primary mb-1">Umumiy Suv Iste'moli Dinamikasi (Litrda)</h3>
        <p className="text-[11px] text-text-muted mb-4">Kunlar kesimida jamlangan litrlar</p>
        <SimpleAreaChart data={hydrationStats.hydrationTrends} xKey="date" dataKey="water" name="Suv (Litr)" color="#38bdf8" />
      </div>
    </div>
  );
}
