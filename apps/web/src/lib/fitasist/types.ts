export type Gender = "male" | "female";
export type BodyType = "skinny" | "average" | "bulk";
export type ActivityLevel = "athlete" | "active" | "sedentary";
export type Language = "uz" | "ru" | "en";

export interface UserProfile {
  fio: string;
  birthYear: number;
  birthDate?: string;
  gender: Gender;
  height?: number | null;
  weight?: number | null;
  bodyType: BodyType;
  activity: ActivityLevel;
  createdAt: string;
  email?: string | null;
  language?: Language;
  photoUrl?: string | null;
  goal?: string;
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

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  category: "national" | "fastfood" | "drinks" | "breakfast" | "healthy" | "dessert" | "snacks";
  portionSizeUz: string;
  portionSizeRu: string;
  portionSizeEn: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number; // in grams
  icon: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface FoodLog {
  id: string;
  date: string; // yyyy-mm-dd
  mealType: MealType;
  foodName: string;
  quantity: number;
  portionLabel: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  source: "search" | "photo_ai" | "manual" | "cart";
  photoUrl?: string;
  createdAt: string;
}

export interface FitState {
  profile: UserProfile | null;
  measurements: Measurement[];
  challenges: Challenge[];
  hydration: Record<string, HydrationLog>;
  foodLogs: FoodLog[];
  notifications: AppNotification[];
  chatSessions: ChatSession[];
  simulatedDayOffset: number;
  theme: "light" | "dark";
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  imageUrl?: string;
  createdAt: string; // ISO String
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  isPinned?: boolean;
  deletedForUser?: boolean;
}
