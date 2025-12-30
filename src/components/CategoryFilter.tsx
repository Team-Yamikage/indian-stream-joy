import { motion } from "framer-motion";
import { Category } from "@/types/channel";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Film,
  Music,
  Trophy,
  Baby,
  Tv,
  Globe,
  Heart,
  BookOpen,
  Church,
} from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  news: <Newspaper className="w-4 h-4" />,
  entertainment: <Film className="w-4 h-4" />,
  movies: <Film className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  sports: <Trophy className="w-4 h-4" />,
  kids: <Baby className="w-4 h-4" />,
  general: <Tv className="w-4 h-4" />,
  lifestyle: <Heart className="w-4 h-4" />,
  documentary: <BookOpen className="w-4 h-4" />,
  religious: <Church className="w-4 h-4" />,
};

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const displayCategories = [
    { id: "all", name: "All Channels", description: "All available channels" },
    ...categories.filter((cat) =>
      ["news", "entertainment", "sports", "movies", "music", "kids", "general", "religious", "documentary", "lifestyle"].includes(
        cat.id
      )
    ),
  ];

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCategoryChange(categoryId);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="categories">
      {displayCategories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category.id)}
          onKeyDown={(e) => handleKeyDown(e, category.id)}
          tabIndex={0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
            activeCategory === category.id
              ? "bg-primary text-primary-foreground glow-saffron"
              : "glass hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={activeCategory === category.id}
        >
          {category.id === "all" ? (
            <Globe className="w-4 h-4" />
          ) : (
            categoryIcons[category.id] || <Tv className="w-4 h-4" />
          )}
          {category.name}
        </motion.button>
      ))}
    </div>
  );
}
