export type Gender = "male" | "female";
export type BodyType = "skinny" | "average" | "bulk";
export type ActivityLevel = "athlete" | "active" | "sedentary";

export interface UserProfile {
  fio: string;
  birthYear: number;
  gender: Gender;
  height?: number;
  weight?: number;
  bodyType: BodyType;
  activity: ActivityLevel;
  createdAt: string;
}

export interface Measurement {
  id: string;
  date: string;
  height?: number;
  weight?: number;
  chest?: number;
  biceps?: number;
  waist?: number;
  thighs?: number;
  neck?: number;
}

export interface Challenge {
  id: string;
  name: string;
  duration: number;
  dailyTarget: string;
  startDate: string;
  completedDays: string[]; // ISO dates
  completed?: boolean;
}

export interface HydrationLog {
  date: string; // yyyy-mm-dd
  waterMl: number;
  creatineG: number;
  wheyG: number;
  vitaminD: boolean;
}

export interface AppNotification {
  id: string;
  kind: "water" | "creatine" | "challenge" | "info";
  title: string;
  body: string;
  action?: string;
  createdAt: string;
  read: boolean;
}

export interface FitState {
  profile: UserProfile | null;
  measurements: Measurement[];
  challenges: Challenge[];
  hydration: Record<string, HydrationLog>;
  notifications: AppNotification[];
  simulatedDayOffset: number;
  theme: "light" | "dark";
}
