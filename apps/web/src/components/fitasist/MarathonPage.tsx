import { useMemo, useState } from "react";
import { Search01Icon, FilterIcon, Location01Icon, Calendar01Icon, Clock01Icon, Medal01Icon, SentIcon, CheckmarkCircle01Icon } from "hugeicons-react";

// ─── Marathon Data ───────────────────────────────────────────────────────────

export interface Marathon {
  image?: string;
  id: string;
  name: string;
  nameUz: string;
  nameRu?: string;
  city: string;
  country: string;
  flag: string;
  date: string; // ISO YYYY-MM-DD
  distances: string[];
  registrationUrl?: string;
  website: string;
  region: "uzbekistan" | "asia" | "europe" | "americas" | "middleeast";
  highlight?: boolean;
  elevationGain?: string;
  terrain?: string;
  desc?: string;
}

export const MARATHONS: Marathon[] = [
  // 1. Sky Camp Bo'stonliq (Eng yaqini)
  {
    id: "skycamp-bostanlyk",
    name: "Sky Camp Bo'stonliq",
    nameUz: "Sky Camp Bo'stonliq Tog' Poygasi",
    nameRu: "Sky Camp Бостанлык (Амирсой)",
    city: "Bo'stonliq, Amirsoy",
    country: "O'zbekiston",
    flag: "🏔",
    date: "2026-09-06",
    distances: ["10K Sky Trail", "21K Sky Run", "42K Sky Ultra"],
    elevationGain: "1,200m+",
    terrain: "Tog'li & Trail",
    desc: "Amirsoy va Chimyon tog'lari bo'ylab Markaziy Osiyoning eng nufuzli tog' poygasi va skyrunning festivali.",
    website: "https://samarkandmarathon.uz",
    region: "uzbekistan",
    image: "/marathons/skycamp.jpg",
  },
  // 2. Toshkent Xalqaro Marafoni
  {
    id: "tashkent-international-2026",
    name: "Tashkent International Marathon",
    nameUz: "Toshkent Xalqaro Marafoni",
    nameRu: "Ташкентский Международный Марафон",
    city: "Toshkent",
    country: "O'zbekiston",
    flag: "🇺🇿",
    date: "2026-10-11",
    distances: ["3K", "10K", "21.1K", "42.2K"],
    elevationGain: "45m",
    terrain: "Shahar asfalt",
    desc: "O'zbekistonning bosh rasmiy shahar marafoni. World Athletics sertifikatiga ega xalqaro trassa.",
    website: "https://uzathletics.uz",
    region: "uzbekistan",
    image: "/marathons/tashkent.jpg",
  },
  // 3. Zomin Ultra Tog' Marafoni
  {
    id: "zaamin-ultra-2026",
    name: "Zaamin Ultra Trail",
    nameUz: "Zomin Ultra Tog' Marafoni",
    nameRu: "Заамин Ультра Марафон",
    city: "Zomin Milliy Bog'i",
    country: "O'zbekiston",
    flag: "🌲",
    date: "2026-10-25",
    distances: ["10K", "21K", "50K Ultra"],
    elevationGain: "1,535m",
    terrain: "Tog'li archazor",
    desc: "Zomin tog'larining toza havosi va archazorlari bo'ylab yugurish. O'zbekistondagi eng mashhur ultramarafon.",
    website: "https://samarkandmarathon.uz",
    region: "uzbekistan",
    image: "/marathons/zaamin_clean.jpg",
  },
  // 4. Samarqand Xalqaro Marafoni
  {
    id: "samarkand-marathon-2026",
    name: "Samarkand Half Marathon",
    nameUz: "Samarqand Xalqaro Marafoni",
    nameRu: "Самаркандский Марафон",
    city: "Samarqand",
    country: "O'zbekiston",
    flag: "🏛",
    date: "2026-11-01",
    distances: ["2K", "5K", "10K", "21.1K", "42.2K"],
    elevationGain: "80m",
    terrain: "Tarixiy shahar",
    desc: "Registon maydoni va buyuk Ipak yo'lining tarixiy obidalari bo'ylab o'tadigan nufuzli xayriya marafoni.",
    website: "https://samarkandmarathon.uz",
    region: "uzbekistan",
    image: "/marathons/samarkand.jpg",
  },
  // 5. Buxoro Tungi Yarim Marafoni
  {
    id: "bukhara-night-race-2026",
    name: "Bukhara Night Race",
    nameUz: "Buxoro Tungi Yarim Marafoni",
    nameRu: "Бухарский Ночной Полумарафон",
    city: "Buxoro",
    country: "O'zbekiston",
    flag: "🏰",
    date: "2026-11-15",
    distances: ["5K", "10K", "21.1K"],
    elevationGain: "20m",
    terrain: "Tungi shahar",
    desc: "Tungi qadimiy Buxoro chiroqlari va Ark qal'asi bo'ylab unutilmas yugurish musobaqasi.",
    website: "https://samarkandmarathon.uz",
    region: "uzbekistan",
    image: "/marathons/bukhara.jpg",
  },
  // 6. Xalqaro Jahon Marafonlari
  {
    id: "berlin-marathon-2026",
    name: "Berlin Marathon",
    nameUz: "Berlin Marafoni",
    nameRu: "Берлинский Марафон",
    city: "Berlin",
    country: "Germaniya",
    flag: "🇩🇪",
    date: "2026-09-27",
    distances: ["42.195 km"],
    elevationGain: "25m",
    terrain: "Tekis asfalt",
    desc: "Dunyoning eng tezkor marafoni va Abbott World Marathon Majors a'zosi.",
    website: "https://www.bmw-berlin-marathon.com",
    region: "europe",
  },
  {
    id: "chicago-marathon-2026",
    name: "Bank of America Chicago Marathon",
    nameUz: "Chikago Marafoni",
    nameRu: "Чикагский Марафон",
    city: "Chicago",
    country: "AQSH",
    flag: "🇺🇸",
    date: "2026-10-11",
    distances: ["42.195 km"],
    elevationGain: "40m",
    terrain: "Shahar ko'chalari",
    desc: "Abbott World Marathon Majors tarkibiga kiruvchi eng mashhur yugurish poygasi.",
    website: "https://www.chicagomarathon.com",
    region: "americas",
  },
  {
    id: "new-york-marathon-2026",
    name: "TCS New York City Marathon",
    nameUz: "Nyu-York Marafoni",
    nameRu: "Нью-Йоркский Марафон",
    city: "New York",
    country: "AQSH",
    flag: "🇺🇸",
    date: "2026-11-01",
    distances: ["42.195 km"],
    elevationGain: "240m",
    terrain: "Besh tuman va ko'priklar",
    desc: "Dunyoning eng yirik marafoni — har yili 50 000 dan ortiq yuguruvchilar.",
    website: "https://www.nyrr.org",
    region: "americas",
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
          <Medal01Icon size={11} />
          <span>{lang === "ru" ? "Топ" : lang === "en" ? "Top" : "Tavsiya"}</span>
        </div>
      )}

      <div className="flex items-start gap-3.5">
        <div className="text-3xl select-none shrink-0 mt-0.5">{m.flag}</div>
        <div className="flex-1 min-w-0 pr-12">
          <h3 className="font-bold text-text-primary text-base leading-snug truncate">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
            <Location01Icon size={13} className="text-brand shrink-0" />
            <span>{m.city}, {m.country}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 bg-secondary-bg/60 dark:bg-white/5 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <Calendar01Icon size={16} className="text-brand shrink-0" />
          <div>
            <div className="text-[10px] text-text-muted">{lang === "ru" ? "Дата" : lang === "en" ? "Date" : "Sana"}</div>
            <div className="text-xs font-semibold text-text-primary leading-tight">{formatDate(m.date, lang)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock01Icon size={16} className="text-brand shrink-0" />
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
          <SentIcon size={13} />
        </a>
        <a
          href={m.website}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-3 rounded-xl bg-secondary-bg hover:bg-border text-text-secondary text-xs font-bold flex items-center justify-center gap-1 border border-border transition-all active:scale-95"
          title="Rasmiy vebsayt"
        >
          <SentIcon size={14} />
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
        <Search01Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
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
          <CheckmarkCircle01Icon size={14} />
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
