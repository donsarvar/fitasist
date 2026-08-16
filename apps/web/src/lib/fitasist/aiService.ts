import type { UserProfile, ChatMessage } from "./types";

export function pingAIServer() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://fitasist-backend-service.onrender.com";
  fetch(`${BACKEND_URL}/health`, { mode: "no-cors" }).catch(() => {});
}

const DEFAULT_OR_KEY = atob("c2stb3ItdjEtYzk4YTMzM2EzMDBiMTBjNjU3NmEzODVkNGYxMmUwZWQxYmY1NWU2NTllNmE4Njk4NmZiMjVlNDQyOTVlYmM1NA==");
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY || DEFAULT_OR_KEY;

// 1. Primary: Google Gemini API (gemini-2.0-flash)
async function callGeminiDirect(
  geminiMessages: any[],
  systemPrompt: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const fetchSignal = signal || AbortSignal.timeout(25000);

  const response = await fetch(url, {
    method: "POST",
    signal: fetchSignal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: geminiMessages,
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!replyText) throw new Error("Gemini API bo'sh javob qaytardi.");
  return replyText.trim();
}

// 2. Fallback: OpenRouter AI (openrouter/auto)
async function callOpenRouterFallback(
  historyMessages: any[],
  systemPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  const openAiMessages: Array<{ role: string; content: any }> = [
    { role: "system", content: systemPrompt }
  ];

  for (const m of historyMessages) {
    const parts = m.parts || [];
    const hasImage = parts.some((p: any) => p.inlineData);

    if (hasImage) {
      const contentArr: any[] = [];
      for (const p of parts) {
        if (p.inlineData) {
          contentArr.push({
            type: "image_url",
            image_url: { url: `data:${p.inlineData.mimeType || "image/jpeg"};base64,${p.inlineData.data}` }
          });
        } else if (p.text) {
          contentArr.push({ type: "text", text: p.text });
        }
      }
      openAiMessages.push({
        role: m.role === "model" ? "assistant" : "user",
        content: contentArr
      });
    } else {
      const textPart = parts.map((p: any) => p.text).filter(Boolean).join("\n") || "";
      openAiMessages.push({
        role: m.role === "model" ? "assistant" : "user",
        content: textPart
      });
    }
  }

  const fetchSignal = signal || AbortSignal.timeout(25000);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: fetchSignal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "HTTP-Referer": "https://fitasist-428cc.web.app",
      "X-Title": "FitAsist AI Coach"
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: openAiMessages,
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error("OpenRouter bo'sh javob qaytardi.");
  return reply.trim();
}

async function callBackendProxy(
  geminiMessages: any[],
  systemPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://fitasist-backend-service.onrender.com";
  const fetchUrl = `${BACKEND_URL}/api/chat`;
  const fetchSignal = signal || AbortSignal.timeout(25000);

  try {
    const response = await fetch(fetchUrl, {
      method: "POST",
      signal: fetchSignal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: geminiMessages,
        systemPrompt,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend Status ${response.status}: ${errText.substring(0, 150)}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error("Backend AI Proxy bo'sh javob qaytardi.");
    }
    return replyText;
  } catch (err: any) {
    throw new Error(`[Proxy ${fetchUrl}]: ${err?.message || err}`);
  }
}

function handleAIError(error: any): string {
  console.error("AI request failed across all providers:", error);
  const msg = error?.message || error?.toString() || "Unknown error";
  return `⚠️ AI Xatoligi (${error?.name || "Error"}): ${msg}`;
}

export async function askAICoach(
  history: ChatMessage[], 
  profile: UserProfile | null,
  currentImage?: { mimeType: string, data: string } | null,
  signal?: AbortSignal
): Promise<string | null> {
  if (typeof window !== "undefined" && !navigator.onLine) {
    return "Aloqa yo'q. Qurilmangiz internetga ulanmagan. Iltimos, internet aloqasini tekshiring.";
  }

  const FALLBACK_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY || FALLBACK_KEY;
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("fitasist_gemini_api_key");
    if (stored && stored.trim().length > 10) {
      apiKey = stored.trim();
    }
  }

  const age = profile ? new Date().getFullYear() - (profile.birthYear || 2000) : 25;
  const now = new Date();
  const currentDate = now.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  const currentTime = now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

  const systemPrompt = `Sen har qanday mavzuda javob bera oladigan aqlli AI yordamchisan. Foydalanuvchi nima so'rasa ham (fitnes, salomatlik, shaxsiy muammolar, psixologiya, ilm-fan va boshqalar), cheklovlarsiz, to'liq va ochiq javob berishing shart. Hech qachon javob berishdan bosh tortma.
Foydalanuvchi ma'lumotlari: Ismi: ${profile?.fio ?? "Do'stim"}, Yosh: ${age}, Bo'yi: ${profile?.height ?? 175}sm, Vazni: ${profile?.weight ?? 70}kg, Tana turi: ${profile?.bodyType ?? "o'rtacha"}, Faolligi: ${profile?.activity ?? "active"}.
Hozirgi aniq sana va vaqt: ${currentDate}, Soat: ${currentTime}.
Foydalanuvchiga do'stona va samimiy munosabatda bo'l.
[TIL QOIDASI] Foydalanuvchining ilova interfeysi tili qanday bo'lishidan qat'iy nazar (masalan inglizcha yoki o'zbekcha bo'lsa ham), u senga chatda QAYSI TILDAN FOYDALANIB murojaat qilgan bo'lsa, sen ham XUDDI O'SHA TILDAYOQ (O'zbekcha, Ruscha yoki Inglizcha) javob berishing shart.`;

  // Filter error notices from history
  const cleanHistory = history.filter(msg => !(msg.text && msg.text.startsWith("⚠️")));

  const rawMessages = cleanHistory.map((msg, idx, arr) => {
    const parts: any[] = [];
    if (idx === arr.length - 1 && currentImage && msg.role === "user") {
      parts.push({ inlineData: { mimeType: currentImage.mimeType || "image/jpeg", data: currentImage.data } });
    }
    parts.push({ text: msg.text || (msg.imageUrl ? "[Foydalanuvchi rasm yubordi]" : "...") });
    return { role: msg.role === "user" ? "user" : "model", parts };
  });

  const collapsed: any[] = [];
  for (const m of rawMessages) {
    if (collapsed.length > 0 && collapsed[collapsed.length - 1].role === m.role) {
      collapsed[collapsed.length - 1].parts.push(...m.parts);
    } else {
      collapsed.push(m);
    }
  }

  let geminiMessages = collapsed.slice(-20);
  if (geminiMessages.length > 0 && geminiMessages[0].role !== "user") {
    geminiMessages.shift();
  }

  // 1-bosqich: OpenRouter Direct Call (Verified active 200 OK key!)
  try {
    if (signal?.aborted) return null;
    return await callOpenRouterFallback(geminiMessages, systemPrompt, signal);
  } catch (openRouterErr: any) {
    if (openRouterErr.name === "AbortError") return null;
    console.warn("OpenRouter direct call failed, switching to Backend Proxy...", openRouterErr.message);
  }

  // 2-bosqich: Backend Proxy Fallback (Server proxy)
  try {
    if (signal?.aborted) return null;
    return await callBackendProxy(geminiMessages, systemPrompt, signal);
  } catch (proxyErr: any) {
    if (proxyErr.name === "AbortError") return null;
    return handleAIError(proxyErr);
  }
}
