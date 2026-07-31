import type { UserProfile } from "./types";

export function calcAge(pOrYear: number | UserProfile | null) {
  if (!pOrYear) return 25;
  if (typeof pOrYear === "number") {
    return new Date().getFullYear() - pOrYear;
  }
  if (pOrYear.birthDate) {
    const today = new Date();
    const birth = new Date(pOrYear.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(1, age);
  }
  return new Date().getFullYear() - (pOrYear.birthYear || 2000);
}

export function proteinTargetG(p: UserProfile | null) {
  if (!p) return 120;
  const w = p.weight ?? 70;
  const mult =
    p.activity === "athlete" ? 2.0 : p.activity === "active" ? 1.6 : 1.2;
  return Math.round(w * mult);
}

export function hydrationTargetL(p: UserProfile | null) {
  if (!p) return 2.5;
  const w = p.weight ?? 70;
  const base = w * 0.033;
  const bonus = p.activity === "athlete" ? 0.8 : p.activity === "active" ? 0.4 : 0;
  return Math.round((base + bonus) * 10) / 10;
}

export function calorieTargetKcal(p: UserProfile | null) {
  if (!p) return 2200;
  const w = p.weight ?? 70;
  const h = p.height ?? 175;
  const age = calcAge(p);
  const bmr =
    p.gender === "male"
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;
  const mult =
    p.activity === "athlete" ? 1.725 : p.activity === "active" ? 1.55 : 1.3;
  return Math.round(bmr * mult);
}

export function bodyFatNavy(p: UserProfile | null, m: { waist?: number; neck?: number; chest?: number; height?: number }) {
  const h = m.height ?? p?.height;
  const waist = m.waist;
  const neck = m.neck;
  if (!h || !waist || !neck) return null;
  if (p?.gender === "female") {
    const hip = (m.chest ?? waist) * 1.05;
    const bf =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist + hip - neck) +
          0.221 * Math.log10(h)) -
      450;
    return Math.max(8, Math.round(bf * 10) / 10);
  }
  const bf =
    495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) -
    450;
  return Math.max(4, Math.round(bf * 10) / 10);
}

const bodyLabel: Record<string, string> = {
  skinny: "nozik tana tuzilishi",
  average: "o'rtacha tana tuzilishi",
  bulk: "semiz tana tuzilishi",
};

export function dailyAdvice(p: UserProfile | null): string {
  const lang = p?.language || "uz";
  if (!p) {
    if (lang === "ru") return "Заполните профиль для получения персональных советов.";
    if (lang === "en") return "Complete the profile setup to get personalized advice.";
    return "Shaxsiy maslahatlarni olish uchun kirish qismini yakunlang.";
  }
  const protein = proteinTargetG(p);
  const water = hydrationTargetL(p);

  if (lang === "ru") {
    if (p.activity === "athlete") {
      return `Профессиональному спортсмену с ${p.bodyType === "skinny" ? "худощавым" : p.bodyType === "bulk" ? "плотным" : "средним"} телосложением нужно ориентироваться на ${protein}г белка, ${water}л воды в день и 2 восстановительные тренировки в неделю.`;
    }
    if (p.bodyType === "skinny") {
      return `Ориентируйтесь на прогрессивную нагрузку и суточную цель в ${protein}г белка. Выполняйте силовые тренировки 4 раза в неделю и держите профицит в 300-500 ккал.`;
    }
    if (p.bodyType === "bulk") {
      return `Сочетайте 3 силовые тренировки с 2 кардио-сессиями. Для защиты почек потребляйте ${protein}г белка в день и выпивайте ${water}л воды.`;
    }
    return `Хороший старт — соблюдайте норму в ${protein}г белка и ${water}л воды в день. Старайтесь делать 4 тренировки в неделю и проходить 8 тысяч шагов.`;
  }

  if (lang === "en") {
    if (p.activity === "athlete") {
      return `An athlete with ${p.bodyType} body type should target ${protein}g protein, ${water}L water daily, and 2 recovery sessions per week.`;
    }
    if (p.bodyType === "skinny") {
      return `Focus on progressive overload and a daily goal of ${protein}g protein. Do resistance training 4 times a week and maintain a 300-500 kcal surplus.`;
    }
    if (p.bodyType === "bulk") {
      return `Combine 3 strength workouts with 2 cardio blocks. Consume ${protein}g protein daily and drink ${water}L water to support your body.`;
    }
    return `Good start — follow your target of ${protein}g protein and ${water}L water. Include 4 workouts a week and hit 8k daily steps.`;
  }

  // default uz
  if (p.activity === "athlete") {
    return `Sizdek ${bodyLabel[p.bodyType]}ga ega professional sportchi haftasiga ${protein}g oqsil, ${water}L suv va 2 ta tiklanish mashg'ulotlariga e'tibor qaratishi lozim.`;
  }
  if (p.bodyType === "skinny") {
    return `Progressiv yuklama va kunlik ${protein}g oqsil maqsadiga e'tibor qarating. Haftasiga 4 marta tayanch mashqlar bajaring va 300-500 kkal ortiqcha kaloriya oling.`;
  }
  if (p.bodyType === "bulk") {
    return `3 ta kuch mashqini 2 ta kardio blok bilan birlashtiring. Buyraklarni himoya qilish uchun kuniga ${protein}g oqsil oling va ${water}L suv ichib yuring.`;
  }
  return `Yaxshi boshlanish — kunlik ${protein}g oqsil va ${water}L suvga rioya qiling. Faollikni saqlab qolish uchun 4 ta mashq va 8 ming qadam qo'shing.`;
}

