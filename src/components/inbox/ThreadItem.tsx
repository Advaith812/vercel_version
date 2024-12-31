import { useEffect, useState } from "react";
import { Message } from "@/types/message.types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MessageItem } from "./MessageItem";
import { supabase } from "@/integrations/supabase/client";

interface ThreadItemProps {
  message: Message;
  isExpanded: boolean;
  isReplying: boolean;
  replyContent: string;
  isSubmitting: boolean;
  isSavedView?: boolean;
  onExpand: () => void;
  onReplyClick: () => void;
  onReplyChange: (content: string) => void;
  onReplySubmit: () => void;
  onReplyCancel: () => void;
}

export const ThreadItem = ({
  message,
  isExpanded,
  isReplying,
  replyContent,
  isSubmitting,
  isSavedView = false,
  onExpand,
  onReplyClick,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
}: ThreadItemProps) => {
  const [latestContent, setLatestContent] = useState(message.content);
  const [latestTimestamp, setLatestTimestamp] = useState(message.created_at);

  useEffect(() => {
    // Update initial state when message prop changes
    setLatestContent(message.content);
    setLatestTimestamp(message.created_at);

    if (message.replies && message.replies.length > 0) {
      const latestReply = message.replies.reduce((latest, current) => 
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest
      );
      setLatestContent(latestReply.content);
      setLatestTimestamp(latestReply.created_at);
    }

    // Subscribe to new replies
    const repliesChannel = supabase
      .channel(`replies:${message.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "replies",
          filter: `message_id=eq.${message.id}`,
        },
        (payload: any) => {
          console.log("Reply change received!", payload);
          if (payload.new) {
            setLatestContent(payload.new.content);
            setLatestTimestamp(payload.new.created_at);
          }
        }
      )
      .subscribe();

    return () => {
      repliesChannel.unsubscribe();
    };
  }, [message]);

  return (
    <div className="rounded-lg shadow-sm border overflow-hidden bg-gradient-to-r from-[#fdfcfb] to-[#e2d1c3]">
      <div
        className="p-4 cursor-pointer hover:bg-opacity-10 hover:bg-white transition-colors"
        onClick={onExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-800 line-clamp-2">{latestContent}</p>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(latestTimestamp).toLocaleDateString()} ·{" "}
              {message.replies?.length || 0} replies
            </p>
          </div>
          <Button variant="ghost" size="icon">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-white bg-opacity-90">
          <MessageItem
            id={message.id}
            content={message.content}
            created_at={message.created_at}
            replies={message.replies || []}
            replyingTo={isReplying ? message.id : null}
            replyContent={replyContent}
            isSubmitting={isSubmitting}
            onReplyClick={onReplyClick}
            onReplyChange={onReplyChange}
            onReplySubmit={onReplySubmit}
            onReplyCancel={onReplyCancel}
          />
        </div>
      )}
    </div>
  );
};