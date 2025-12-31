import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Hls from "hls.js";
import { 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Play, 
  Pause, 
  RotateCcw,
  PictureInPicture2,
  Heart,
  Share2,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { fetchChannelsWithStreams } from "@/lib/api";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useStreamCheck } from "@/hooks/useStreamCheck";
import { useTVMode } from "@/hooks/useTVMode";
import channelThumbnail from "@/assets/channel-thumbnail.png";

type ErrorType = "unavailable" | "unsupported" | "network" | "generic";

interface StreamError {
  type: ErrorType;
  message: string;
  details?: string;
}

const Watch = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<StreamError | null>(null);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const maxRetries = 3;

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useWatchHistory();
  const { recordFailure } = useStreamCheck();
  const { isTVMode, toggleTVMode } = useTVMode();

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannelsWithStreams,
    staleTime: 5 * 60 * 1000,
  });

  const channel = channels.find((c) => c.id === channelId);
  const streamUrl = channel?.stream?.url;

  // Keyboard shortcuts
  useKeyboardShortcuts({ 
    videoRef, 
    onClose: () => navigate(-1) 
  });

  useEffect(() => {
    setIsPiPSupported(
      "pictureInPictureEnabled" in document && document.pictureInPictureEnabled
    );
  }, []);

  // Add to history when channel loads
  useEffect(() => {
    if (channel) {
      addToHistory(channel.id);
    }
  }, [channel, addToHistory]);

  const getErrorMessage = (type: ErrorType): StreamError => {
    switch (type) {
      case "unavailable":
        return {
          type,
          message: "This channel is currently unavailable or offline.",
          details: "The stream may be temporarily down or geo-restricted."
        };
      case "unsupported":
        return {
          type,
          message: "This stream format is not supported on your device.",
          details: "Try using the external player option to watch in VLC."
        };
      case "network":
        return {
          type,
          message: "Network error occurred.",
          details: "Please check your internet connection and try again."
        };
      default:
        return {
          type,
          message: "Unable to play this stream.",
          details: "Please try another channel or use an external player."
        };
    }
  };

  const initializePlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setLoading(true);
    setError(null);

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
        capLevelToPlayerSize: true,
        testBandwidth: true,
      });
      hlsRef.current = hls;
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => hls.startLoad(), 2000);
              } else {
                setError(getErrorMessage("network"));
                setLoading(false);
                if (channel) recordFailure(channel.id);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1);
                hls.recoverMediaError();
              } else {
                setError(getErrorMessage("unsupported"));
                setLoading(false);
                if (channel) recordFailure(channel.id);
              }
              break;
            default:
              setError(getErrorMessage("unavailable"));
              setLoading(false);
              if (channel) recordFailure(channel.id);
              hls.destroy();
              break;
          }
        }
      });

      const loadTimeout = setTimeout(() => {
        if (loading) {
          setError(getErrorMessage("unavailable"));
          setLoading(false);
        }
      }, 15000);

      return () => clearTimeout(loadTimeout);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      
      video.addEventListener("loadedmetadata", () => {
        setLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
      
      video.addEventListener("error", () => {
        const mediaError = video.error;
        if (mediaError) {
          switch (mediaError.code) {
            case MediaError.MEDIA_ERR_NETWORK:
              setError(getErrorMessage("network"));
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              setError(getErrorMessage("unsupported"));
              break;
            default:
              setError(getErrorMessage("unavailable"));
          }
        } else {
          setError(getErrorMessage("unavailable"));
        }
        setLoading(false);
        if (channel) recordFailure(channel.id);
      });
    } else {
      setError(getErrorMessage("unsupported"));
      setLoading(false);
    }
  }, [streamUrl, loading, retryCount, channel, recordFailure]);

  useEffect(() => {
    if (streamUrl) {
      initializePlayer();
    }
    
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);
    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, [streamUrl]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    initializePlayer();
  };

  const handleCopyUrl = async () => {
    if (!streamUrl) return;
    try {
      await navigator.clipboard.writeText(streamUrl);
      setCopied(true);
      toast.success("Stream URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: channel?.name || "Watch Live TV",
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  if (channelsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-background">
        <Header isTVMode={isTVMode} onToggleTVMode={toggleTVMode} />
        <div className="flex flex-col items-center justify-center min-h-[80vh] pt-16 px-4">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Channel Not Found</h1>
          <p className="text-muted-foreground mb-6">This channel doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Channels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{channel.name} - StreamIndia Live</title>
        <meta name="description" content={`Watch ${channel.name} live streaming free.`} />
      </Helmet>

      <div className={`min-h-screen bg-background ${isTVMode ? "tv-mode" : ""}`}>
        <Header isTVMode={isTVMode} onToggleTVMode={toggleTVMode} />

        <main className="pt-16">
          {/* Video Player Section */}
          <div ref={containerRef} className="relative bg-black">
            <div className="aspect-video max-h-[80vh] mx-auto relative">
              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-muted-foreground text-sm mt-4">Loading stream...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 text-center p-6">
                  <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                  <h4 className="text-foreground font-semibold text-xl mb-2">{error.message}</h4>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md">{error.details}</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handleRetry}
                      tabIndex={0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </button>
                    <button
                      onClick={handleCopyUrl}
                      tabIndex={0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy URL for VLC
                    </button>
                    <a
                      href={streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open External
                    </a>
                  </div>
                </div>
              )}

              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full bg-black"
                controls
                playsInline
                autoPlay
                tabIndex={0}
              />

              {/* Center Play/Pause Overlay */}
              {!loading && !error && (
                <button
                  onClick={togglePlayPause}
                  tabIndex={0}
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity bg-black/20 focus:outline-none"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-primary-foreground" />
                    ) : (
                      <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    tabIndex={0}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    title={isMuted ? "Unmute (M)" : "Mute (M)"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    tabIndex={0}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    title="Fullscreen (F)"
                  >
                    <Maximize className="w-5 h-5 text-white" />
                  </button>
                  {isPiPSupported && (
                    <button
                      onClick={togglePiP}
                      tabIndex={0}
                      className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                        isPiPActive ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      title="Picture-in-Picture"
                    >
                      <PictureInPicture2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Keyboard hints */}
                <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10">Space</kbd>
                  <span>Play</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 ml-2">F</kbd>
                  <span>Fullscreen</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 ml-2">M</kbd>
                  <span>Mute</span>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Info Section */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Channel Logo */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                <img
                  src={channel.logoUrl || channelThumbnail}
                  alt={channel.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Channel Details */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {channel.name}
                </h1>
                {channel.network && (
                  <p className="text-muted-foreground mb-3">{channel.network}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {channel.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleFavorite(channel.id)}
                    tabIndex={0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      isFavorite(channel.id)
                        ? "bg-red-500 text-white"
                        : "bg-secondary text-foreground hover:bg-muted"
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isFavorite(channel.id) ? "currentColor" : "none"} />
                    {isFavorite(channel.id) ? "Saved" : "Add to Watchlist"}
                  </button>
                  <button
                    onClick={handleShare}
                    tabIndex={0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    tabIndex={0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                    External Player
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <Link
                to="/"
                tabIndex={0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Channels
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Watch;
