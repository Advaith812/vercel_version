import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConversationHeader } from "./conversation/ConversationHeader";
import { MessageThread } from "./conversation/MessageThread";
import { ReplyHandler } from "./conversation/ReplyHandler";
import { Message } from "@/types/message.types";

interface MessageListProps {
  messages: Message[];
  isSavedView?: boolean;
}

export const MessageList = ({ messages, isSavedView = false }: MessageListProps) => {
  const { id: conversationId } = useParams();

  const { data: fetchedMessages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      console.log("Fetching messages for conversation:", conversationId);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          replies (
            id,
            content,
            sender_id,
            created_at,
            is_from_visitor
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Fetched messages:", data);
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  const displayMessages = messages || fetchedMessages;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (!displayMessages?.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">No messages in this conversation yet.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <ConversationHeader />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <MessageThread messages={displayMessages} isSavedView={isSavedView} />
      </div>
      <div className="p-4 border-t bg-gray-50">
        <ReplyHandler 
          messageId={displayMessages[0].id} 
          conversationId={conversationId!}
        />
      </div>
    </div>
  );
};