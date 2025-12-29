import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, PictureInPicture2, X } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function VideoPlayer({ url, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);

  useEffect(() => {
    // Check PiP support
    setIsPiPSupported(
      "pictureInPictureEnabled" in document && document.pictureInPictureEnabled
    );
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(console.error);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError("This stream is currently unavailable. Please try another channel.");
              setLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setLoading(false);
        video.play().catch(console.error);
      });
      video.addEventListener("error", () => {
        setError("This stream is currently unavailable. Please try another channel.");
        setLoading(false);
      });
    } else {
      setError("Your browser does not support HLS streaming.");
      setLoading(false);
    }

    // PiP event listeners
    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, [url]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/95 backdrop-blur-md">
      <div className="relative w-full max-w-6xl mx-4">
        <div className="glass-card rounded-2xl overflow-hidden shadow-elevated">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <div className="flex items-center gap-2">
              {isPiPSupported && (
                <button
                  onClick={togglePiP}
                  className={`p-2 rounded-lg transition-colors ${
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
                className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
          {/* Video */}
          <div className="relative aspect-video bg-navy-deep">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-foreground font-medium">{error}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Some streams may be geo-restricted or temporarily offline.
                </p>
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
              autoPlay
            />
          </div>
        </div>
      </div>
    </div>
  );
}
