import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { User, Droplet, Trophy, X, ChevronRight, BarChart2, Calendar, FileText, MessageSquare, Mail } from "lucide-react";
import type { UserProfile, HydrationLog, Measurement, ChatSession } from "../../lib/fitasist/types";

interface UserRecord {
  uid: string;
  profile: UserProfile | null;
  theme?: string;
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userDetails, setUserDetails] = useState<{
    hydration: HydrationLog[];
    measurements: Measurement[];
  } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedUserChatSessions, setSelectedUserChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatSession, setSelectedChatSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const list: UserRecord[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            uid: doc.id,
            profile: data.profile || null,
            theme: data.theme,
          });
        });
        // Filter out records that don't have completed profile yet
        setUsers(list.filter((u) => u.profile !== null));
      } catch (err) {
        console.error("Error fetching users for admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUser = async (u: UserRecord) => {
    setSelectedUser(u);
    setDetailsLoading(true);
    setUserDetails(null);
    setSelectedUserChatSessions([]);
    setSelectedChatSession(null);
    try {
      // 1. Fetch user's hydration logs
      const hydraSnap = await getDocs(collection(db, "users", u.uid, "hydration"));
      const hLogs: HydrationLog[] = [];
      hydraSnap.forEach((doc) => {
        hLogs.push(doc.data() as HydrationLog);
      });
      // Sort hydration logs
      hLogs.sort((a, b) => b.date.localeCompare(a.date));

      // 2. Fetch user's measurements
      const measSnap = await getDocs(collection(db, "users", u.uid, "measurements"));
      const mLogs: Measurement[] = [];
      measSnap.forEach((doc) => {
        mLogs.push(doc.data() as Measurement);
      });
      mLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setUserDetails({
        hydration: hLogs.slice(0, 7), // Last 7 records
        measurements: mLogs,
      });

      // 3. Fetch user's chat sessions
      const chatSnap = await getDocs(collection(db, "users", u.uid, "chatSessions"));
      const cSessions: ChatSession[] = [];
      chatSnap.forEach((doc) => {
        cSessions.push(doc.data() as ChatSession);
      });
      cSessions.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      setSelectedUserChatSessions(cSessions);
    } catch (err) {
      console.error("Error fetching user subcollections:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getBodyTypeUz = (bt: string) => {
    if (bt === "skinny") return "Ozg'in";
    if (bt === "bulk") return "Semiz";
    return "O'rtacha";
  };

  const getActivityUz = (act: string) => {
    if (act === "athlete") return "Sportchi";
    if (act === "active") return "Aktiv";
    return "Kam harakat";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
      {/* Header */}
      <header className="px-6 pt-[calc(16px+env(safe-area-inset-top))] pb-5 border-b border-border flex items-center justify-between bg-surface shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Admin monitoring paneli</h2>
            <p className="text-[10px] text-text-muted">Jami faol foydalanuvchilar: {users.length} ta</p>
          </div>
        </div>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-secondary-bg text-text-secondary border border-border">
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-sm text-text-muted">Foydalanuvchilar yuklanmoqda...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-muted">Hozircha hech kim ro'yxatdan o'tmadi.</div>
        ) : (
          <div className="grid gap-3">
            {users.map((u) => (
              <button
                key={u.uid}
                onClick={() => handleSelectUser(u)}
                className={`w-full text-left rounded-2xl bg-surface border border-border p-4 shadow-soft flex items-center justify-between hover:bg-secondary-bg/50 active:scale-98 transition-all ${
                  selectedUser?.uid === u.uid ? "border-brand ring-1 ring-brand" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-white text-base font-bold select-none">
                    {u.profile?.fio.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{u.profile?.fio}</div>
                    {u.profile?.email && (
                      <div className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {u.profile.email}
                      </div>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] text-text-muted font-medium">
                      <span>Bo'y: {u.profile?.height} sm</span>
                      <span>•</span>
                      <span>Vazn: {u.profile?.weight} kg</span>
                      <span>•</span>
                      <span>{getBodyTypeUz(u.profile?.bodyType || "")}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Selected User Detail Modal/Section */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-fade-in">
            <header className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white text-base font-bold select-none">
                  {selectedUser.profile?.fio.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{selectedUser.profile?.fio}</h3>
                  <p className="text-[10px] text-text-muted">Profil va ko'rsatkichlar tahlili</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="grid h-9 w-9 place-items-center rounded-full bg-secondary-bg text-text-secondary border border-border">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-20">
              {/* Profile Details Card */}
              <div className="rounded-3xl bg-surface border border-border p-5 shadow-soft">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Tana ko'rsatkichlari</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-secondary-bg rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-text-muted">Faollik darajasi</div>
                    <div className="text-xs font-bold text-text-primary mt-0.5">{getActivityUz(selectedUser.profile?.activity || "")}</div>
                  </div>
                  <div className="bg-secondary-bg rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-text-muted">Tana tuzilishi</div>
                    <div className="text-xs font-bold text-text-primary mt-0.5">{getBodyTypeUz(selectedUser.profile?.bodyType || "")}</div>
                  </div>
                  <div className="bg-secondary-bg rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-text-muted">Bo'y / Vazn</div>
                    <div className="text-xs font-bold text-text-primary mt-0.5">{selectedUser.profile?.height}sm / {selectedUser.profile?.weight}kg</div>
                  </div>
                  <div className="bg-secondary-bg rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-text-muted">Tizimga kirgan vaqti</div>
                    <div className="text-xs font-bold text-text-primary mt-0.5">
                      {selectedUser.profile?.createdAt ? new Date(selectedUser.profile.createdAt).toLocaleDateString("uz-UZ") : "-"}
                    </div>
                  </div>
                  {selectedUser.profile?.email && (
                    <div className="col-span-2 bg-secondary-bg rounded-xl p-3 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-brand shrink-0" />
                      <div>
                        <div className="text-[10px] font-semibold text-text-muted">Google Pochta</div>
                        <div className="text-xs font-bold text-text-primary mt-0.5">{selectedUser.profile.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Detail Charts */}
              {detailsLoading ? (
                <div className="p-8 text-center text-xs text-text-muted">Natijalar yuklanmoqda...</div>
              ) : userDetails ? (
                <>
                  {/* Weight Progress Chart */}
                  <div className="rounded-3xl bg-surface border border-border p-5 shadow-soft">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <BarChart2 className="h-4 w-4 text-brand" /> Vazn tarixi
                    </h4>
                    {userDetails.measurements.length < 2 ? (
                      <div className="text-center text-xs text-text-muted p-4">Grafik uchun ma'lumot yetarli emas.</div>
                    ) : (
                      <AdminWeightChart data={userDetails.measurements} />
                    )}
                  </div>

                  {/* Hydration Logs Table */}
                  <div className="rounded-3xl bg-surface border border-border p-5 shadow-soft">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Droplet className="h-4 w-4 text-info" /> Oxirgi suv ichish ko'rsatkichlari
                    </h4>
                    {userDetails.hydration.length === 0 ? (
                      <div className="text-center text-xs text-text-muted p-4">Suv ichish tarixi mavjud emas.</div>
                    ) : (
                      <div className="space-y-2">
                        {userDetails.hydration.map((h) => (
                          <div key={h.date} className="flex items-center justify-between border-b border-divider pb-2 last:border-0">
                            <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-text-muted" /> {h.date}
                            </div>
                            <div className="text-xs font-bold text-info">{h.waterMl / 1000}L suv</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Chat History */}
                  <div className="rounded-3xl bg-surface border border-border p-5 shadow-soft">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-brand" /> AI Suhbatlar tarixi
                    </h4>
                    {selectedUserChatSessions.length === 0 ? (
                      <div className="text-center text-xs text-text-muted p-4">AI chat suhbatlari mavjud emas.</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedUserChatSessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => setSelectedChatSession(session)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary-bg hover:bg-border transition-colors text-left"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-bold text-text-primary">{session.title}</div>
                                {session.deletedForUser && (
                                  <span className="px-2 py-0.5 text-[9px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-md">
                                    User o'chirgan
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] text-text-muted mt-1">
                                {new Date(session.updatedAt || session.createdAt).toLocaleString("uz-UZ")} • {session.messages?.length || 0} ta xabar
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            
            {/* Chat Session Viewer Modal */}
            {selectedChatSession && (
              <div className="fixed inset-0 z-[60] flex flex-col bg-background animate-fade-in mx-auto w-full max-w-[480px]">
                <header className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface shrink-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-sm font-bold text-text-primary truncate">{selectedChatSession.title}</h3>
                    <p className="text-[10px] text-text-muted">Suhbat tarixi ({selectedChatSession.messages?.length || 0} ta xabar)</p>
                  </div>
                  <button onClick={() => setSelectedChatSession(null)} className="grid h-9 w-9 place-items-center rounded-full bg-secondary-bg text-text-secondary border border-border shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-secondary-bg/30 pb-20">
                  {selectedChatSession.messages && selectedChatSession.messages.length === 0 ? (
                    <div className="text-center text-xs text-text-muted p-6">Suhbatda xabarlar yo'q.</div>
                  ) : (
                    selectedChatSession.messages?.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className="text-[9px] text-text-muted mb-1 px-2">
                          {msg.role === "user" ? (selectedUser.profile?.fio || "Foydalanuvchi") : "AI Murabbiy"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-brand text-white rounded-tr-none" 
                            : "bg-surface text-text-primary border border-border rounded-tl-none shadow-sm"
                        }`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Yuborilgan rasm" className="max-w-full rounded-lg mb-2 border border-white/20 max-h-48 object-contain" />
                          )}
                          <p className="whitespace-pre-wrap">{msg.text || "[Rasm]"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple dynamic SVG Weight Chart for Selected User
function AdminWeightChart({ data }: { data: Measurement[] }) {
  const weights = data.map((d) => d.weight).filter(Boolean) as number[];
  if (weights.length < 2) return null;
  const maxW = Math.max(...weights, 1);
  const minW = Math.min(...weights, 0);
  const diffW = maxW - minW || 1;

  const width = 340;
  const height = 150;
  const padding = 20;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = weights.map((v, idx) => {
    const x = padding + (idx / (weights.length - 1)) * chartW;
    const y = padding + chartH - ((v - minW) / diffW) * chartH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="adminWGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F6BFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--color-divider)" strokeWidth="1" strokeDasharray="3" />
        <line x1={padding} y1={padding + chartH} x2={width - padding} y2={padding + chartH} stroke="var(--color-divider)" strokeWidth="1" />
        
        <path d={`M ${padding} ${padding + chartH} L ${points} L ${padding + chartW} ${padding + chartH} Z`} fill="url(#adminWGrad)" />
        <polyline fill="none" stroke="#4F6BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        
        {weights.map((v, idx) => {
          const x = padding + (idx / (weights.length - 1)) * chartW;
          const y = padding + chartH - ((v - minW) / diffW) * chartH;
          return (
            <circle key={idx} cx={x} cy={y} r="3" fill="#ffffff" stroke="#4F6BFF" strokeWidth="1.5" />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between w-full text-[9px] text-text-muted px-2">
        <span>{data[0].date}</span>
        <span className="font-semibold text-brand">Vazn dinamikasi (kg)</span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
