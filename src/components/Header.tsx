import { motion } from "framer-motion";
import { Tv, History } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
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
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <a
              href="/#channels"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Channels
            </a>
            <a
              href="/#categories"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Categories
            </a>
            <Link
              to="/?history=true"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <History className="w-4 h-4" />
              History
            </Link>
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
