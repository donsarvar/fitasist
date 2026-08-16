import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { KPICard } from '../components/KPICard';
import { SimpleDonutChart } from '../components/Charts';
import { Trophy, Target, Award, CheckCircle2 } from 'lucide-react';

export function ChallengesPage() {
  const [loading, setLoading] = useState(true);
  const [challengeData, setChallengeData] = useState({
    totalChallenges: 0,
    completedChallenges: 0,
    activeChallenges: 0,
    challengeDistribution: [] as { name: string; value: number }[],
  });

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let total = 0;
        let completed = 0;
        let active = 0;
        const nameCounts: Record<string, number> = {};

        for (const userDoc of usersSnap.docs) {
          const chSnap = await getDocs(collection(db, 'users', userDoc.id, 'challenges'));
          chSnap.forEach((doc) => {
            const data = doc.data();
            total++;
            if (data.completed) completed++;
            else active++;

            if (data.name) {
              nameCounts[data.name] = (nameCounts[data.name] || 0) + 1;
            }
          });
        }

        const dist = Object.entries(nameCounts).map(([name, value]) => ({ name, value }));

        setChallengeData({
          totalChallenges: total,
          completedChallenges: completed,
          activeChallenges: active,
          challengeDistribution: dist.length > 0 ? dist : [
            { name: '30 kunlik Turnik Challenge', value: 12 },
            { name: 'Sugarsiz 14 kun', value: 8 },
            { name: 'Har kuni 10,000 qadam', value: 15 },
          ],
        });
      } catch (err) {
        console.error('Error fetching challenges:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-text-muted animate-pulse-soft">
        Musobaqalar analitikasi yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">Musobaqalar (Challenges) Boshqaruvi</h2>
        <p className="text-xs text-text-muted mt-0.5">Foydalanuvchilarning motivatsiya va musobaqalarda ishtiroki</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Jami Musobaqalar" value={challengeData.totalChallenges} subtitle="Barcha foydalanuvchilarda" icon={Trophy} color="brand" />
        <KPICard title="Faol Musobaqalar" value={challengeData.activeChallenges} subtitle="Hozir bajarilyotgan" icon={Target} color="warning" />
        <KPICard title="Yakunlangan" value={challengeData.completedChallenges} subtitle="Muvaffaqiyatli tugallangan" icon={CheckCircle2} color="success" />
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
        <h3 className="text-sm font-bold text-text-primary mb-1">Mashhur Musobaqalar Taqsimoti</h3>
        <p className="text-[11px] text-text-muted mb-4">Eng ko'p tanlangan challenge turlari</p>
        <SimpleDonutChart data={challengeData.challengeDistribution} />
      </div>
    </div>
  );
}
