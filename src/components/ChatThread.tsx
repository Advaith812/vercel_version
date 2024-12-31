import { Message } from "@/types/message.types";
import { ConversationMessageBubble } from "./messages/ConversationMessageBubble";

interface ChatThreadProps {
  messages: Message[];
  isSavedView?: boolean;
}

export const ChatThread = ({ messages, isSavedView = false }: ChatThreadProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <div key={message.id} className="space-y-4">
          <ConversationMessageBubble
            content={message.content}
            timestamp={message.created_at}
            isVisitor={!!message.link_id}
          />
          
          {message.replies?.map((reply) => (
            <ConversationMessageBubble
              key={reply.id}
              content={reply.content}
              timestamp={reply.created_at}
              isVisitor={reply.is_from_visitor}
            />
          ))}
        </div>
      ))}
    </div>
  );
};