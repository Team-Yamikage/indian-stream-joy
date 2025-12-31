import { motion } from "framer-motion";
import { History, Menu, X, Monitor, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo.png";

interface HeaderProps {
  isTVMode?: boolean;
  onToggleTVMode?: () => void;
}

export function Header({ isTVMode, onToggleTVMode }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden glow-saffron">
                <img 
                  src={logo} 
                  alt="StreamIndia Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Stream<span className="text-gradient-saffron">India</span>
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">Live TV</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              tabIndex={0}
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            >
              Home
            </Link>
            <a
              href="/#channels"
              tabIndex={0}
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            >
              Channels
            </a>
            <a
              href="/#categories"
              tabIndex={0}
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            >
              Categories
            </a>
            <Link
              to="/?history=true"
              tabIndex={0}
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            >
              <History className="w-4 h-4" />
              History
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* TV Mode Toggle */}
            {onToggleTVMode && (
              <button
                onClick={onToggleTVMode}
                tabIndex={0}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  isTVMode
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title={isTVMode ? "Switch to Desktop Mode" : "Switch to TV Mode"}
              >
                {isTVMode ? <Tv className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                <span className="text-xs font-medium">{isTVMode ? "TV" : "Desktop"}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              tabIndex={0}
              className="md:hidden p-2 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Live indicator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indian-green/20"
            >
              <span className="w-2 h-2 rounded-full bg-indian-green animate-pulse" />
              <span className="text-xs font-medium text-indian-green">LIVE</span>
            </motion.div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                tabIndex={0}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground py-2 px-3 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Home
              </Link>
              <a
                href="/#channels"
                tabIndex={0}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground py-2 px-3 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Channels
              </a>
              <a
                href="/#categories"
                tabIndex={0}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground py-2 px-3 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Categories
              </a>
              <Link
                to="/?history=true"
                tabIndex={0}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground py-2 px-3 rounded-lg hover:bg-secondary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <History className="w-4 h-4" />
                History
              </Link>
              {onToggleTVMode && (
                <button
                  onClick={() => {
                    onToggleTVMode();
                    setMobileMenuOpen(false);
                  }}
                  tabIndex={0}
                  className={`text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isTVMode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {isTVMode ? <Tv className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  {isTVMode ? "TV Mode (On)" : "TV Mode (Off)"}
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}
