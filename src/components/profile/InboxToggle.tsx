import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, BookmarkCheck } from "lucide-react";
import { useConversationNotifications } from "@/hooks/useConversationNotifications";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface InboxToggleProps {
  view: "messages" | "conversations" | "saved";
  onViewChange: (view: "messages" | "conversations" | "saved") => void;
}

export const InboxToggle = ({ view, onViewChange }: InboxToggleProps) => {
  const { data: notificationCount, refetch } = useConversationNotifications();
  const session = useSession();
  const [hasUnreadConversations, setHasUnreadConversations] = useState(false);

  useEffect(() => {
    if (notificationCount > 0) {
      setHasUnreadConversations(true);
    }
  }, [notificationCount]);

  useEffect(() => {
    if (view === "conversations" && session?.user?.id) {
      const resetNotifications = async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: repliedMessageIds } = await supabase
          .from("replies")
          .select("message_id")
          .eq("sender_id", session.user.id);

        const messageIdsWithReplies = repliedMessageIds?.map(r => r.message_id) || [];

        if (messageIdsWithReplies.length > 0) {
          await supabase
            .from("messages")
            .update({ read: true })
            .eq("recipient_id", session.user.id)
            .in("id", messageIdsWithReplies)
            .gte("created_at", sevenDaysAgo.toISOString());
        }

        setHasUnreadConversations(false);
        refetch();
      };

      resetNotifications();
    }
  }, [view, session?.user?.id, refetch]);

  return (
    <div className="flex gap-1 p-1.5 bg-accent rounded-lg">
      <Button
        variant={view === "messages" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("messages")}
        className="flex gap-1 text-xs sm:text-sm"
      >
        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Messages</span>
        <span className="sm:hidden">Msg</span>
      </Button>
      <Button
        variant={view === "conversations" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("conversations")}
        className="flex gap-1 relative text-xs sm:text-sm"
      >
        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Conversations</span>
        <span className="sm:hidden">Chat</span>
        {hasUnreadConversations && view !== "conversations" && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
          >
            {notificationCount}
          </Badge>
        )}
      </Button>
      <Button
        variant={view === "saved" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("saved")}
        className="flex gap-1 text-xs sm:text-sm"
      >
        <BookmarkCheck className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Saved</span>
        <span className="sm:hidden">Save</span>
      </Button>
    </div>
  );
};