import { Message } from "@/types/message.types";
import { RegularInboxMessage } from "../messages/RegularInboxMessage";
import { SavedInboxMessage } from "../messages/SavedInboxMessage";

interface ThreadListProps {
  messages: Message[];
  expandedMessage: string | null;
  replyingTo: string | null;
  replyContent: string;
  isSubmitting: boolean;
  isSavedView: boolean;
  onExpand: (id: string) => void;
  onReplyClick: (id: string) => void;
  onReplyChange: (content: string) => void;
  onReplySubmit: (id: string) => void;
  onReplyCancel: () => void;
}

export const ThreadList = ({
  messages,
  expandedMessage,
  replyingTo,
  replyContent,
  isSubmitting,
  isSavedView,
  onExpand,
  onReplyClick,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
}: ThreadListProps) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          {isSavedView ? (
            <SavedInboxMessage
              id={message.id}
              content={message.content}
              created_at={message.created_at}
              replies={message.replies || []}
              senderId={message.recipient_id}
              isExpanded={expandedMessage === message.id}
              replyingTo={replyingTo}
              replyContent={replyContent}
              isSubmitting={isSubmitting}
              onExpand={() => onExpand(message.id)}
              onReplyClick={onReplyClick}
              onReplyChange={onReplyChange}
              onReplySubmit={onReplySubmit}
              onReplyCancel={onReplyCancel}
            />
          ) : (
            <RegularInboxMessage
              id={message.id}
              content={message.content}
              created_at={message.created_at}
              replies={message.replies || []}
              senderId={message.recipient_id}
              isExpanded={expandedMessage === message.id}
              replyingTo={replyingTo}
              replyContent={replyContent}
              isSubmitting={isSubmitting}
              onExpand={() => onExpand(message.id)}
              onReplyClick={onReplyClick}
              onReplyChange={onReplyChange}
              onReplySubmit={onReplySubmit}
              onReplyCancel={onReplyCancel}
            />
          )}
        </div>
      ))}
    </div>
  );
};