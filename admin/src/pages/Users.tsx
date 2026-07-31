import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { Search, Filter, Mail, Calendar, X, BarChart2, Droplet, MessageSquare, Utensils, ChevronRight, ChevronDown, ChevronUp, User as UserIcon, Trash2, Camera, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface UserRecord {
  uid: string;
  fio: string;
  email: string;
  gender: string;
  height?: number;
  weight?: number;
  bodyType: string;
  activity: string;
  createdAt: string;
  photoUrl?: string;
  birthDate?: string;
  birthYear?: number;
  goal?: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    food: true,
    hydration: true,
    chat: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const list: UserRecord[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.profile) {
            list.push({
              uid: doc.id,
              fio: data.profile.fio || 'Noma\'lum',
              email: data.profile.email || '-',
              gender: data.profile.gender || 'male',
              height: data.profile.height,
              weight: data.profile.weight,
              bodyType: data.profile.bodyType || 'average',
              activity: data.profile.activity || 'active',
              createdAt: data.profile.createdAt || new Date().toISOString(),
              photoUrl: data.profile.photoUrl,
              birthDate: data.profile.birthDate,
              birthYear: data.profile.birthYear,
              goal: data.profile.goal,
            });
          }
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUsers(list);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleSelectUser = async (u: UserRecord) => {
    setSelectedUser(u);
    setDetailsLoading(true);
    setUserDetails(null);
    try {
      // Fetch hydration logs
      const hydraSnap = await getDocs(collection(db, 'users', u.uid, 'hydration'));
      const hydrationLogs: any[] = [];
      hydraSnap.forEach((doc) => hydrationLogs.push(doc.data()));

      // Fetch measurements
      const measSnap = await getDocs(collection(db, 'users', u.uid, 'measurements'));
      const measurements: any[] = [];
      measSnap.forEach((doc) => measurements.push(doc.data()));

      // Fetch food logs
      const foodSnap = await getDocs(collection(db, 'users', u.uid, 'foodLogs'));
      const foodLogs: any[] = [];
      foodSnap.forEach((doc) => foodLogs.push(doc.data()));

      // Fetch chat sessions
      const chatSnap = await getDocs(collection(db, 'users', u.uid, 'chatSessions'));
      const chatSessions: any[] = [];
      chatSnap.forEach((doc) => chatSessions.push(doc.data()));

      setUserDetails({
        hydration: hydrationLogs.sort((a, b) => b.date.localeCompare(a.date)),
        measurements: measurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        foodLogs: foodLogs.sort((a, b) => new Date(b.createdAt || a.date).getTime() - new Date(a.createdAt || b.date).getTime()),
        chatSessions: chatSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      });
    } catch (err) {
      console.error('Error fetching user detail subcollections:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteUserDoc = async (uid: string, fio: string) => {
    if (!window.confirm(`${fio} foydalanuvchisini va unga tegishli barcha ma'lumotlarni o'chirishga ishonchingiz komilmi?`)) return;
    try {
      const subcollections = ["hydration", "measurements", "foodLogs", "chatSessions", "challenges"];
      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, "users", uid, sub));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, "users", uid, sub, d.id));
        }
      }
      await deleteDoc(doc(db, "users", uid));
      setUsers(prev => prev.filter(u => u.uid !== uid));
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user doc:", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fio.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'all' || u.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">Foydalanuvchilar Boshqaruvi</h2>
          <p className="text-xs text-text-muted mt-0.5">Jami ro'yxatdan o'tgan foydalanuvchilar ({users.length} ta)</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="F.I.O yoki pochta bo'yicha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand w-64 shadow-soft"
            />
          </div>

          {/* Gender Filter */}
          <div className="relative">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer shadow-soft min-w-[170px]"
            >
              <option value="all">Barcha jinslar</option>
              <option value="male">Erkaklar</option>
              <option value="female">Ayollar</option>
            </select>
            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-text-muted animate-pulse-soft">
            Foydalanuvchilar ro'yxati yuklanmoqda...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-muted">
            Qidiruv bo'yicha foydalanuvchi topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary-bg/40 text-text-muted font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Foydalanuvchi</th>
                  <th className="p-4">Jinsi</th>
                  <th className="p-4">Bo'y / Vazn</th>
                  <th className="p-4">Tana Tuzilishi</th>
                  <th className="p-4">Faollik</th>
                  <th className="p-4">Ro'yxat Sanasi</th>
                  <th className="p-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.uid}
                    onClick={() => handleSelectUser(u)}
                    className="hover:bg-secondary-bg/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-semibold text-text-primary flex items-center gap-3">
                      {u.photoUrl ? (
                        <img src={u.photoUrl} alt={u.fio} className="h-9 w-9 rounded-xl object-cover border border-brand/30 shrink-0 shadow-soft" />
                      ) : (
                        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-soft">
                          {u.fio.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-text-primary group-hover:text-brand transition-colors">{u.fio}</p>
                        <p className="text-[11px] text-text-muted flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {u.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-text-secondary">
                      {u.gender === 'male' ? 'Erkak' : 'Ayol'}
                    </td>
                    <td className="p-4 font-semibold text-text-secondary">
                      {u.height ? `${u.height} sm` : '-'} / {u.weight ? `${u.weight} kg` : '-'}
                    </td>
                    <td className="p-4 font-semibold text-text-secondary capitalize">
                      {u.bodyType === 'skinny' ? 'Ozg\'in' : u.bodyType === 'bulk' ? 'Semiz/Vaznli' : 'O\'rtacha'}
                    </td>
                    <td className="p-4 font-semibold">
                      <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-extrabold">
                        {u.activity === 'athlete' ? 'Sportchi' : u.activity === 'active' ? 'Aktiv' : 'Kam harakat'}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted font-medium">
                      {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 rounded-lg bg-secondary-bg text-text-muted group-hover:text-brand group-hover:bg-brand/10 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Drill-down Side Panel Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-surface border-l border-border h-full flex flex-col shadow-2xl animate-slide-in overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary-bg/30">
              <div className="flex items-center gap-3">
                {selectedUser.photoUrl ? (
                  <img src={selectedUser.photoUrl} alt={selectedUser.fio} className="h-12 w-12 rounded-2xl object-cover border-2 border-brand shadow-soft" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-extrabold text-lg shadow-soft">
                    {selectedUser.fio.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-text-primary">{selectedUser.fio}</h3>
                  <p className="text-xs text-text-muted">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteUserDoc(selectedUser.uid, selectedUser.fio)}
                  title="Foydalanuvchini o'chirish"
                  className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" /> O'chirish
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-xl bg-secondary-bg text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Motivational Goal Banner if set */}
              {selectedUser.goal && (
                <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20 flex items-start gap-3">
                  <span className="text-xl shrink-0">🎯</span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-brand tracking-wider">Shaxsiy Motivatsion Maqsad</span>
                    <p className="text-xs font-bold text-text-primary mt-0.5 leading-snug">{selectedUser.goal}</p>
                  </div>
                </div>
              )}

              {/* Dedicated Profile Photo Section */}
              <div className="p-4 rounded-2xl bg-secondary-bg/60 border border-border/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-brand" /> Foydalanuvchi Profil Rasmi
                </span>
                {selectedUser.photoUrl ? (
                  <div className="flex items-center gap-4 pt-1">
                    <img
                      src={selectedUser.photoUrl}
                      alt={selectedUser.fio}
                      className="h-24 w-24 rounded-2xl object-cover border-2 border-brand/50 shadow-soft cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                      onClick={() => window.open(selectedUser.photoUrl, '_blank')}
                      title="To'liq hajmda ko'rish uchun bosing"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">{selectedUser.fio} avatar rasmi</p>
                      <p className="text-[11px] text-text-muted mt-0.5">Foydalanuvchi ilovada yuklagan shaxsiy profil rasmi.</p>
                      <a
                        href={selectedUser.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-brand hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> To'liq o'lchamda ochish
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-background/50 border border-border/40 text-xs text-text-muted flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-text-muted" />
                    <span>Foydalanuvchi hali shaxsiy profil rasmini yuklamagan (Standart avatar ko'rsatiladi).</span>
                  </div>
                )}
              </div>

              {/* Profile Card */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-secondary-bg border border-border/50">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Jinsi</span>
                  <p className="text-xs font-bold text-text-primary mt-0.5">{selectedUser.gender === 'male' ? 'Erkak' : 'Ayol'}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary-bg border border-border/50">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Tug'ilgan Sana</span>
                  <p className="text-xs font-bold text-text-primary mt-0.5">{selectedUser.birthDate || selectedUser.birthYear || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary-bg border border-border/50">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Bo'y / Vazn</span>
                  <p className="text-xs font-bold text-text-primary mt-0.5">{selectedUser.height || '-'}sm / {selectedUser.weight || '-'}kg</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary-bg border border-border/50">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Faollik</span>
                  <p className="text-xs font-bold text-brand mt-0.5">{selectedUser.activity}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary-bg border border-border/50">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Tana turi</span>
                  <p className="text-xs font-bold text-text-primary mt-0.5">{selectedUser.bodyType}</p>
                </div>
              </div>

              {detailsLoading ? (
                <div className="p-8 text-center text-xs text-text-muted animate-pulse-soft">
                  Foydalanuvchi ma'lumotlari yuklanmoqda...
                </div>
              ) : userDetails ? (
                <>
                  {/* Food Logs Section Accordion */}
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleSection('food')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-secondary-bg hover:bg-secondary-bg/80 border border-border/60 transition-all text-left group shadow-soft"
                    >
                      <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-warning" /> Ovqatlanish Tarixi ({userDetails.foodLogs.length} ta)
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted font-bold">
                          {openSections.food ? 'Yig\'ish' : 'Ochish'}
                        </span>
                        {openSections.food ? (
                          <ChevronUp className="h-4 w-4 text-text-muted group-hover:text-brand transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-text-muted group-hover:text-brand transition-colors" />
                        )}
                      </div>
                    </button>

                    {openSections.food && (
                      <div className="pt-1 animate-fade-in">
                        {userDetails.foodLogs.length === 0 ? (
                          <p className="text-xs text-text-muted p-3 bg-secondary-bg/40 rounded-xl">Ovqat loglari mavjud emas.</p>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {userDetails.foodLogs.slice(0, 15).map((log: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-xl bg-secondary-bg/60 border border-border/40 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-text-primary">{log.foodName}</p>
                                  <p className="text-[10px] text-text-muted">{log.date} • {log.mealType}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-extrabold text-amber-500">{log.calories} kcal</p>
                                  <p className="text-[9px] text-text-muted">P:{log.protein}g F:{log.fat}g C:{log.carbs}g</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hydration Section Accordion */}
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleSection('hydration')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-secondary-bg hover:bg-secondary-bg/80 border border-border/60 transition-all text-left group shadow-soft"
                    >
                      <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-info" /> Suv va Qo'shimchalar Tarixi ({userDetails.hydration.length} ta)
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted font-bold">
                          {openSections.hydration ? 'Yig\'ish' : 'Ochish'}
                        </span>
                        {openSections.hydration ? (
                          <ChevronUp className="h-4 w-4 text-text-muted group-hover:text-brand transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-text-muted group-hover:text-brand transition-colors" />
                        )}
                      </div>
                    </button>

                    {openSections.hydration && (
                      <div className="pt-1 animate-fade-in">
                        {userDetails.hydration.length === 0 ? (
                          <p className="text-xs text-text-muted p-3 bg-secondary-bg/40 rounded-xl">Gidratatsiya yozuvlari yo'q.</p>
                        ) : (
                          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                            {userDetails.hydration.slice(0, 10).map((h: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-xl bg-secondary-bg/60 border border-border/40 flex items-center justify-between text-xs">
                                <span className="font-bold text-text-primary">{h.date}</span>
                                <span className="font-extrabold text-info">{(h.waterMl / 1000).toFixed(1)} L Suv</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI Chat History Accordion */}
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleSection('chat')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-secondary-bg hover:bg-secondary-bg/80 border border-border/60 transition-all text-left group shadow-soft"
                    >
                      <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-brand" /> AI Chat Suhbatlari ({userDetails.chatSessions.length} ta)
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted font-bold">
                          {openSections.chat ? 'Yig\'ish' : 'Ochish'}
                        </span>
                        {openSections.chat ? (
                          <ChevronUp className="h-4 w-4 text-text-muted group-hover:text-brand transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-text-muted group-hover:text-brand transition-colors" />
                        )}
                      </div>
                    </button>

                    {openSections.chat && (
                      <div className="pt-1 animate-fade-in">
                        {userDetails.chatSessions.length === 0 ? (
                          <p className="text-xs text-text-muted p-3 bg-secondary-bg/40 rounded-xl">AI suhbatlar mavjud emas.</p>
                        ) : (
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {userDetails.chatSessions.map((session: any, idx: number) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-secondary-bg/80 border border-border/60 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-extrabold text-text-primary">{session.title}</p>
                                  <span className="text-[10px] text-text-muted font-semibold">{session.messages?.length || 0} ta xabar</span>
                                </div>
                                <div className="space-y-1.5 pt-1 border-t border-border/40">
                                  {session.messages?.map((msg: any, mIdx: number) => (
                                    <div key={mIdx} className="p-2 rounded-lg bg-surface/70 border border-border/30 text-[11px]">
                                      <div className="flex items-center justify-between text-[9px] font-bold text-text-muted mb-0.5">
                                        <span className={msg.role === 'user' ? 'text-brand' : 'text-emerald-500'}>
                                          {msg.role === 'user' ? selectedUser.fio : 'AI Murabbiy'}
                                        </span>
                                        <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                      </div>
                                      {msg.imageUrl && (
                                        <img src={msg.imageUrl} alt="Rasm" className="max-h-32 rounded mb-1 object-cover" />
                                      )}
                                      <p className="text-text-primary font-medium">{msg.text || '[Rasm]'}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
