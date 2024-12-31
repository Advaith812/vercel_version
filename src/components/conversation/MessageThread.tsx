import { Message } from "@/types/message.types";
import { MessageBubble } from "./MessageBubble";
import { MessageCircle } from "lucide-react";

interface MessageThreadProps {
  messages: Message[];
  isSavedView?: boolean;
}

export const MessageThread = ({ messages }: MessageThreadProps) => {
  const messageCount = messages.reduce((count, message) => {
    return count + 1 + (message.replies?.length || 0);
  }, 0);

  return (
    <>
      <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {messageCount} message{messageCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="space-y-4">
            <MessageBubble
              content={message.content}
              timestamp={message.created_at}
              isVisitor={!!message.link_id}
            />
            
            {message.replies && message.replies.length > 0 && (
              <div className="space-y-3 ml-8">
                {message.replies.map((reply) => (
                  <MessageBubble
                    key={reply.id}
                    content={reply.content}
                    timestamp={reply.created_at}
                    isVisitor={reply.is_from_visitor}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};