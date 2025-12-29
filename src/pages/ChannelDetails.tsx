import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ChannelCard } from "@/components/ChannelCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fetchChannelsWithStreams } from "@/lib/api";
import { ChannelWithStream } from "@/types/channel";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import channelThumbnail from "@/assets/channel-thumbnail.png";
import {
  ArrowLeft,
  Play,
  Heart,
  Globe,
  Calendar,
  Tv,
  Share2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const ChannelDetails = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useWatchHistory();

  const {
    data: channels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannelsWithStreams,
    staleTime: 5 * 60 * 1000,
  });

  const channel = channels.find((c) => c.id === channelId);

  // Get related channels (same category)
  const relatedChannels = channels
    .filter(
      (c) =>
        c.id !== channelId &&
        c.categories.some((cat) => channel?.categories.includes(cat))
    )
    .slice(0, 5);

  const handlePlay = () => {
    if (channel) {
      addToHistory(channel.id);
      setIsPlaying(true);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: channel?.name,
        text: `Watch ${channel?.name} on StreamIndia`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-4">
          <Tv className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Channel not found
          </h1>
          <p className="text-muted-foreground mb-6">
            The channel you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{channel.name} - Watch Live on StreamIndia</title>
        <meta
          name="description"
          content={`Watch ${channel.name} live stream. ${channel.network ? `Part of ${channel.network} network.` : ""} Free Indian TV streaming.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Channel Hero */}
          <section className="relative py-12 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="container mx-auto relative z-10">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Channels
              </Link>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Channel Thumbnail */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full lg:w-80 aspect-video lg:aspect-square rounded-2xl overflow-hidden glass-card"
                >
                  <img
                    src={channelThumbnail}
                    alt={channel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <button
                    onClick={handlePlay}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center glow-saffron group-hover:scale-110 transition-transform">
                      <Play
                        className="w-8 h-8 text-primary-foreground ml-1"
                        fill="currentColor"
                      />
                    </div>
                  </button>
                  {channel.stream?.quality && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                      {channel.stream.quality}
                    </div>
                  )}
                </motion.div>

                {/* Channel Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {channel.name}
                      </h1>
                      {channel.alt_names.length > 0 && (
                        <p className="text-muted-foreground">
                          Also known as: {channel.alt_names.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    {channel.network && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>{channel.network}</span>
                      </div>
                    )}
                    {channel.launched && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Since {channel.launched}</span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {channel.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 rounded-full text-sm bg-secondary text-foreground capitalize"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handlePlay}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors glow-saffron"
                    >
                      <Play className="w-5 h-5" fill="currentColor" />
                      Watch Now
                    </button>
                    <button
                      onClick={() => toggleFavorite(channel.id)}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                        isFavorite(channel.id)
                          ? "bg-red-500 text-white"
                          : "bg-secondary text-foreground hover:bg-muted"
                      }`}
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={isFavorite(channel.id) ? "currentColor" : "none"}
                      />
                      {isFavorite(channel.id) ? "In Watchlist" : "Add to Watchlist"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-full font-medium hover:bg-muted transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                    {channel.website && (
                      <a
                        href={channel.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-full font-medium hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Website
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Related Channels */}
          {relatedChannels.length > 0 && (
            <section className="py-12 px-4">
              <div className="container mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Related Channels
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {relatedChannels.map((relChannel, index) => (
                    <div
                      key={relChannel.id}
                      onClick={() => navigate(`/channel/${relChannel.id}`)}
                    >
                      <ChannelCard
                        channel={relChannel}
                        index={index}
                        onPlay={() => navigate(`/channel/${relChannel.id}`)}
                        isFavorite={isFavorite(relChannel.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />

        {/* Video Player Modal */}
        <AnimatePresence>
          {isPlaying && channel.stream && (
            <VideoPlayer
              url={channel.stream.url}
              title={channel.name}
              onClose={() => setIsPlaying(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ChannelDetails;
