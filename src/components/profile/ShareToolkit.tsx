import { Button } from "@/components/ui/button";
import { Copy, Share, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareToolkitProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  shareUrl?: string;
}

export const ShareToolkit = ({ onRefresh, isRefreshing, shareUrl }: ShareToolkitProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Share Anonymous Message Link",
          url: shareUrl,
        });
      } else {
        handleCopy();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share link",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
      {shareUrl && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};