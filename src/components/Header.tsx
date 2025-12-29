import { motion } from "framer-motion";
import { Tv } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-saffron">
              <Tv className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Stream<span className="text-gradient-saffron">India</span>
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Live TV</p>
            </div>
          </motion.div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {["Home", "Channels", "Categories", "About"].map((link, i) => (
              <motion.a
                key={link}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                href={link === "Home" ? "#" : `#${link.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </nav>

          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indian-green/20"
          >
            <span className="w-2 h-2 rounded-full bg-indian-green animate-pulse" />
            <span className="text-xs font-medium text-indian-green">LIVE</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
