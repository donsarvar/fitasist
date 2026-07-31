import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { KPICard } from '../components/KPICard';
import { SimpleAreaChart } from '../components/Charts';
import { Ruler, Activity, TrendingDown, Scale } from 'lucide-react';

export function MeasurementsPage() {
  const [loading, setLoading] = useState(true);
  const [measurementData, setMeasurementData] = useState({
    totalLogs: 0,
    avgWeight: 0,
    avgHeight: 0,
    avgBMI: 0,
    weightHistory: [] as { date: string; weight: number }[],
  });

  useEffect(() => {
    async function fetchMeasurements() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalLogs = 0;
        let sumWeight = 0;
        let sumHeight = 0;
        let userCountWithHeight = 0;
        const allMeasurements: any[] = [];

        for (const userDoc of usersSnap.docs) {
          const uData = userDoc.data();
          if (uData.profile?.height) {
            sumHeight += uData.profile.height;
            userCountWithHeight++;
          }

          const measSnap = await getDocs(collection(db, 'users', userDoc.id, 'measurements'));
          measSnap.forEach((doc) => {
            const data = doc.data();
            if (data.weight) {
              totalLogs++;
              sumWeight += data.weight;
              allMeasurements.push({ date: data.date, weight: data.weight });
            }
          });
        }

        const avgH = userCountWithHeight > 0 ? Math.round(sumHeight / userCountWithHeight) : 175;
        const avgW = totalLogs > 0 ? Math.round(sumWeight / totalLogs) : 70;
        const bmi = Math.round((avgW / Math.pow(avgH / 100, 2)) * 10) / 10;

        allMeasurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setMeasurementData({
          totalLogs,
          avgWeight: avgW,
          avgHeight: avgH,
          avgBMI: bmi,
          weightHistory: allMeasurements.slice(-10),
        });
      } catch (err) {
        console.error('Error fetching measurements:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeasurements();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-text-muted animate-pulse-soft">
        O'lchamlar va vazn analitikasi yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">Tana O'lchamlari & Vazn Analitikasi</h2>
        <p className="text-xs text-text-muted mt-0.5">Vazn o'zgarishi, ko'krak, bel va BMI ko'rsatkichlari</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Jami O'lchov Yozuvlari" value={measurementData.totalLogs} subtitle="Foydalanuvchilar vaznlari" icon={Ruler} color="brand" />
        <KPICard title="O'rtacha Vazn" value={`${measurementData.avgWeight} kg`} subtitle="Barcha foydalanuvchilar" icon={Scale} color="warning" />
        <KPICard title="O'rtacha Bo'y" value={`${measurementData.avgHeight} sm`} subtitle="Baza bo'yicha" icon={Activity} color="info" />
        <KPICard title="O'rtacha BMI" value={measurementData.avgBMI} subtitle="Body Mass Index" icon={TrendingDown} color="success" />
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
        <h3 className="text-sm font-bold text-text-primary mb-1">Vazn Dinamikasi Trendi (kg)</h3>
        <p className="text-[11px] text-text-muted mb-4">Foydalanuvchilar tomondan yozilgan vaznlar grafigi</p>
        <SimpleAreaChart data={measurementData.weightHistory} xKey="date" dataKey="weight" name="Vazn (kg)" color="#7b5cff" />
      </div>
    </div>
  );
}
