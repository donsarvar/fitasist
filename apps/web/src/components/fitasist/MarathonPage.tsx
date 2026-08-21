import { useMemo, useState } from "react";
import {
  MapPin,
  CalendarDots,
  Timer,
  ArrowSquareOut,
  MagnifyingGlass,
  Funnel,
  Medal,
  CheckCircle,
} from "@phosphor-icons/react";

// ─── Marathon Data ───────────────────────────────────────────────────────────

export interface Marathon {
  id: string;
  name: string;
  nameUz: string;
  nameRu?: string;
  city: string;
  country: string;
  flag: string;
  date: string; // ISO YYYY-MM-DD
  distances: string[];
  registrationUrl: string;
  website: string;
  region: "uzbekistan" | "asia" | "europe" | "americas" | "middleeast";
  highlight?: boolean;
}

export const MARATHONS: Marathon[] = [
  {
    id: "zaamin-ultra-2026",
    name: "Zaamin Ultra",
    nameUz: "Zomin Ultra Tog' Marafoni",
    nameRu: "Горный ультрамарафон Заамин",
    city: "Zaamin",
    country: "O'zbekiston",
    flag: "🇺🇿",
    date: "2026-09-06",
    distances: ["10K", "21K", "50K"],
    registrationUrl: "https://samarkandmarathon.uz/zaamin",
    website: "https://samarkandmarathon.uz",
    region: "uzbekistan",
    highlight: true,
  },
  {
    id: "almaty-2026",
    name: "Almaty Marathon",
    nameUz: "Olmaota Marafoni",
    nameRu: "Алматинский Марафон",
    city: "Almaty",
    country: "Qozog'iston",
    flag: "🇰🇿",
    date: "2026-09-20",
    distances: ["5K", "10K", "21K", "42K"],
    registrationUrl: "https://almaty-marathon.kz",
    website: "https://almaty-marathon.kz",
    region: "asia",
  },
  {
    id: "berlin-2026",
    name: "Berlin Marathon",
    nameUz: "Berlin Marafoni",
    nameRu: "Берлинский Марафон",
    city: "Berlin",
    country: "Germaniya",
    flag: "🇩🇪",
    date: "2026-09-27",
    distances: ["42K"],
    registrationUrl: "https://bmw-berlin-marathon.com",
    website: "https://bmw-berlin-marathon.com",
    region: "europe",
  },
  {
    id: "tashkent-2026",
    name: "Tashkent International Marathon",
    nameUz: "Toshkent Xalqaro Marafoni",
    nameRu: "Ташкентский Международный Марафон",
    city: "Tashkent",
    country: "O'zbekiston",
    flag: "🇺🇿",
    date: "2026-10-12",
    distances: ["3K", "10K", "21K", "42K"],
    registrationUrl: "https://tashkentmarathon.uz",
    website: "https://tashkentmarathon.uz",
    region: "uzbekistan",
    highlight: true,
  },
  {
    id: "chicago-2026",
    name: "Chicago Marathon",
    nameUz: "Chikago Marafoni",
    nameRu: "Чикагский Марафон",
    city: "Chicago",
    country: "AQSH",
    flag: "🇺🇸",
    date: "2026-10-11",
    distances: ["42K"],
    registrationUrl: "https://chicagomarathon.com",
    website: "https://chicagomarathon.com",
    region: "americas",
  },
  {
    id: "samarkand-2026",
    name: "Samarkand Marathon",
    nameUz: "Samarqand Marafoni",
    nameRu: "Самаркандский Марафон",
    city: "Samarkand",
    country: "O'zbekiston",
    flag: "🇺🇿",
    date: "2026-11-01",
    distances: ["2K", "5K", "10K", "21K", "42K"],
    registrationUrl: "https://samarkandmarathon.uz",
    website: "https://samarkandmarathon.uz",
    region: "uzbekistan",
    highlight: true,
  },
  {
    id: "nyc-2026",
    name: "New York City Marathon",
    nameUz: "Nyu-York Marafoni",
    nameRu: "Нью-Йоркский Марафон",
    city: "New York",
    country: "AQSH",
    flag: "🇺🇸",
    date: "2026-11-01",
    distances: ["42K"],
    registrationUrl: "https://nyrr.org/tcsnycmarathon",
    website: "https://nyrr.org/tcsnycmarathon",
    region: "americas",
  },
  {
    id: "abudhabi-2026",
    name: "Abu Dhabi Marathon",
    nameUz: "Abu-Dabi Marafoni",
    nameRu: "Марафон Абу-Даби",
    city: "Abu Dhabi",
    country: "BAA",
    flag: "🇦🇪",
    date: "2026-12-05",
    distances: ["10K", "21K", "42K"],
    registrationUrl: "https://abudhabimarathon.com",
    website: "https://abudhabimarathon.com",
    region: "middleeast",
  },
  {
    id: "singapore-2026",
    name: "Singapore Marathon",
    nameUz: "Singapur Marafoni",
    nameRu: "Сингапурский Марафон",
    city: "Singapore",
    country: "Singapur",
    flag: "🇸🇬",
    date: "2026-12-06",
    distances: ["5K", "10K", "21K", "42K"],
    registrationUrl: "https://marathonsingapore.com",
    website: "https://marathonsingapore.com",
    region: "asia",
  },
  {
    id: "tokyo-2027",
    name: "Tokyo Marathon",
    nameUz: "Tokio Marafoni",
    nameRu: "Токийский Марафон",
    city: "Tokyo",
    country: "Yaponiya",
    flag: "🇯🇵",
    date: "2027-03-07",
    distances: ["42K"],
    registrationUrl: "https://marathon.tokyo",
    website: "https://marathon.tokyo",
    region: "asia",
  },
  {
    id: "london-2027",
    name: "London Marathon",
    nameUz: "London Marafoni",
    nameRu: "Лондонский Марафон",
    city: "London",
    country: "Buyuk Britaniya",
    flag: "🇬🇧",
    date: "2027-04-26",
    distances: ["42K"],
    registrationUrl: "https://londonmarathon.co.uk",
    website: "https://londonmarathon.co.uk",
    region: "europe",
  }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDaysLeft(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUserUserRegion(lang?: string): "uzbekistan" | "asia" | "europe" | "americas" | "middleeast" {
  // If user interface language is Uzbek, prioritize Uzbekistan marathons
  if (lang === "uz" || !lang) {
    return "uzbekistan";
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Tashkent") || tz.includes("Samarkand") || tz.includes("Asia/Tashkent")) {
      return "uzbekistan";
    }
    if (tz.startsWith("Asia/")) {
      if (tz.includes("Dubai") || tz.includes("Riyadh") || tz.includes("Qatar")) return "middleeast";
      return "asia";
    }
    if (tz.startsWith("Europe/")) return "europe";
    if (tz.startsWith("America/")) return "americas";
  } catch {}
  return "uzbekistan";
}

export function getNearestRegionalMarathon(lang?: string): Marathon | null {
  const userRegion = getUserUserRegion(lang);
  const upcoming = MARATHONS.filter((m) => getDaysLeft(m.date) > 0);

  // 1. If user is in Uzbekistan or language is Uzbek -> strictly pick Uzbekistan marathon first
  if (userRegion === "uzbekistan" || lang === "uz" || !lang) {
    const uzbUpcoming = upcoming.filter((m) => m.region === "uzbekistan").sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (uzbUpcoming.length > 0) return uzbUpcoming[0];
  }

  // 2. Otherwise match user's region
  const inUserRegion = upcoming.filter((m) => m.region === userRegion).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (inUserRegion.length > 0) return inUserRegion[0];

  // 3. Global nearest
  const sorted = upcoming.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return sorted[0] ?? null;
}

export function getNextMarathon(lang?: string): Marathon | null {
  return getNearestRegionalMarathon(lang);
}

function formatDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

// ─── Region filter options ────────────────────────────────────────────────────
type Region = "all" | "uzbekistan" | "asia" | "europe" | "americas" | "middleeast";

const REGIONS: { value: Region; label: { uz: string; ru: string; en: string } }[] = [
  { value: "all", label: { uz: "Barchasi", ru: "Все", en: "All" } },
  { value: "uzbekistan", label: { uz: "O'zbekiston 🇺🇿", ru: "Узбекистан 🇺🇿", en: "Uzbekistan 🇺🇿" } },
  { value: "asia", label: { uz: "Osiyo", ru: "Азия", en: "Asia" } },
  { value: "europe", label: { uz: "Yevropa", ru: "Европа", en: "Europe" } },
  { value: "americas", label: { uz: "Amerika", ru: "Америка", en: "Americas" } },
  { value: "middleeast", label: { uz: "Yaqin Sharq", ru: "Ближний Восток", en: "Middle East" } },
];

// ─── Marathon Card ────────────────────────────────────────────────────────────
function MarathonItemCard({ m, lang }: { m: Marathon; lang: string }) {
  const daysLeft = getDaysLeft(m.date);
  const isPast = daysLeft <= 0;

  const daysLabel =
    lang === "ru"
      ? isPast ? "Завершён" : `${daysLeft} дней`
      : lang === "en"
      ? isPast ? "Completed" : `${daysLeft} days`
      : isPast ? "Tugagan" : `${daysLeft} kun`;

  const registerLabel =
    lang === "ru" ? "Регистрация" : lang === "en" ? "Register" : "Ro'yxatdan o'tish";
  const daysLeftText =
    lang === "ru" ? "до старта" : lang === "en" ? "to start" : "qoldi";

  const name =
    lang === "ru" ? (m.nameRu || m.nameUz || m.name) :
    lang === "en" ? m.name :
    (m.nameUz || m.name);

  return (
    <div
      className={`rounded-3xl border p-5 transition-all shadow-soft relative overflow-hidden ${
        m.highlight
          ? "bg-gradient-to-br from-brand/10 via-surface to-brand/5 border-brand/40 shadow-glow"
          : "bg-surface border-border dark:border-border/10"
      }`}
    >
      {m.highlight && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-brand text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
          <Medal size={11} weight="fill" />
          <span>{lang === "ru" ? "Топ" : lang === "en" ? "Top" : "Tavsiya"}</span>
        </div>
      )}

      <div className="flex items-start gap-3.5">
        <div className="text-3xl select-none shrink-0 mt-0.5">{m.flag}</div>
        <div className="flex-1 min-w-0 pr-12">
          <h3 className="font-bold text-text-primary text-base leading-snug truncate">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
            <MapPin size={13} weight="fill" className="text-brand shrink-0" />
            <span>{m.city}, {m.country}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 bg-secondary-bg/60 dark:bg-white/5 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <CalendarDots size={16} weight="bold" className="text-brand shrink-0" />
          <div>
            <div className="text-[10px] text-text-muted">{lang === "ru" ? "Дата" : lang === "en" ? "Date" : "Sana"}</div>
            <div className="text-xs font-semibold text-text-primary leading-tight">{formatDate(m.date, lang)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Timer size={16} weight="bold" className="text-brand shrink-0" />
          <div>
            <div className="text-[10px] text-text-muted">{daysLeftText}</div>
            <div className={`text-xs font-bold leading-tight ${daysLeft <= 30 ? "text-amber-500" : "text-text-primary"}`}>
              {daysLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {m.distances.map((d) => (
          <span key={d} className="px-2 py-0.5 rounded-lg bg-brand/10 text-brand text-[11px] font-bold">
            {d}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={m.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-10 rounded-xl gradient-primary text-white text-xs font-bold shadow-button flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <span>{registerLabel}</span>
          <ArrowSquareOut size={13} weight="bold" />
        </a>
        <a
          href={m.website}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-3 rounded-xl bg-secondary-bg hover:bg-border text-text-secondary text-xs font-bold flex items-center justify-center gap-1 border border-border transition-all active:scale-95"
          title="Rasmiy vebsayt"
        >
          <ArrowSquareOut size={14} weight="bold" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Marathon Page Component ─────────────────────────────────────────────
import type { Language } from "@/lib/fitasist/types";

export function MarathonPage({ lang = "uz" }: { lang?: Language | string }) {
  const l = (lang === "ru" ? "ru" : lang === "en" ? "en" : "uz") as "uz" | "ru" | "en";
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region>("all");
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);

  const filtered = useMemo(() => {
    return MARATHONS.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.nameUz.toLowerCase().includes(search.toLowerCase()) ||
        (m.nameRu && m.nameRu.toLowerCase().includes(search.toLowerCase())) ||
        m.city.toLowerCase().includes(search.toLowerCase()) ||
        m.country.toLowerCase().includes(search.toLowerCase());

      const matchRegion = selectedRegion === "all" || m.region === selectedRegion;
      const matchUpcoming = !onlyUpcoming || getDaysLeft(m.date) > 0;

      return matchSearch && matchRegion && matchUpcoming;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [search, selectedRegion, onlyUpcoming]);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <div className="pt-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand">Dunyo Marafonlari</span>
        <h1 className="text-[26px] font-black text-text-primary leading-tight mt-0.5">Xalqaro Marafonlar</h1>
        <p className="text-xs text-text-muted mt-1">O'zingizga mos masofani tanlang va ro'yxatdan o'ting</p>
      </div>

      <div className="relative">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Marafon yoki shahar qidirish..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-surface border border-border dark:border-border/10 text-text-primary text-xs outline-none focus:border-brand shadow-soft"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {REGIONS.map((r) => (
          <button
            key={r.value}
            onClick={() => setSelectedRegion(r.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
              selectedRegion === r.value
                ? "gradient-primary text-white border-transparent shadow-soft"
                : "bg-surface border-border dark:border-border/10 text-text-secondary hover:text-text-primary"
            }`}
          >
            {r.label[l] || r.label.uz}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>Jami: <b>{filtered.length}</b> ta marafon</span>
        <button
          onClick={() => setOnlyUpcoming(!onlyUpcoming)}
          className={`flex items-center gap-1 font-semibold text-[11px] transition-colors ${
            onlyUpcoming ? "text-brand" : "text-text-muted"
          }`}
        >
          <CheckCircle size={14} weight={onlyUpcoming ? "fill" : "regular"} />
          <span>Faqat bo'lajaklar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-surface border border-border text-text-muted text-xs">
            Hech qanday marafon topilmadi. Qidiruvni o'zgartiring.
          </div>
        ) : (
          filtered.map((m) => (
            <MarathonItemCard key={m.id} m={m} lang={lang} />
          ))
        )}
      </div>
    </div>
  );
}
