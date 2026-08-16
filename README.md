# 🏋️‍♂️ FitAsist Platform (Full-Stack Monorepo)

FitAsist — Sun'iy intellekt (AI) asosidagi fitnes yordamchisi va murabbiyi platformasi.

---

## 📁 Loyiha Tuzilishi (Monorepo Architecture)

```text
fitasist/
├── 📱 apps/
│   ├── web/          # Asosiy Web va Capacitor (Android/iOS) platformasi
│   └── mobile/       # Mobil yo'naltirilgan TanStack Start interfeysi
├── ⚙️ services/
│   └── backend/      # AI Coach uchun Render Node.js Express proxy serveri
├── 📄 package.json   # NPM Workspaces va umumiy buyruqlar
└── 📄 README.md      # Loyiha qo'llanmasi
```

---

## 🚀 Ishga tushirish (Getting Started)

### 1. Barcha paketlarni o'rnatish:
```bash
npm install
```

### 2. Loyiha qismlarini alohida ishga tushirish:
* **Asosiy Web ilovani ishga tushirish:**
  ```bash
  npm run dev:web
  ```
* **Mobil interfeysni ishga tushirish:**
  ```bash
  npm run dev:mobile
  ```
* **Backend serverni ishga tushirish:**
  ```bash
  npm run dev:backend
  ```

---

## 🛠 Texnologiyalar
* **Frontend (Web):** React, Vite, TailwindCSS, Radix UI, Capacitor
* **Mobile (TanStack):** React, Vite, TanStack Start
* **Backend:** Node.js, Express, TypeScript
* **Database & Cloud:** Firebase (`fitasist-428cc`), Firestore
