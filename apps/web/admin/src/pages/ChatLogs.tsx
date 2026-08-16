import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MessageSquare, User as UserIcon, Bot, Calendar, Search, ImageIcon, ChevronRight, Inbox } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: any[];
}

interface UserChatGroup {
  userId: string;
  userName: string;
  userEmail: string;
  lastActive: string;
  sessions: ChatSession[];
}

export function ChatLogsPage() {
  const [userGroups, setUserGroups] = useState<UserChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChatLogs() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const groups: UserChatGroup[] = [];

        for (const userDoc of usersSnap.docs) {
          const uData = userDoc.data();
          const profile = uData.profile;
          if (!profile) continue;

          const userName = profile.fio || 'Noma\'lum';
          const userEmail = profile.email || '-';

          const chatSnap = await getDocs(collection(db, 'users', userDoc.id, 'chatSessions'));
          const sessions: ChatSession[] = [];

          chatSnap.forEach((doc) => {
            const data = doc.data();
            const msgs = data.messages || [];
            // Only include sessions that have at least 1 message or title
            if (msgs.length > 0 || (data.title && data.title !== 'Yangi suhbat')) {
              sessions.push({
                id: doc.id,
                title: data.title || 'AI Suhbat',
                createdAt: data.createdAt || data.updatedAt || new Date().toISOString(),
                messages: msgs,
              });
            }
          });

          if (sessions.length > 0) {
            sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            groups.push({
              userId: userDoc.id,
              userName,
              userEmail,
              lastActive: sessions[0].createdAt,
              sessions,
            });
          }
        }

        groups.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
        setUserGroups(groups);

        // Auto-select first user if available
        if (groups.length > 0) {
          setSelectedUserId(groups[0].userId);
          setSelectedSessionId(groups[0].sessions[0]?.id || null);
        }
      } catch (err) {
        console.error('Error fetching chat logs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChatLogs();
  }, []);

  const filteredUserGroups = userGroups.filter((g) => {
    const q = searchQuery.toLowerCase();
    const matchesUser = g.userName.toLowerCase().includes(q) || g.userEmail.toLowerCase().includes(q);
    const matchesSessions = g.sessions.some(
      (s) => s.title.toLowerCase().includes(q) || s.messages.some((m: any) => (m.text || '').toLowerCase().includes(q))
    );
    return matchesUser || matchesSessions;
  });

  const selectedUserGroup = userGroups.find((g) => g.userId === selectedUserId);
  const activeSession = selectedUserGroup?.sessions.find((s) => s.id === selectedSessionId) || selectedUserGroup?.sessions[0];

  return (
    <div className="space-y-4 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">AI Chat Yozishmalar Markazi</h2>
          <p className="text-xs text-text-muted mt-0.5">Foydalanuvchilar kesimida guruhlangan professional chat monitoringi</p>
        </div>
        <div className="text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-xl border border-brand/20">
          Jami {userGroups.length} ta faol muloqot qilgan foydalanuvchi
        </div>
      </div>

      {/* 2-Column Messenger Layout */}
      <div className="flex-1 bg-surface border border-border rounded-2xl shadow-soft flex overflow-hidden min-h-0">
        {/* Left Side: Users List */}
        <div className="w-80 border-r border-border flex flex-col shrink-0 bg-secondary-bg/20">
          {/* Search Box */}
          <div className="p-3.5 border-b border-border">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Foydalanuvchi yoki xabar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand shadow-soft"
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {loading ? (
              <div className="p-8 text-center text-xs text-text-muted animate-pulse-soft">
                Foydalanuvchilar yuklanmoqda...
              </div>
            ) : filteredUserGroups.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">
                Foydalanuvchilar topilmadi.
              </div>
            ) : (
              filteredUserGroups.map((group) => {
                const isSelected = group.userId === selectedUserId;
                const totalMessages = group.sessions.reduce((acc, s) => acc + s.messages.length, 0);

                return (
                  <button
                    key={group.userId}
                    onClick={() => {
                      setSelectedUserId(group.userId);
                      setSelectedSessionId(group.sessions[0]?.id || null);
                    }}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-brand/10 border-l-4 border-l-brand'
                        : 'hover:bg-secondary-bg/50'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-soft">
                      {group.userName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold text-xs truncate ${isSelected ? 'text-brand' : 'text-text-primary'}`}>
                          {group.userName}
                        </p>
                        <span className="text-[9px] text-text-muted shrink-0 font-medium">
                          {new Date(group.lastActive).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{group.userEmail}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[9px] font-extrabold">
                          {group.sessions.length} ta suhbat
                        </span>
                        <span className="text-[9px] text-text-muted font-medium">
                          {totalMessages} ta xabar
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Messenger Interface */}
        <div className="flex-1 flex flex-col bg-background/30 min-w-0">
          {selectedUserGroup && activeSession ? (
            <>
              {/* Messenger Header */}
              <div className="p-4 border-b border-border bg-surface flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-soft">
                      {selectedUserGroup.userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-text-primary">{selectedUserGroup.userName}</h3>
                      <p className="text-[11px] text-text-muted">{selectedUserGroup.userEmail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted font-medium">
                    Oxirgi faollik: {new Date(selectedUserGroup.lastActive).toLocaleString('uz-UZ')}
                  </span>
                </div>

                {/* Topic Tabs Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-border/50">
                  <span className="text-[10px] text-text-muted font-bold uppercase shrink-0 mr-1">Suhbat mavzulari:</span>
                  {selectedUserGroup.sessions.map((sess) => {
                    const isActive = sess.id === activeSession.id;
                    return (
                      <button
                        key={sess.id}
                        onClick={() => setSelectedSessionId(sess.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-brand text-white shadow-soft'
                            : 'bg-secondary-bg text-text-secondary hover:text-text-primary border border-border/50'
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[150px]">{sess.title}</span>
                        <span className="text-[9px] opacity-80 px-1 py-0.2 rounded bg-black/20">
                          {sess.messages.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Transcript Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeSession.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-2">
                    <Inbox className="h-10 w-10 opacity-40" />
                    <p className="text-xs font-semibold">Ushbu suhbat mavzusida hali xabarlar yo'q.</p>
                  </div>
                ) : (
                  activeSession.messages.map((msg: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-soft ${
                          msg.role === 'user' ? 'bg-brand text-white' : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-brand text-white rounded-tr-none shadow-soft'
                            : 'bg-surface text-text-primary border border-border rounded-tl-none shadow-soft'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75 font-semibold">
                          <span>{msg.role === 'user' ? selectedUserGroup.userName : 'AI FitAssist Murabbiy'}</span>
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>
                        {msg.imageUrl && (
                          <div className="mb-2.5">
                            <img
                              src={msg.imageUrl}
                              alt="Yuborilgan Rasm"
                              className="max-w-full rounded-xl border border-white/20 max-h-64 object-cover"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap font-medium">{msg.text || '[Rasm]'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-3 p-8">
              <div className="h-16 w-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Suhbatni tanlang</h3>
              <p className="text-xs text-text-muted text-center max-w-sm">
                Foydalanuvchi va AI o'rtasidagi yozishmalarni o'qish uchun chap tomondagi ro'yxatdan foydalanuvchini tanlang.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
