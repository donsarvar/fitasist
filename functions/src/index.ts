import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get(["/health", "/api/health"], (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "FitAsist Firebase Cloud Functions",
    timestamp: new Date().toISOString()
  });
});

// Fallback Helper for Kimi / OpenRouter
async function callKimiFallback(geminiMessages: any[], systemPrompt?: string) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    throw new Error("OpenRouter API Key serverda sozlanmagan.");
  }

  const openAiMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt || "Siz aqlli fitness murabbiysiz." }
  ];

  for (const m of geminiMessages) {
    const textPart = m.parts?.map((p: any) => p.text).filter(Boolean).join("\n") || "";
    openAiMessages.push({
      role: m.role === "model" ? "assistant" : "user",
      content: textPart
    });
  }

  const endpoint = process.env.KIMI_API_ENDPOINT || "https://openrouter.ai/api/v1/chat/completions";
  const modelName = process.env.KIMI_MODEL_NAME || "moonshotai/kimi-k3";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${openRouterKey}`,
    "HTTP-Referer": "https://fitasist-428cc.web.app",
    "X-Title": "FitAsist AI Coach"
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: modelName,
      messages: openAiMessages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const fallbackResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: openAiMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!fallbackResp.ok) {
      const fallbackErr = await fallbackResp.text();
      throw new Error(`OpenRouter Fallback Error (${response.status}): ${errText} | ${fallbackErr}`);
    }

    const fallbackResult: any = await fallbackResp.json();
    const fallbackReply = fallbackResult.choices?.[0]?.message?.content || "";
    return {
      candidates: [
        {
          content: { parts: [{ text: fallbackReply }], role: "model" },
          finishReason: "STOP"
        }
      ],
      provider: "openrouter-auto"
    };
  }

  const result: any = await response.json();
  const replyText = result.choices?.[0]?.message?.content || "";

  return {
    candidates: [
      {
        content: { parts: [{ text: replyText }], role: "model" },
        finishReason: "STOP"
      }
    ],
    provider: "kimi-k3"
  };
}

// AI Chat proxy endpoint with Multi-AI Fallback
app.post(["/api/chat", "/chat"], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Yuborilgan xabarlar noto'g'ri formatda." });
      return;
    }

    const customKey = req.headers["x-gemini-key"] as string;
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    let geminiSuccess = false;
    let geminiData: any = null;
    let geminiErrorText = "";

    // 1. Primary Attempt: Google Gemini API
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt || "Siz aqlli fitness murabbiysiz." }]
            },
            contents: messages,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192
            },
          }),
        });

        if (geminiResponse.ok) {
          geminiData = await geminiResponse.json();
          geminiData.provider = "gemini";
          geminiSuccess = true;
        } else {
          geminiErrorText = await geminiResponse.text();
          console.warn("Primary Gemini API failed, switching to Fallback Kimi AI...", geminiErrorText);
        }
      } catch (err: any) {
        console.warn("Primary Gemini fetch exception, switching to Fallback Kimi AI...", err?.message);
        geminiErrorText = err?.message || "Gemini connection failed";
      }
    }

    if (geminiSuccess && geminiData) {
      res.json(geminiData);
      return;
    }

    // 2. Secondary Attempt: Kimi / Moonshot AI Fallback
    try {
      console.log("Executing Kimi AI Fallback request...");
      const kimiData = await callKimiFallback(messages, systemPrompt);
      res.json(kimiData);
      return;
    } catch (kimiErr: any) {
      console.error("Both Primary Gemini & Fallback Kimi AI failed:", kimiErr?.message);
      res.status(502).json({
        error: "Barcha AI xizmatlarida vaqtinchalik ulanish xatoligi yuz berdi. Iltimos qayta urining.",
        geminiDetails: geminiErrorText,
        kimiDetails: kimiErr?.message
      });
    }
  } catch (error: any) {
    next(error);
  }
});

// Telegram Admin Notification endpoint
app.post(["/api/notify-admin", "/notify-admin"], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, user, text } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      res.status(500).json({ error: "Telegram Bot ma'lumotlari serverda sozlanmagan." });
      return;
    }

    let messageText = "";

    if (type === "new_user" && user) {
      const genderUz = user.gender === "male" ? "Erkak 👨" : user.gender === "female" ? "Ayol 👩" : "Kiritilmagan";
      const bodyTypeUz = user.bodyType === "skinny" ? "Ozg'in" : user.bodyType === "bulk" ? "Semiz" : "O'rtacha";
      const activityUz = user.activity === "athlete" ? "Sportchi 🏃‍♂️" : user.activity === "active" ? "Faol 💪" : "Kam harakat 🛋️";

      messageText = `🎉 <b>Yangi foydalanuvchi ro'yxatdan o'tdi!</b>\n\n` +
        `👤 <b>F.I.O:</b> ${user.fio || "Kiritilmagan"}\n` +
        `📧 <b>Email:</b> ${user.email || "Google Auth / Email"}\n` +
        `⚧ <b>Jinsi:</b> ${genderUz}\n` +
        `🎂 <b>Tug'ilgan yili:</b> ${user.birthYear || "Noma'lum"}\n` +
        `📏 <b>Bo'yi / Vazni:</b> ${user.height ? user.height + " sm" : "Kiritilmagan"} / ${user.weight ? user.weight + " kg" : "Kiritilmagan"}\n` +
        `🧬 <b>Tana turi:</b> ${bodyTypeUz}\n` +
        `⚡ <b>Faolligi:</b> ${activityUz}\n\n` +
        `📅 <i>Sana: ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</i>`;
    } else {
      messageText = text || "📱 FitAsist yangi bildirishnomasi.";
    }

    const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const tgRes = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML"
      })
    });

    if (!tgRes.ok) {
      const tgErr = await tgRes.text();
      console.error("Telegram API Error:", tgErr);
      res.status(tgRes.status).json({ error: "Telegram'ga xabar yuborishda xatolik.", details: tgErr });
      return;
    }

    res.json({ success: true, message: "Bildirishnoma Telegram'ga yuborildi." });
  } catch (error: any) {
    next(error);
  }
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Serverda kutilmagan xatolik yuz berdi.",
    message: err.message
  });
});

// Export Cloud Function (v2 with CORS support and 60s timeout)
export const api = onRequest(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 60,
    region: "us-central1"
  },
  app
);