const responders: Array<{ match: RegExp; reply: (p: UserProfile | null) => string }> = [
  {
    match: /oqsil|protein/i,
    reply: (p) => `Kunlik oqsil maqsadingiz: ${proteinTargetG(p)}g. Uni kun davomida har biri ~${Math.round(proteinTargetG(p) / 4)}g bo'lgan 4 ta porsiyaga bo'lib iste'mol qiling.`,
  },
  {
    match: /suv|gidrat|chanqoq/i,
    reply: (p) => `Bugun kamida ${hydrationTargetL(p)}L suv iching. Har bir kofe iste'mol qilganda 300ml suv qo'shib ichishni unutmang.`,
  },
  {
    match: /kaloriya|kkal|ovqat|parhez|kuch/i,
    reply: (p) => `Vaznni ushlab turish uchun kunlik me'yor ~${calorieTargetKcal(p)} kkal. Ozish uchun 400 kkal kamaytiring, vazn yig'ish uchun 300 kkal qo'shing.`,
  },
  {
    match: /mashq|sport|zal|trenirovka/i,
    reply: (p) =>
      p?.bodyType === "skinny"
        ? "Haftasiga 4 marta Push/Pull/Legs (itarish/tortish/oyoq) mashqlari. 5-8 takrorlanishli tayanch mashqlarga e'tibor bering."
        : "Haftasiga 4 marta tana tepa/past qismi uchun mashqlar va 2 ta kardio mashg'uloti (yugurish yoki tez yurish).",
  },
  {
    match: /uxlash|uyqu|dam|tiklanish/i,
    reply: () => "Uyquni 22:30 va 06:30 oralig'ida rejalashtiring. Tiklanish — bu tanangiz adaptatsiya bo'ladigan va o'sadigan vaqtdir.",
  },
  {
    match: /kreatin/i,
    reply: () => "Har kuni 5g kreatin monogidrat iste'mol qiling. Buyraklarni himoya qilish uchun uni kamida 500ml suv bilan ichish shart.",
  },
  {
    match: /yog'|ozish|vazn yo'qotish/i,
    reply: (p) => `Yog' yo'qotish (ozish) uchun kunlik maqsad: ${calorieTargetKcal(p) - 400} kkal va oqsil miqdorini ${proteinTargetG(p)}g da ushlab turing.`,
  },
];

export function coachReply(question: string, p: UserProfile | null): string {
  for (const r of responders) if (r.match.test(question)) return r.reply(p);
  return dailyAdvice(p);
}
