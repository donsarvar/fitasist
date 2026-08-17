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
  city: string;
  country: string;
  flag: string;
  date: string; // ISO YYYY-MM-DD
  distances: string[];
  registrationUrl: string;
  website: string;
  region: "asia" | "europe" | "americas" | "middleeast";
  highlight?: boolean; // Toshkent
}

export const MARATHONS: Marathon[] = [
  {
    id: "almaty-2026",
    name: "Almaty Marathon",
    nameUz: "Olmaota Marafoni",
    city: "Almaty",
    country: "Kazakhstan",
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
    city: "Berlin",
    country: "Germany",
    flag: "🇩🇪",
    date: "2026-09-27",
    distances: ["42K"],
    registrationUrl: "https://bmw-berlin-marathon.com",
    website: "https://bmw-berlin-marathon.com",
    region: "europe",
  },
  {
    id: "tashkent-2026",
    name: "Tashkent Marathon",
    nameUz: "Toshkent Marafoni",
    city: "Tashkent",
    country: "Uzbekistan",
    flag: "🇺🇿",
    date: "2026-10-12",
    distances: ["5K", "10K", "21K", "42K"],
    registrationUrl: "https://tashkentmarathon.uz",
    website: "https://tashkentmarathon.uz",
    region: "asia",
    highlight: true,
  },
  {
    id: "chicago-2026",
    name: "Chicago Marathon",
    nameUz: "Chikago Marafoni",
    city: "Chicago",
    country: "USA",
    flag: "🇺🇸",
    date: "2026-10-11",
    distances: ["42K"],
    registrationUrl: "https://chicagomarathon.com",
    website: "https://chicagomarathon.com",
    region: "americas",
  },
  {
    id: "nyc-2026",
    name: "New York City Marathon",
    nameUz: "Nyu-York Marafoni",
    city: "New York",
    country: "USA",
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
    city: "Abu Dhabi",
    country: "UAE",
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
    city: "Singapore",
    country: "Singapore",
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
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    date: "2027-03-07",
    distances: ["42K"],
    registrationUrl: "https://marathon.tokyo",
    website: "https://marathon.tokyo",
    region: "asia",
  },
  {
    id: "paris-2027",
    name: "Paris Marathon",
    nameUz: "Parij Marafoni",
    city: "Paris",
    country: "France",
    flag: "🇫🇷",
    date: "2027-04-04",
    distances: ["42K"],
    registrationUrl: "https://schneiderelectricparismarathon.com",
    website: "https://schneiderelectricparismarathon.com",
    region: "europe",
  },
  {
    id: "london-2027",
    name: "London Marathon",
    nameUz: "London Marafoni",
    city: "London",
    country: "UK",
    flag: "🇬🇧",
    date: "2027-04-26",
    distances: ["42K"],
    registrationUrl: "https://londonmarathon.co.uk",
    website: "https://londonmarathon.co.uk",
    region: "europe",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDaysLeft(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getNextMarathon(): Marathon | null {
  const upcoming = MARATHONS.filter((m) => getDaysLeft(m.date) > 0).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return upcoming[0] ?? null;
}

function formatDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

// ─── Region filter options ────────────────────────────────────────────────────
type Region = "all" | "asia" | "europe" | "americas" | "middleeast";

const REGIONS: { value: Region; label: { uz: string; ru: string; en: string } }[] = [
  { value: "all", label: { uz: "Barchasi", ru: "Все", en: "All" } },
  { value: "asia", label: { uz: "Osiyo", ru: "Азия", en: "Asia" } },
  { value: "europe", label: { uz: "Yevropa", ru: "Европа", en: "Europe" } },
  { value: "americas", label: { uz: "Amerika", ru: "Америка", en: "Americas" } },
  { value: "middleeast", label: { uz: "Yaqin Sharq", ru: "Ближний Восток", en: "Middle East" } },
];

// ─── Marathon Card ────────────────────────────────────────────────────────────
function MarathonCard({ m, lang }: { m: Marathon; lang: string }) {
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

  const distLabel = lang === "ru" ? "Дистанции" : lang === "en" ? "Distances" : "Masofalar";

  return (
    <div
      className={`relative rounded-3xl border p-4 transition-all ${
        m.highlight
          ? "bg-gradient-to-br from-brand/10 to-brand/5 border-brand/40 shadow-soft"
          : "bg-surface border-border/50 shadow-soft"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="text-3xl leading-none select-none shrink-0 pt-0.5">{m.flag}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[14px] font-bold text-text-primary leading-tight">{m.nameUz}</p>
            {m.highlight && (
              <span className="text-[9px] font-bold text-brand bg-brand/10 border border-brand/25 rounded-md px-1.5 py-0.5 shrink-0 uppercase tracking-wide">
                🇺🇿 Local
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} weight="fill" className="text-text-muted shrink-0" />
            <p className="text-[11px] text-text-muted truncate">{m.city}, {m.country}</p>
          </div>
        </div>
        {/* Days badge */}
        <div
          className={`shrink-0 flex flex-col items-center justify-center rounded-2xl px-2.5 py-1.5 min-w-[56px] ${
            isPast
              ? "bg-secondary-bg text-text-muted"
              : daysLeft <= 30
              ? "bg-destructive/10 text-destructive"
              : "bg-brand/10 text-brand"
          }`}
        >
          {!isPast && <span className="text-base font-black leading-none">{daysLeft}</span>}
          <span className="text-[9px] font-bold uppercase tracking-wider leading-tight mt-0.5">
            {daysLabel}
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 mt-3">
        <CalendarDots size={13} weight="fill" className="text-brand shrink-0" />
        <span className="text-[12px] font-semibold text-text-secondary">{formatDate(m.date, lang)}</span>
      </div>

      {/* Distances */}
      <div className="mt-2">
        <span className="text-[10px] text-text-muted font-medium">{distLabel}: </span>
        <div className="inline-flex flex-wrap gap-1 mt-1">
          {m.distances.map((d) => (
            <span
              key={d}
              className="text-[10px] font-bold bg-secondary-bg text-text-secondary rounded-full px-2 py-0.5 border border-border/40"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Register Button */}
      {!isPast && (
        <a
          href={m.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 w-full h-9 rounded-2xl bg-brand text-white text-[12px] font-bold active:scale-[0.98] transition-all shadow-button"
        >
          <ArrowSquareOut size={14} weight="bold" />
          {registerLabel}
        </a>
      )}
      {isPast && (
        <div className="mt-3 flex items-center justify-center gap-1.5 w-full h-9 rounded-2xl bg-secondary-bg text-text-muted text-[12px] font-semibold">
          <CheckCircle size={14} weight="fill" />
          {lang === "ru" ? "Завершён" : lang === "en" ? "Completed" : "Yakunlangan"}
        </div>
      )}
    </div>
  );
}

// ─── Marathon Page ────────────────────────────────────────────────────────────
export function MarathonPage({ lang = "uz" }: { lang?: string }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<Region>("all");

  const filtered = useMemo(() => {
    return MARATHONS.filter((m) => {
      const matchesRegion = region === "all" || m.region === region;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.nameUz.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q);
      return matchesRegion && matchesSearch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [search, region]);

  const title = lang === "ru" ? "Марафоны" : lang === "en" ? "Marathons" : "Marafonlar";
  const subtitle =
    lang === "ru"
      ? "Ближайшие забеги по всему миру"
      : lang === "en"
      ? "Upcoming races around the world"
      : "Dunyo bo'ylab yaqinlashayotgan yugurish";
  const searchPlaceholder =
    lang === "ru" ? "Поиск марафона..." : lang === "en" ? "Search marathon..." : "Marafon qidirish...";
  const noResults =
    lang === "ru" ? "Марафоны не найдены" : lang === "en" ? "No marathons found" : "Marafon topilmadi";

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Medal size={26} weight="fill" className="text-brand" />
          <h1 className="text-[26px] font-bold text-text-primary">{title}</h1>
        </div>
        <p className="text-[13px] text-text-muted mt-1">{subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-2xl border border-input bg-surface pl-10 pr-4 text-sm text-text-primary outline-none focus:border-brand transition-colors"
        />
      </div>

      {/* Region Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {REGIONS.map((r) => (
          <button
            key={r.value}
            onClick={() => setRegion(r.value)}
            className={`shrink-0 h-8 px-3.5 rounded-full text-[11px] font-bold transition-all border ${
              region === r.value
                ? "bg-brand text-white border-brand shadow-button"
                : "bg-surface text-text-secondary border-border/50"
            }`}
          >
            {r.label[lang as keyof typeof r.label] || r.label.uz}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
          <Timer size={40} weight="thin" />
          <p className="text-sm font-medium">{noResults}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((m) => (
            <MarathonCard key={m.id} m={m} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
