import { BACKEND_URL } from "@/lib/fitasist/config";
import { useState, useRef, useEffect, useMemo } from "react";
import { useFit } from "@/lib/fitasist/store";
import { askAICoach } from "@/lib/fitasist/aiService";
import { Dumbbell, Send, X, Plus, Menu, Image as ImageIcon, Trash2, ArrowLeft, Square, Search, Settings, Pin, Edit3, AlertTriangle } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { ChatSession, ChatMessage } from "@/lib/fitasist/types";
import { t } from "@/lib/fitasist/translations";

export function ChatPage({ onClose }: { onClose?: () => void }) {
  const { state, update, user, clearChat } = useFit();
  const p = state.profile;
  const sessions = state.chatSessions || [];
  const lang = p?.language || "uz";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setThinking(false);
  };

  const activeSession = useMemo(() => {
    if (currentSessionId) return sessions.find(s => s.id === currentSessionId);
    return sessions[0] || null;
  }, [sessions, currentSessionId]);

  const sortedSessions = useMemo(() => {
    let list = [...sessions];
    if (searchQuery.trim()) {
      list = list.filter(s => (s.title || t("newChat", lang)).toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }, [sessions, searchQuery, lang]);

  const togglePin = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    update(s => ({
      chatSessions: (s.chatSessions || []).map(cs => 
        cs.id === sessionId ? { ...cs, isPinned: !cs.isPinned } : cs
      )
    }));
  };

  const promptDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSessionId(sessionId);
  };

  const confirmDeleteSession = () => {
    if (!deletingSessionId) return;
    clearChat(deletingSessionId);
    if (currentSessionId === deletingSessionId) {
      setCurrentSessionId(null);
    }
    setDeletingSessionId(null);
  };

  // Set initial active session
  useEffect(() => {
    if (!currentSessionId && activeSession) {
      setCurrentSessionId(activeSession.id);
    }
  }, [activeSession, currentSessionId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current && (activeSession?.messages?.length || thinking)) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSession?.messages, thinking]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createNewSession = () => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: t("newChat", lang),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    update(s => ({ chatSessions: [newSession, ...(s.chatSessions || [])] }));
    setCurrentSessionId(newId);
    setSidebarOpen(false);
  };

