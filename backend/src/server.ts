import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

// Security and compression middleware (allow cross-origin for SPA)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

// CORS configuration allowing all authorized domains
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-gemini-key"]
}));

// Body parsing middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Rate limit: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: "Haddan tashqari ko'p so'rov yuborildi. Iltimos 15 daqiqadan so'ng qayta urining." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);

// Health check endpoint (for silent ping)
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Helper function to call Fallback AI via OpenRouter API / Moonshot Kimi API
async function callKimiFallback(geminiMessages: any[], systemPrompt: string): Promise<any> {
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.KIMI_API_KEY || "";
  
  // Convert Gemini messages to OpenAI / OpenRouter format
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
    // Try fallback to auto router if specific model name errored
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

    const fallbackResult = await fallbackResp.json();
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

  const result = await response.json();
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
app.post("/api/chat", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Yuborilgan xabarlar noto'g'ri formatda." });
      return;
    }

    const customKey = req.headers["x-gemini-key"] as string;
    const apiKey = customKey || process.env.GEMINI_API_KEY || "";

    let geminiSuccess = false;
    let geminiData: any = null;
    let geminiErrorText = "";

    // 1. Primary Attempt: Google Gemini API
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
app.post("/api/notify-admin", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, user, text } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8651108645:AAEpPM1G-6J17tSB7QnpobYepuEJTd6Oy8E";
    const chatId = process.env.TELEGRAM_CHAT_ID || "922839560";

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

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Serverda kutilmagan xatolik yuz berdi.",
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FitAsist backend server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});
