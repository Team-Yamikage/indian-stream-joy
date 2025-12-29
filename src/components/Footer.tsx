import { motion } from "framer-motion";
import { Tv, Github, Heart } from "lucide-react";

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
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Tv className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Stream<span className="text-gradient-saffron">India</span>
              </h2>
              <p className="text-xs text-muted-foreground">Free IPTV Streaming</p>
            </div>
          </motion.div>

          {/* Credits */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500" fill="currentColor" /> using IPTV-Org
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Channel data provided by{" "}
              <a
                href="https://github.com/iptv-org/iptv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                iptv-org/iptv
              </a>
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/iptv-org/iptv"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
            >
              <Github className="w-5 h-5 text-foreground" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StreamIndia. This is a demo project. All streams are sourced from publicly available IPTV playlists.
          </p>
        </div>
      </div>
    </footer>
  );
}