// Helper to compress image client-side to lightweight base64 Data URL (~50KB-150KB)
async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const res = e.target?.result as string;
          const base64 = res.includes(",") ? res.split(",")[1] : res;
          return resolve({ dataUrl: res, base64, mimeType: file.type || "image/jpeg" });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = compressedDataUrl.split(",")[1];
        resolve({ dataUrl: compressedDataUrl, base64, mimeType });
      };
      img.onerror = () => {
        const res = e.target?.result as string || "";
        const base64 = res.includes(",") ? res.split(",")[1] : res;
        resolve({ dataUrl: res, base64, mimeType: file.type || "image/jpeg" });
      };
    };
    reader.onerror = () => resolve({ dataUrl: "", base64: "", mimeType: "image/jpeg" });
  });
}

  const send = async () => {
    const q = input.trim();
    if ((!q && !selectedImage) || thinking) return;

    // Capture current session messages snapshot BEFORE state updates
    const prevMsgsSnapshot = activeSession?.messages || [];

    let sessionId = activeSession?.id;
    
    // If no active session, create one
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      const newSession: ChatSession = {
        id: sessionId,
        title: q.substring(0, 30) || t("newChat", lang),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      update(s => ({ chatSessions: [newSession, ...(s.chatSessions || [])] }));
      setCurrentSessionId(sessionId);
    } else {
      if ((activeSession?.title === "Yangi suhbat" || activeSession?.title === t("newChat", lang) || activeSession?.title === "Новый чат" || activeSession?.title === "New Chat") && q) {
        update(s => ({
          chatSessions: s.chatSessions.map(cs => 
            cs.id === sessionId ? { ...cs, title: q.substring(0, 30) } : cs
          )
        }));
      }
    }

    const userMsgId = crypto.randomUUID();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: q,
      createdAt: new Date().toISOString(),
    };

    let base64Data: { mimeType: string; data: string } | null = null;

    // Set thinking state ONCE at start
    setThinking(true);
    abortControllerRef.current = new AbortController();

    // 1. Process Image: Compress & Convert to Lightweight Base64 Data URL
    if (selectedImage) {
      try {
        const compressed = await compressImage(selectedImage);
        userMsg.imageUrl = compressed.dataUrl; // Lightweight Data URL renders instantly in chat!
        if (compressed.base64) {
          base64Data = { mimeType: compressed.mimeType, data: compressed.base64 };
        }
      } catch (err) {
        console.error("Rasm siqishda xatolik:", err);
        userMsg.imageUrl = previewUrl || "";
      }
    }

    // 2. Append user message to chat UI immediately
    update(s => ({
      chatSessions: s.chatSessions.map(cs => 
        cs.id === sessionId 
          ? { ...cs, updatedAt: new Date().toISOString(), messages: [...(cs.messages || []), userMsg] } 
          : cs
      )
    }));

    // 3. Clear input & preview UI immediately
    setInput("");
    clearImage();
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // 4. Notify Telegram Admin Bot (non-blocking)
    fetch(`${BACKEND_URL}/notify-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "chat_message",
        text: `💬 <b>Foydalanuvchi yozdi:</b>\n\n👤 <b>Ism:</b> ${p?.fio || "Ismsiz"}\n📧 <b>Email:</b> ${p?.email || "Google / Email"}\n✍️ <b>Savol:</b> ${q || "[Rasm yuborildi]"}`
      })
    }).catch(() => {});

    // 5. Call AI Coach with complete history and base64 image data
    try {
      const chatHistoryForAI = [...prevMsgsSnapshot, userMsg];
      const aiResponse = await askAICoach(chatHistoryForAI, p, base64Data, abortControllerRef.current.signal);
      
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        text: aiResponse || "Javob olib bo'lmadi.",
        createdAt: new Date().toISOString(),
      };

      // Notify Telegram Admin Bot
      fetch(`${BACKEND_URL}/notify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat_message",
          text: `🤖 <b>AI javob berdi:</b>\n\n👤 <b>Foydalanuvchiga:</b> ${p?.fio || "Ismsiz"}\n🤖 <b>Javob:</b> ${aiResponse}`
        })
      }).catch(() => {});

      update(s => ({
        chatSessions: s.chatSessions.map(cs => 
          cs.id === sessionId 
            ? { ...cs, updatedAt: new Date().toISOString(), messages: [...(cs.messages || []), assistantMsg] } 
            : cs
        )
      }));
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setThinking(false);
      abortControllerRef.current = null;
    }
  };

  const messages = activeSession?.messages || [];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col mx-auto w-full max-w-[480px] h-[100dvh] overflow-hidden animate-fade-in shadow-2xl">
      {/* Header */}
      <div className="px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3 border-b border-border flex items-center justify-between bg-surface shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-text-secondary hover:bg-secondary-bg rounded-full transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-text-primary">{t("aiCoach", lang)}</h2>
            <p className="text-[10px] text-success font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" /> {t("online", lang)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={createNewSession} className="p-2 text-brand hover:bg-brand/10 rounded-full transition-colors" title={t("newChat", lang)}>
            <Plus className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="p-2 text-text-secondary hover:bg-secondary-bg rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="absolute inset-0 z-30 flex max-w-[480px] mx-auto">
          {/* Backdrop blur with dark overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setSidebarOpen(false)} />
          
          {/* Sleek Theme-aware Sidebar */}
          <div className="relative w-3/4 max-w-[280px] h-full bg-background dark:bg-[#12131a] shadow-2xl animate-slide-right flex flex-col border-r border-border dark:border-border/10">
            {/* Header: User Profile Info */}
            <div className="p-4 flex items-center justify-between border-b border-border dark:border-border/10">
              <span className="text-sm font-semibold text-text-primary">{t("chatHistory", lang)}</span>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-1.5 rounded-lg bg-secondary-bg hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col">
              {/* Yangi suhbat / Новый чат button */}
              <button
                onClick={() => { createNewSession(); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-xl border border-border dark:border-border/10 bg-surface hover:bg-secondary-bg active:scale-[0.98] text-text-primary text-sm font-medium transition-all"
              >
                <Edit3 className="h-4.5 w-4.5 text-brand" /> {t("newChat", lang)}
              </button>

              {/* Poisk po chatam / Search chats input */}
              <div className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder={lang === "ru" ? "Поиск чатов..." : lang === "en" ? "Search chats..." : "Suhbatlarni qidirish..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-input dark:border-border/10 bg-surface text-text-primary text-xs placeholder-text-muted focus:outline-none focus:border-brand/40 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Nedavnie / Recent section title */}
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1 mb-2">
                {lang === "ru" ? "Недавние" : lang === "en" ? "Recent" : "Yaqindagilar"}
              </div>

              {/* List of chat sessions */}
              <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                {sortedSessions.map(s => {
                  const isActive = currentSessionId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => { setCurrentSessionId(s.id); setSidebarOpen(false); }}
                      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-brand/10 dark:bg-brand/20 text-brand font-medium shadow-sm' 
                          : 'text-text-secondary hover:bg-secondary-bg hover:text-text-primary'
                      }`}
                    >
                      <div className="truncate flex-1 pr-2">
                        {s.title || t("newChat", lang)}
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Pin / Unpin Button */}
                        <button
                          onClick={(e) => togglePin(s.id, e)}
                          className={`p-1.5 rounded-lg transition-all ${
                            s.isPinned 
                              ? 'text-brand bg-brand/15 hover:bg-brand/25' 
                              : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-brand hover:bg-brand/10'
                          }`}
                          title={s.isPinned ? (lang === "ru" ? "Открепить" : lang === "en" ? "Unpin" : "Zakrepdan olish") : (lang === "ru" ? "Закрепить" : lang === "en" ? "Pin" : "Zakrep qilish")}
                        >
                          <Pin className={`h-3.5 w-3.5 ${s.isPinned ? "fill-brand stroke-brand" : ""}`} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => promptDeleteSession(s.id, e)}
                          className="p-1.5 rounded-lg text-text-muted opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title={lang === "ru" ? "Удалить чат" : lang === "en" ? "Delete chat" : "Suhbatni o'chirish"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {sortedSessions.length === 0 && (
                  <p className="text-center text-xs text-text-muted mt-10">
                    {lang === "ru" ? "Чаты не найдены" : lang === "en" ? "No chats found" : "Suhbatlar topilmadi"}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom User profile section */}
            <div className="p-3 border-t border-border dark:border-border/10 bg-secondary-bg dark:bg-[#15161f] flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand/15 border border-brand/35 text-brand font-bold text-sm grid place-items-center uppercase shadow-sm select-none shrink-0">
                {p?.fio?.charAt(0) || "U"}
              </div>
              <div className="truncate max-w-[170px]">
                <div className="text-[13px] font-semibold text-text-primary truncate">{p?.fio || (lang === "ru" ? "Пользователь" : lang === "en" ? "User" : "Foydalanuvchi")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col space-y-4 bg-background">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 px-4 min-h-[200px]">
            <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center mb-4 shrink-0">
              <Dumbbell className="h-8 w-8 text-brand animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">{t("askAnything", lang)}</h3>
            <p className="text-sm text-text-muted max-w-[250px]">
              {lang === "ru" 
                ? "Я ваш умный фитнес-тренер. Отвечу на любые вопросы по тренировкам, питанию и здоровому образу жизни. Также можете отправить фото!"
                : lang === "en"
                  ? "I am your AI fitness coach. Ask me anything about workouts, nutrition, or healthy lifestyle. You can also send photos!"
                  : "Men sizning aqlli fitnes murabbiyingizman. Mashg'ulotlar, ovqatlanish yoki sog'lom turmush tarzi bo'yicha savollaringizga javob beraman. Rasm ham yuborishingiz mumkin!"}
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className="max-w-[85%] flex flex-col gap-1">
              <div
                className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-soft whitespace-pre-wrap ${
                  m.role === "user"
                    ? "gradient-primary text-white rounded-br-none"
                    : "bg-surface border border-border text-text-primary rounded-bl-none"
                }`}
              >
                {m.imageUrl && (
                  <img src={m.imageUrl} alt={lang === "ru" ? "Прикрепленное изображение" : lang === "en" ? "Attached image" : "Biriktirilgan rasm"} className="max-w-full rounded-lg mb-2 border border-white/20" />
                )}
                {m.text}
              </div>
              <span className={`text-[9px] text-text-muted px-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="rounded-2xl px-4 py-3 bg-surface border border-border text-xs text-text-muted rounded-bl-none flex items-center gap-1.5 shadow-soft">
              <span>{t("analyzing", lang)}</span>
              <span className="inline-flex gap-0.5">
                <span className="h-1 w-1 rounded-full bg-text-muted animate-bounce" />
                <span className="h-1 w-1 rounded-full bg-text-muted animate-bounce [animation-delay:0.2s]" />
                <span className="h-1 w-1 rounded-full bg-text-muted animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="bg-surface border-t border-border p-3 pb-[calc(12px+env(safe-area-inset-bottom))] shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
        {previewUrl && (
          <div className="mb-3 relative inline-block">
            <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-border shadow-sm" />
            <button onClick={clearImage} className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 border border-border rounded-full p-1 text-text-muted shadow-soft hover:text-destructive transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-secondary-bg rounded-2xl border border-input px-2 py-2 focus-within:border-brand transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-text-muted hover:text-brand rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-colors shrink-0"
            title={lang === "ru" ? "Загрузить фото" : lang === "en" ? "Upload image" : "Rasm yuklash"}
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("typePlaceholder", lang)}
            className="flex-1 max-h-[120px] min-h-[24px] bg-transparent resize-none py-2 text-[14px] text-text-primary outline-none"
            rows={1}
          />
          
          {thinking ? (
            <button 
              onClick={stopGeneration} 
              className="grid h-10 w-10 place-items-center rounded-xl shrink-0 transition-all bg-destructive text-white shadow-button hover:opacity-95 active:scale-95"
              title={lang === "ru" ? "Остановить генерацию" : lang === "en" ? "Stop generation" : "Javobni to'xtatish"}
            >
              <Square className="h-4.5 w-4.5 fill-current" />
            </button>
          ) : (
            <button 
              onClick={send} 
              disabled={(!input.trim() && !selectedImage) || thinking}
              className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 transition-all ${(!input.trim() && !selectedImage) || thinking ? 'bg-text-muted/20 text-text-muted cursor-not-allowed' : 'gradient-primary text-white shadow-button hover:opacity-95 active:scale-95'}`}
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {deletingSessionId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setDeletingSessionId(null)} />
          
          <div className="relative w-full max-w-[320px] bg-surface border border-border rounded-2xl p-5 shadow-2xl animate-scale-in text-center z-10">
            <div className="h-12 w-12 rounded-full bg-destructive/15 border border-destructive/30 text-destructive grid place-items-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-text-primary mb-1">
              {lang === "ru" ? "Удалить чат?" : lang === "en" ? "Delete chat?" : "Suhbatni o'chirishni tasdiqlaysizmi?"}
            </h3>

            <p className="text-xs text-text-muted mb-5 leading-relaxed">
              {lang === "ru" 
                ? "Этот чат будет удален из вашего списка. Действие нельзя отменить." 
                : lang === "en"
                  ? "This chat will be removed from your list. This action cannot be undone."
                  : "Ushbu suhbat ilovadagi ro'yxatingizdan olib tashlanadi."}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeletingSessionId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border bg-secondary-bg hover:bg-border text-text-primary text-xs font-semibold transition-colors"
              >
                {lang === "ru" ? "Отмена" : lang === "en" ? "Cancel" : "Bekor qilish"}
              </button>

              <button
                onClick={confirmDeleteSession}
                className="flex-1 py-2.5 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold shadow-button transition-colors"
              >
                {lang === "ru" ? "Удалить" : lang === "en" ? "Delete" : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
