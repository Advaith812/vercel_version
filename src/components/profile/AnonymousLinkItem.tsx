import { Button } from "@/components/ui/button";
import { Copy, Instagram, RefreshCw, Twitter, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AnonymousLinkItemProps {
  link: {
    id: string;
    name: string;
    created_at: string;
    link_id: string;
  };
  userProfile: {
    display_name: string | null;
  } | null;
  onShare: (linkId: string) => void;
  onCopy: (linkId: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AnonymousLinkItem = ({ 
  link, 
  userProfile, 
  onShare, 
  onCopy,
  onRefresh,
  isRefreshing 
}: AnonymousLinkItemProps) => {
  const { toast } = useToast();
  const linkUrl = `${window.location.origin}/message/${link.link_id}`;

  const handleWhatsAppShare = async () => {
    const text = `Send me an anonymous message! 💭\n${linkUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Opening WhatsApp",
      description: "Your link will be shared via WhatsApp Status",
    });
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(linkUrl);
    toast({
      title: "Link copied!",
      description: "Now you can paste it in your Instagram bio",
    });
  };

  const handleTwitterShare = () => {
    const text = `Send me an anonymous message! 💭`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(linkUrl)}`;
    window.open(twitterUrl, '_blank');
    
    toast({
      title: "Opening Twitter",
      description: "Your link will be shared on Twitter",
    });
  };

  const handleSnapchatShare = () => {
    navigator.clipboard.writeText(linkUrl);
    toast({
      title: "Link copied!",
      description: "Now you can paste it in your Snapchat story",
    });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border animate-fadeIn">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-primary">✨ Your Magic Message Box ✨</h2>
        <p className="text-gray-600 text-sm">
          Sprinkle this link around and watch as secret thoughts bloom into your inbox! 🌟💌
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={linkUrl}
          readOnly
          className="w-full p-2 text-center bg-gray-50 border rounded-lg text-gray-700 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Button
          onClick={() => onCopy(link.link_id)}
          className="w-full bg-[#34495e] hover:bg-[#2c3e50] text-white font-semibold py-4"
        >
          <Copy className="mr-2 h-4 w-4" />
          COPY THIS MAGIC LINK ✨
        </Button>

        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="secondary"
          className="w-full bg-[#34495e] hover:bg-[#2c3e50] text-white font-semibold py-4"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          PEEK AT NEW MESSAGES 👀
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleWhatsAppShare}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3"
          >
            Share the Magic 💫
          </Button>

          <Button
            onClick={handleInstagramShare}
            className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white font-semibold py-3"
          >
            <Instagram className="mr-2 h-4 w-4" />
            Sprinkle on Insta ✨
          </Button>

          <Button
            onClick={handleTwitterShare}
            className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-semibold py-3"
          >
            <Twitter className="mr-2 h-4 w-4" />
            Tweet the Magic 🐦
          </Button>

          <Button
            onClick={handleSnapchatShare}
            className="w-full bg-[#FFFC00] hover:bg-[#F7E300] text-black font-semibold py-3"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Share on Snap 👻
          </Button>
        </div>
      </div>
    </div>
  );
};