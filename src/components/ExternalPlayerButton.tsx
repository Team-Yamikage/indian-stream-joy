import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { Stream } from "@/types/channel";
import { toast } from "sonner";

interface ExternalPlayerButtonProps {
  stream: Stream;
  className?: string;
}

export function ExternalPlayerButton({ stream, className = "" }: ExternalPlayerButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = async () => {
    try {
      let copyText = stream.url;
      
      // Include headers info if present
      if (stream.referrer || stream.user_agent) {
        copyText = `URL: ${stream.url}`;
        if (stream.referrer) copyText += `\nReferrer: ${stream.referrer}`;
        if (stream.user_agent) copyText += `\nUser-Agent: ${stream.user_agent}`;
      }
      
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success("Stream URL copied!", {
        description: "Paste it in VLC, Kodi, or any OTT player.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const hasHeaders = stream.referrer || stream.user_agent;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        tabIndex={0}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-muted text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title="Open in external player"
      >
        <ExternalLink className="w-4 h-4" />
        <span className="hidden sm:inline">External Player</span>
      </button>

      {showDetails && (
        <div className="absolute top-full mt-2 right-0 w-80 max-w-[90vw] p-4 rounded-xl bg-card border border-border shadow-elevated z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground text-sm">Stream Details</h4>
            <button
              onClick={() => setShowDetails(false)}
              tabIndex={0}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">URL:</span>
              <p className="text-foreground break-all mt-0.5 font-mono bg-secondary/50 p-2 rounded">
                {stream.url}
              </p>
            </div>

            {stream.referrer && (
              <div>
                <span className="text-muted-foreground">Referrer (required):</span>
                <p className="text-amber-400 break-all mt-0.5 font-mono bg-secondary/50 p-2 rounded">
                  {stream.referrer}
                </p>
              </div>
            )}

            {stream.user_agent && (
              <div>
                <span className="text-muted-foreground">User-Agent (required):</span>
                <p className="text-amber-400 break-all mt-0.5 font-mono bg-secondary/50 p-2 rounded">
                  {stream.user_agent}
                </p>
              </div>
            )}

            {hasHeaders && (
              <p className="text-amber-400/80 text-[10px] mt-2">
                ⚠️ This stream requires custom headers. Use VLC/Kodi with header support.
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCopy}
              tabIndex={0}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy {hasHeaders ? "All" : "URL"}
                </>
              )}
            </button>
            <a
              href={stream.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
