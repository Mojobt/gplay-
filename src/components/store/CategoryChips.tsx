import React from 'react';
import { 
  Car, 
  Briefcase, 
  GraduationCap, 
  Film, 
  Gamepad2, 
  Plane, 
  CheckCircle2, 
  MessageCircle, 
  Boxes,
  Sparkles
} from 'lucide-react';
import { AppCategory } from '../../types';
import { useAppStore } from '../../context/AppContext';

export const CategoryChips: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useAppStore();

  const categories: { label: AppCategory | 'All'; icon: any }[] = [
    { label: 'All', icon: Sparkles },
    { label: 'Transportation', icon: Car },
    { label: 'Business', icon: Briefcase },
    { label: 'Education', icon: GraduationCap },
    { label: 'Entertainment', icon: Film },
    { label: 'Games', icon: Gamepad2 },
    { label: 'Travel', icon: Plane },
    { label: 'Productivity', icon: CheckCircle2 },
    { label: 'Social', icon: MessageCircle },
    { label: 'Other', icon: Boxes },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.label;
        return (
          <button
            key={cat.label}
            id={`category-chip-${cat.label.toLowerCase()}`}
            onClick={() => setSelectedCategory(cat.label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none shrink-0 ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
