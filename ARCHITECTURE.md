# 🏛 FitAsist — Qat'iy Arxitektura va Dasturlash Qoidalari (Architecture Codex)

> **MAJBURIY TALAB:** Har qanday AI agent yoki dasturchi ushbu loyihada kod yozishdan oldin quyidagi qoidalarga 100% so'zsiz rioya qilishi shart. Ushbu qoidalarni buzish taqiqlanadi!

---

## 1. 📂 Papkalar Strukturasi va Joylashuv Qoidasi (Folder Boundaries)

Kod hech qachon tasodifiy joyga yozilmaydi. Har bir o'zgarish o'zining qat'iy manziliga ega:

| Vazifa turi | Qayerga yoziladi? | Qayerga yozish TAQIQLANADI? |
|---|---|---|
| **Dashboard UI widgetlari** | `apps/web/src/components/fitasist/Dashboard/` | `AppShell.tsx` yoki `DashboardTab.tsx` ichiga to'g'ridan-to'g'ri tiqish |
| **Yangi sahifalar / Tablar** | `apps/web/src/components/fitasist/tabs/` | `AppShell.tsx` ichiga |
| **Umumiy UI komponentlar** (Tugma, Modal, Card) | `apps/web/src/components/fitasist/common/` | Har bir sahifaning ichida qayta-qayta nusxalash |
| **Biznes mantiq / Hisob-kitoblar** | `apps/web/src/hooks/` | UI komponentlarning `return (...)` qismidan oldiga yoyib yuborish |
| **AI va Server so'rovlari** | `apps/web/src/lib/fitasist/aiService.ts` yoki `services/backend/` | Komponent ichida to'g'ridan-to'g'ri `fetch` qilish |

---

## 2. 📏 Fayl Hajmi Cheklovi (Max Line Limit)

* **Hech qaysi komponent fayli 250 qatordan oshmasligi shart.**
* Agar fayl 200 qatorga yaqinlashsa, undagi sub-komponentlar (kartalar, qatorlar, modallar) alohida faylga ajratilishi shart (`Single Responsibility Principle`).
* `AppShell.tsx` faqat **Layout va Router** vazifasini bajaradi (Maksimal hajm: ~200 qator).

---

## 3. 🎨 Dizayn va Ikonlar Standarti (Design Consistency)

* **Yagona Ikon Kutubxonasi:** Loyihada faqat va faqat **`@phosphor-icons/react`** ishlatiladi. `lucide-react`, `react-icons` yoki boshqa kutubxonalarni import qilish **qat'iyan man etiladi**.
* **Apple SF Style:** Ikonlar vaznida `weight="fill"` (faol holat uchun) va `weight="regular"` yoki `weight="bold"` (no-faol holat uchun) ishlatiladi.
* **Tailwind & Design Tokens:** Ranglar `styles.css` dagi CSS o'zgaruvchilar orqali olinadi (`brand`, `surface`, `secondary-bg`, `text-primary`, `text-muted`).

---

## 4. ⚡️ Samaradorlik va Kod Sifati (Performance & Senior Standards)

* **`React.memo`:** Barcha Dashboard widgetlari va qayta render bo'lishi qimmat bo'lgan kartalar `React.memo` bilan o'ralishi shart.
* **`useCallback` & `useMemo`:** Custom hooklar va hisob-kitob funksiyalari har safar yangitdan xotirada yaratilmasligi uchun memoizatsiya qilinishi shart.
* **TypeScript Xavfsizligi:** `any` ishlatish taqiqlanadi. Har bir komponent uchun aniq `interface Props` yozilishi shart.
* **Har bir o'zgarishdan keyin tekshiruv:** Kod yozilgach, darhol `tsc --noEmit` bilan tekshirilib, **0 ta xatolik** kafolatlanishi shart.

---

## 5. 🛠 Monorepo va Backend Xavfsizligi

* **API Kalitlar:** Gemini API va boshqa maxfiy kalitlar **hech qachon frontendga qo'yilmaydi**. Ular faqat `services/backend/` orqali proksilanadi.
* **Firebase:** Offline kesh va doimiy saqlash (`indexedDBLocalPersistence`) buzilmasligi shart.
