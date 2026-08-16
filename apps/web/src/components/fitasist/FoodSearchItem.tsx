import React from "react";
import { Plus, Flame } from "lucide-react";

export interface FoodItemProps {
  id: string;
  nameUz: string;
  nameRu?: string;
  nameEn?: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: string;
}

interface FoodSearchItemProps {
  item: FoodItemProps;
  lang: string;
  onSelect: (item: FoodItemProps) => void;
}

export function FoodSearchItem({ item, lang, onSelect }: FoodSearchItemProps) {
  const displayName =
    lang === "ru" ? item.nameRu || item.nameUz : lang === "en" ? item.nameEn || item.nameUz : item.nameUz;

  return (
    <div
      onClick={() => onSelect(item)}
      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
    >
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#4F6BFF] transition-colors">
          {displayName}
        </h4>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame className="h-3 w-3" />
            {item.kcalPer100g} kkal / 100g
          </span>
          <span>P: {item.proteinPer100g}g</span>
          <span>C: {item.carbsPer100g}g</span>
          <span>F: {item.fatPer100g}g</span>
        </div>
      </div>

      <button className="h-8 w-8 rounded-xl bg-[#4F6BFF]/10 text-[#4F6BFF] group-hover:bg-[#4F6BFF] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
