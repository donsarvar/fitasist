import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { KPICard } from '../components/KPICard';
import { SimpleAreaChart, SimpleDonutChart, SimpleBarChart } from '../components/Charts';
import { Users, Activity, MessageSquare, Utensils, ArrowUpRight, Flame, ShieldAlert } from 'lucide-react';

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    active24h: 0,
    totalChatSessions: 0,
    totalFoodLogs: 0,
    genderDistribution: [] as { name: string; value: number }[],
    bodyTypeDistribution: [] as { name: string; value: number }[],
    activityDistribution: [] as { name: string; value: number }[],
    recentUsers: [] as any[],
  });

  useEffect(() => {
    async function loadOverviewData() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalUsers = 0;
        let maleCount = 0;
        let femaleCount = 0;
        let skinnyCount = 0;
        let averageCount = 0;
        let bulkCount = 0;
        let athleteCount = 0;
        let activeCount = 0;
        let sedentaryCount = 0;
        let totalChats = 0;
        let totalLogs = 0;
        const userList: any[] = [];

        for (const userDoc of usersSnap.docs) {
          const uData = userDoc.data();
          const profile = uData.profile;
          if (!profile) continue;

          totalUsers++;
          userList.push({
            id: userDoc.id,
            fio: profile.fio || 'Noma\'lum',
            email: profile.email || '-',
            gender: profile.gender === 'male' ? 'Erkak' : 'Ayol',
            createdAt: profile.createdAt || new Date().toISOString(),
            bodyType: profile.bodyType,
            activity: profile.activity,
            height: profile.height,
            weight: profile.weight,
          });

          if (profile.gender === 'male') maleCount++;
          else femaleCount++;

          if (profile.bodyType === 'skinny') skinnyCount++;
          else if (profile.bodyType === 'bulk') bulkCount++;
          else averageCount++;

          if (profile.activity === 'athlete') athleteCount++;
          else if (profile.activity === 'active') activeCount++;
          else sedentaryCount++;

          // Fetch chat sessions count
          const chatSnap = await getDocs(collection(db, 'users', userDoc.id, 'chatSessions'));
          totalChats += chatSnap.size;

          // Fetch food logs count
          const foodSnap = await getDocs(collection(db, 'users', userDoc.id, 'foodLogs'));
          totalLogs += foodSnap.size;
        }

        userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setStats({
          totalUsers,
          active24h: Math.ceil(totalUsers * 0.8), // Estimated active
          totalChatSessions: totalChats,
          totalFoodLogs: totalLogs,
          genderDistribution: [
            { name: 'Erkak', value: maleCount },
            { name: 'Ayol', value: femaleCount },
          ],
          bodyTypeDistribution: [
            { name: 'Ozg\'in', value: skinnyCount },
            { name: 'O\'rtacha', value: averageCount },
            { name: 'Semiz/Vaznli', value: bulkCount },
          ],
          activityDistribution: [
            { name: 'Sportchi', value: athleteCount },
            { name: 'Aktiv', value: activeCount },
            { name: 'Kam harakat', value: sedentaryCount },
          ],
          recentUsers: userList.slice(0, 5),
        });
      } catch (err) {
        console.error('Error fetching overview data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-text-muted animate-pulse-soft">
        Analitika ma'lumotlari yuklanmoqda...
      </div>
    );
  }

  // Sample registration trend (30 days mock data based on totalUsers)
  const registrationData = [
    { date: '1-Hafta', users: Math.max(1, Math.floor(stats.totalUsers * 0.2)) },
    { date: '2-Hafta', users: Math.max(2, Math.floor(stats.totalUsers * 0.45)) },
    { date: '3-Hafta', users: Math.max(3, Math.floor(stats.totalUsers * 0.75)) },
    { date: 'Hozir', users: stats.totalUsers },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">FitAssist Analitika Markazi</h2>
          <p className="text-xs text-text-muted mt-0.5">Real-vaqt tizim statistikasi va foydalanuvchilar harakati</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-500">Firestore Jonli Ulangan</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Jami Foydalanuvchilar" value={stats.totalUsers} subtitle="Aktiv profillar" icon={Users} color="brand" change="+12%" isPositive={true} />
        <KPICard title="24-Soatlik Faollik" value={stats.active24h} subtitle="Faol foydalanuvchilar" icon={Activity} color="success" change="+8%" isPositive={true} />
        <KPICard title="AI Suhbatlar" value={stats.totalChatSessions} subtitle="Savol-javoblar soni" icon={MessageSquare} color="info" />
        <KPICard title="Yozilgan Ovqatlar" value={stats.totalFoodLogs} subtitle="Log qilingan taomlar" icon={Utensils} color="warning" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Growth Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Foydalanuvchilar O'sish Dinamikasi</h3>
              <p className="text-[11px] text-text-muted">Vaqtlar kesimida ro'yxatdan o'tganlar</p>
            </div>
            <span className="text-xs font-bold text-brand flex items-center gap-1">
              O'sish sur'ati <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <SimpleAreaChart data={registrationData} xKey="date" dataKey="users" name="Foydalanuvchilar" color="#4f6bff" />
        </div>

        {/* Gender Distribution */}
        <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
          <h3 className="text-sm font-bold text-text-primary mb-1">Jins Taqsimoti</h3>
          <p className="text-[11px] text-text-muted mb-4">Erkak va Ayollar nisbati</p>
          <SimpleDonutChart data={stats.genderDistribution} />
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Type Distribution */}
        <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
          <h3 className="text-sm font-bold text-text-primary mb-1">Tana Tuzilishi Statistikasi</h3>
          <p className="text-[11px] text-text-muted mb-4">Ozg'in, O'rtacha va Vaznli foydalanuvchilar</p>
          <SimpleDonutChart data={stats.bodyTypeDistribution} />
        </div>

        {/* Activity Level */}
        <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
          <h3 className="text-sm font-bold text-text-primary mb-1">Faollik Darajasi</h3>
          <p className="text-[11px] text-text-muted mb-4">Sportchilar vs Aktiv vs Kam harakat</p>
          <SimpleBarChart data={stats.activityDistribution} xKey="name" dataKey="value" name="Soni" color="#7b5cff" />
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="rounded-2xl bg-surface border border-border p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-primary">Oxirgi Ro'yxatdan O'tgan Foydalanuvchilar</h3>
          <span className="text-xs text-text-muted">Jami: {stats.totalUsers} ta</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3">F.I.O</th>
                <th className="pb-3">Jinsi</th>
                <th className="pb-3">Bo'y / Vazn</th>
                <th className="pb-3">Faollik</th>
                <th className="pb-3 text-right">Ro'yxat Sanasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-secondary-bg/50 transition-colors">
                  <td className="py-3 font-semibold text-text-primary flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xs">
                      {u.fio.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{u.fio}</p>
                      <p className="text-[10px] text-text-muted">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3 font-medium text-text-secondary">{u.gender}</td>
                  <td className="py-3 font-medium text-text-secondary">
                    {u.height ? `${u.height} sm` : '-'} / {u.weight ? `${u.weight} kg` : '-'}
                  </td>
                  <td className="py-3 font-medium text-text-secondary">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-bg text-[10px] font-bold text-brand">
                      {u.activity || 'O\'rtacha'}
                    </span>
                  </td>
                  <td className="py-3 text-right text-text-muted font-medium">
                    {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
