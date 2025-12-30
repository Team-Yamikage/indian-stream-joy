import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onChange("");
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="glass rounded-full overflow-hidden flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search channels..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="flex-1 bg-transparent border-none outline-none px-3 py-1 text-foreground placeholder:text-muted-foreground"
          aria-label="Search channels"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange("")}
              tabIndex={0}
              className="p-1 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
