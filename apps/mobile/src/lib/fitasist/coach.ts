import type { UserProfile } from "./types";

export function calcAge(birthYear: number) {
  return new Date().getFullYear() - birthYear;
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
  const age = calcAge(p.birthYear);
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
  skinny: "leaner build",
  average: "balanced build",
  bulk: "heavier build",
};

export function dailyAdvice(p: UserProfile | null): string {
  if (!p) return "Complete onboarding to unlock personalized coaching.";
  const protein = proteinTargetG(p);
  const water = hydrationTargetL(p);
  if (p.activity === "athlete") {
    return `As a pro athlete with ${bodyLabel[p.bodyType]}, prioritize ${protein}g protein, ${water}L water, and 2 recovery sessions this week.`;
  }
  if (p.bodyType === "skinny") {
    return `Focus on progressive overload and a ${protein}g protein target. Add compound lifts 4x per week and 300-500 kcal surplus.`;
  }
  if (p.bodyType === "bulk") {
    return `Combine 3 strength sessions with 2 zone-2 cardio blocks. Hit ${protein}g protein and stay ${water}L hydrated to protect kidneys.`;
  }
  return `Solid baseline — aim for ${protein}g protein and ${water}L water. Add 4 workouts and 8k steps to keep momentum.`;
}

const responders: Array<{ match: RegExp; reply: (p: UserProfile | null) => string }> = [
  {
    match: /protein/i,
    reply: (p) => `Your daily protein target is ${proteinTargetG(p)}g. Split it across 4 meals of ~${Math.round(proteinTargetG(p) / 4)}g each.`,
  },
  {
    match: /water|hydrat/i,
    reply: (p) => `Drink at least ${hydrationTargetL(p)}L today. Pair every coffee with 300ml water.`,
  },
  {
    match: /calorie|kcal|eat|diet/i,
    reply: (p) => `Maintenance sits around ${calorieTargetKcal(p)} kcal. Cut 400 to lean, add 300 to grow.`,
  },
  {
    match: /workout|train|exercise|gym/i,
    reply: (p) =>
      p?.bodyType === "skinny"
        ? "Push, Pull, Legs 4x/week. Focus on 5-8 rep compound lifts."
        : "Upper/Lower split 4x/week with 2 conditioning sessions (row + incline walk).",
  },
  {
    match: /sleep|recover/i,
    reply: () => "Anchor sleep between 22:30-06:30. Recovery is where adaptation happens.",
  },
  {
    match: /creatine/i,
    reply: () => "5g creatine monohydrate daily, any time. Pair with 500ml water minimum to protect kidneys.",
  },
  {
    match: /fat|cut|lose/i,
    reply: (p) => `For fat loss, target ${calorieTargetKcal(p) - 400} kcal and keep protein at ${proteinTargetG(p)}g.`,
  },
];

export function coachReply(question: string, p: UserProfile | null): string {
  for (const r of responders) if (r.match.test(question)) return r.reply(p);
  return dailyAdvice(p);
}
