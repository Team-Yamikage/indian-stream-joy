import { motion } from "framer-motion";
import { Tv } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Tv className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Stream<span className="text-gradient-saffron">India</span>
                </h2>
                <p className="text-xs text-muted-foreground">Free Live TV Streaming</p>
              </div>
            </Link>
          </motion.div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <a href="/#channels" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Channels
            </a>
            <a href="/#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </a>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StreamIndia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
