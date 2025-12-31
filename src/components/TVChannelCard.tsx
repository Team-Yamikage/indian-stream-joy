import React from "react";
import { ChannelWithStream } from "@/types/channel";
import { Play, Heart, EyeOff } from "lucide-react";
import channelThumbnail from "@/assets/channel-thumbnail.png";

interface TVChannelCardProps {
  channel: ChannelWithStream;
  onPlay: (channel: ChannelWithStream) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (channelId: string) => void;
  isHidden?: boolean;
}

export const TVChannelCard = React.forwardRef<HTMLDivElement, TVChannelCardProps>(
  ({ channel, onPlay, isFavorite = false, onToggleFavorite, isHidden = false }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPlay(channel);
      }
    };

    const handleFavoriteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(channel.id);
    };

    return (
      <div
        ref={ref}
        className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-card border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/30 focus:outline-none hover:border-primary/50 ${
          isHidden ? "opacity-50" : ""
        }`}
        onClick={() => onPlay(channel)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Play ${channel.name}`}
      >
        {/* Large thumbnail for TV */}
        <div className="relative aspect-video bg-secondary overflow-hidden">
          <img
            src={channelThumbnail}
            alt={channel.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {/* Large play button for TV visibility */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 focus-within:opacity-100 group-focus:opacity-100">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Hidden indicator */}
          {isHidden && (
            <div className="absolute top-3 right-3 p-2 rounded-full bg-destructive/80">
              <EyeOff className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Favorite button - larger for TV */}
          <button
            onClick={handleFavoriteClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleFavoriteClick(e);
            }}
            tabIndex={0}
            className={`absolute top-3 left-3 p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-background/70 text-muted-foreground hover:text-red-500"
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Quality badge */}
          {channel.stream?.quality && (
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-sm font-bold bg-primary text-primary-foreground">
              {channel.stream.quality}
            </div>
          )}
        </div>

        {/* Content - larger text for TV readability */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-foreground truncate">
            {channel.name}
          </h3>
          {channel.network && (
            <p className="text-base text-muted-foreground mt-1 truncate">
              {channel.network}
            </p>
          )}
          {channel.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {channel.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TVChannelCard.displayName = "TVChannelCard";
