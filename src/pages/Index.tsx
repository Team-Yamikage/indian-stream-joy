import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ChannelCard } from "@/components/ChannelCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Footer } from "@/components/Footer";
import {
  fetchChannelsWithStreams,
  fetchCategories,
  getChannelsByCategory,
  searchChannels,
} from "@/lib/api";
import { ChannelWithStream } from "@/types/channel";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { Tv, AlertCircle, Heart, History, Trash2 } from "lucide-react";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showHistoryOnly, setShowHistoryOnly] = useState(searchParams.get("history") === "true");
  const [selectedChannel, setSelectedChannel] = useState<ChannelWithStream | null>(null);
  const channelsRef = useRef<HTMLDivElement>(null);
  
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { history, addToHistory, clearHistory, getRecentChannelIds } = useWatchHistory();

  const {
    data: channels = [],
    isLoading: channelsLoading,
    error: channelsError,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannelsWithStreams,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const recentChannelIds = getRecentChannelIds();

  const filteredChannels = useMemo(() => {
    let result = channels;
    
    // Filter by watch history
    if (showHistoryOnly) {
      result = recentChannelIds
        .map((id) => channels.find((c) => c.id === id))
        .filter((c): c is ChannelWithStream => c !== undefined);
    }
    // Filter favorites
    else if (showFavoritesOnly) {
      result = result.filter((channel) => favorites.includes(channel.id));
    }
    
    if (activeCategory !== "all") {
      result = getChannelsByCategory(result, activeCategory);
    }
    if (searchQuery) {
      result = searchChannels(result, searchQuery);
    }
    return result;
  }, [channels, activeCategory, searchQuery, showFavoritesOnly, showHistoryOnly, favorites, recentChannelIds]);

  const handleExplore = () => {
    channelsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlayChannel = (channel: ChannelWithStream) => {
    addToHistory(channel.id);
    setSelectedChannel(channel);
  };

  const handleClosePlayer = () => {
    setSelectedChannel(null);
  };

  const handleViewDetails = (channelId: string) => {
    navigate(`/channel/${channelId}`);
  };

  // Escape key to close player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedChannel) {
        handleClosePlayer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChannel]);

  return (
    <>
      <Helmet>
        <title>StreamIndia - Watch Indian TV Channels Live & Free</title>
        <meta
          name="description"
          content="Stream Indian TV channels live and free. Watch news, entertainment, sports, movies, and more from India's top broadcasters."
        />
        <meta name="keywords" content="Indian TV, live streaming, IPTV, Indian channels, free TV, news, entertainment, sports" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section */}
          <HeroSection totalChannels={channels.length} onExplore={handleExplore} />

          {/* Channels Section */}
          <section
            ref={channelsRef}
            id="channels"
            className="py-16 px-4"
          >
            <div className="container mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {showHistoryOnly ? (
                    <>Watch <span className="text-gradient-saffron">History</span></>
                  ) : showFavoritesOnly ? (
                    <>My <span className="text-gradient-saffron">Watchlist</span></>
                  ) : (
                    <>Browse <span className="text-gradient-saffron">Channels</span></>
                  )}
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {showHistoryOnly
                    ? "Your recently watched channels."
                    : showFavoritesOnly
                    ? "Your saved favorite channels."
                    : "Discover and watch your favorite Indian TV channels. Filter by category or search for specific channels."}
                </p>
              </motion.div>

              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
                <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  <button
                    onClick={() => {
                      setShowFavoritesOnly(!showFavoritesOnly);
                      setShowHistoryOnly(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 whitespace-nowrap ${
                      showFavoritesOnly
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-border bg-card/50 text-muted-foreground hover:border-red-500 hover:text-red-500"
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">Watchlist</span>
                    {favorites.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        showFavoritesOnly ? "bg-white/20" : "bg-red-500/20 text-red-400"
                      }`}>
                        {favorites.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowHistoryOnly(!showHistoryOnly);
                      setShowFavoritesOnly(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 whitespace-nowrap ${
                      showHistoryOnly
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border bg-card/50 text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">History</span>
                    {history.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        showHistoryOnly ? "bg-white/20" : "bg-primary/20 text-primary"
                      }`}>
                        {history.length}
                      </span>
                    )}
                  </button>
                </div>
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">
                    {filteredChannels.length} channel{filteredChannels.length !== 1 ? "s" : ""} available
                  </span>
                </div>
                {showHistoryOnly && history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                )}
              </div>

              {/* Loading State */}
              {channelsLoading && <LoadingSpinner />}

              {/* Error State */}
              {channelsError && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Failed to load channels
                  </h3>
                  <p className="text-muted-foreground">
                    Please check your internet connection and try again.
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!channelsLoading && !channelsError && filteredChannels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  {showHistoryOnly ? (
                    <>
                      <History className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No watch history
                      </h3>
                      <p className="text-muted-foreground">
                        Start watching channels to build your history.
                      </p>
                    </>
                  ) : showFavoritesOnly ? (
                    <>
                      <Heart className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No favorites yet
                      </h3>
                      <p className="text-muted-foreground">
                        Click the heart icon on any channel to add it to your watchlist.
                      </p>
                    </>
                  ) : (
                    <>
                      <Tv className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No channels found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Channels Grid */}
              {!channelsLoading && !channelsError && filteredChannels.length > 0 && (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredChannels.map((channel, index) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        index={index}
                        onPlay={handlePlayChannel}
                        isFavorite={isFavorite(channel.id)}
                        onToggleFavorite={toggleFavorite}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </section>
        </main>

        <Footer />

        {/* Video Player Modal */}
        <AnimatePresence>
          {selectedChannel && selectedChannel.stream && (
            <VideoPlayer
              url={selectedChannel.stream.url}
              title={selectedChannel.name}
              onClose={handleClosePlayer}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Index;
