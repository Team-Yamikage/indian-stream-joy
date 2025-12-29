import { motion } from "framer-motion";
import { ChannelWithStream } from "@/types/channel";
import { Play, Tv, Globe } from "lucide-react";

interface ChannelCardProps {
  channel: ChannelWithStream;
  index: number;
  onPlay: (channel: ChannelWithStream) => void;
}

export function ChannelCard({ channel, index, onPlay }: ChannelCardProps) {
  const categoryColors: Record<string, string> = {
    news: "bg-red-500/20 text-red-400",
    entertainment: "bg-purple-500/20 text-purple-400",
    sports: "bg-green-500/20 text-green-400",
    movies: "bg-amber-500/20 text-amber-400",
    music: "bg-pink-500/20 text-pink-400",
    kids: "bg-cyan-500/20 text-cyan-400",
    religious: "bg-orange-500/20 text-orange-400",
    general: "bg-blue-500/20 text-blue-400",
    lifestyle: "bg-rose-500/20 text-rose-400",
    documentary: "bg-teal-500/20 text-teal-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group glass-card rounded-xl overflow-hidden cursor-pointer"
      onClick={() => onPlay(channel)}
    >
      {/* Card Header with gradient */}
      <div className="relative h-28 bg-gradient-to-br from-secondary to-navy-light flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
        <div className="relative z-10 w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Tv className="w-8 h-8 text-primary" />
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center glow-saffron">
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* Quality badge */}
        {channel.stream?.quality && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-primary/90 text-primary-foreground">
            {channel.stream.quality}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {channel.name}
        </h3>
        
        {channel.network && (
          <p className="text-sm text-muted-foreground mt-1 truncate flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {channel.network}
          </p>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mt-3">
          {channel.categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className={`text-xs px-2 py-0.5 rounded-full ${
                categoryColors[cat] || "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
