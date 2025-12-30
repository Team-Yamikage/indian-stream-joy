import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, PictureInPicture2, X, Volume2, VolumeX, Maximize, Play, Pause, RotateCcw } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

type ErrorType = "unavailable" | "unsupported" | "network" | "generic";

interface StreamError {
  type: ErrorType;
  message: string;
  details?: string;
}

export function VideoPlayer({ url, title, onClose }: VideoPlayerProps) {
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
  const maxRetries = 3;

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({ videoRef, onClose });

  useEffect(() => {
    setIsPiPSupported(
      "pictureInPictureEnabled" in document && document.pictureInPictureEnabled
    );
  }, []);

  const getErrorMessage = (type: ErrorType): StreamError => {
    switch (type) {
      case "unavailable":
        return {
          type,
          message: "This channel is currently unavailable or offline.",
          details: "The stream may be temporarily down or geo-restricted in your region."
        };
      case "unsupported":
        return {
          type,
          message: "This stream format is not supported on your device.",
          details: "Try using a different browser or device."
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
          details: "Please try another channel."
        };
    }
  };

  const initializePlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

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
        startLevel: -1, // Auto quality
        capLevelToPlayerSize: true,
        testBandwidth: true,
      });
      hlsRef.current = hls;
      
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {
          // Autoplay blocked, user needs to interact
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.log("HLS Error:", data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCount < maxRetries) {
                console.log("Network error, retrying...", retryCount + 1);
                setRetryCount(prev => prev + 1);
                setTimeout(() => hls.startLoad(), 2000);
              } else {
                setError(getErrorMessage("network"));
                setLoading(false);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (retryCount < maxRetries) {
                console.log("Media error, trying to recover...");
                setRetryCount(prev => prev + 1);
                hls.recoverMediaError();
              } else {
                setError(getErrorMessage("unsupported"));
                setLoading(false);
              }
              break;
            default:
              setError(getErrorMessage("unavailable"));
              setLoading(false);
              hls.destroy();
              break;
          }
        }
      });

      // Timeout for initial load
      const loadTimeout = setTimeout(() => {
        if (loading) {
          setError(getErrorMessage("unavailable"));
          setLoading(false);
        }
      }, 15000);

      return () => clearTimeout(loadTimeout);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = url;
      
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
      });
    } else {
      setError(getErrorMessage("unsupported"));
      setLoading(false);
    }
  }, [url, loading, retryCount]);

  useEffect(() => {
    initializePlayer();
    
    const video = videoRef.current;
    if (!video) return;

    // Video event listeners
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
  }, [url]);

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

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/95 backdrop-blur-md"
    >
      <div className="relative w-full max-w-6xl mx-4">
        <div className="glass-card rounded-2xl overflow-hidden shadow-elevated">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground truncate pr-4">{title}</h3>
            <div className="flex items-center gap-2">
              {/* Keyboard hints */}
              <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground mr-4">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground">Space</kbd>
                <span>Play</span>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground ml-2">F</kbd>
                <span>Fullscreen</span>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground ml-2">M</kbd>
                <span>Mute</span>
              </div>
              
              <button
                onClick={toggleMute}
                tabIndex={0}
                className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-foreground" />
                ) : (
                  <Volume2 className="w-5 h-5 text-foreground" />
                )}
              </button>
              
              <button
                onClick={toggleFullscreen}
                tabIndex={0}
                className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                title="Fullscreen (F)"
              >
                <Maximize className="w-5 h-5 text-foreground" />
              </button>
              
              {isPiPSupported && (
                <button
                  onClick={togglePiP}
                  tabIndex={0}
                  className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    isPiPActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-muted text-foreground"
                  }`}
                  title="Picture-in-Picture"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                tabIndex={0}
                className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
          
          {/* Video Container */}
          <div className="relative aspect-video bg-navy-deep">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm mt-3">Loading stream...</p>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="w-14 h-14 text-destructive mb-4" />
                <h4 className="text-foreground font-semibold text-lg mb-2">{error.message}</h4>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">{error.details}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    tabIndex={0}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    tabIndex={0}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
              autoPlay
              tabIndex={0}
            />
            
            {/* Center play/pause overlay for TV remotes */}
            {!loading && !error && (
              <button
                onClick={togglePlayPause}
                tabIndex={0}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity bg-navy-deep/30 focus:outline-none"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center glow-saffron">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-primary-foreground" />
                  ) : (
                    <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
