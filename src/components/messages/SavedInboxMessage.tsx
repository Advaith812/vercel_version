import { useState, useEffect, useRef } from "react";
import { useConversationLabel } from "@/hooks/useConversationLabel";
import { Reply } from "@/types/message.types";
import { MessagePreview } from "./MessagePreview";
import { MessageContent } from "./MessageContent";
import { MessageInput } from "./MessageInput";

const conversationGradients = [
  "bg-gradient-to-r from-purple-50 to-pink-50",
  "bg-gradient-to-r from-blue-50 to-cyan-50",
  "bg-gradient-to-r from-emerald-50 to-teal-50",
  "bg-gradient-to-r from-orange-50 to-amber-50",
  "bg-gradient-to-r from-rose-50 to-pink-50",
  "bg-gradient-to-r from-violet-50 to-purple-50",
  "bg-gradient-to-r from-cyan-50 to-blue-50",
  "bg-gradient-to-r from-fuchsia-50 to-pink-50"
];

interface SavedInboxMessageProps {
  id: string;
  content: string;
  created_at: string;
  replies: Reply[];
  senderId?: string | null;
  isExpanded: boolean;
  replyingTo: string | null;
  replyContent: string;
  isSubmitting: boolean;
  onExpand: () => void;
  onReplyClick: (messageId: string) => void;
  onReplyChange: (content: string) => void;
  onReplySubmit: (messageId: string) => void;
  onReplyCancel: () => void;
}

export const SavedInboxMessage = ({
  id,
  content,
  created_at,
  replies,
  isExpanded,
  replyingTo,
  replyContent,
  isSubmitting,
  onExpand,
  onReplyClick,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
}: SavedInboxMessageProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { labelText, setLabelText, currentLabel, handleSaveLabel } = useConversationLabel(id);
  const messageContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const gradientIndex = parseInt(id.replace(/[^0-9]/g, ''), 10) % conversationGradients.length;
  const gradientClass = conversationGradients[gradientIndex];

  const onEmojiSelect = (emoji: any) => {
    onReplyChange(replyContent + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReplySubmit(id);
    }
  };

  useEffect(() => {
    if (isExpanded && messageContentRef.current) {
      const scrollContainer = messageContentRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [isExpanded, replies]);

  useEffect(() => {
    if (isExpanded && containerRef.current) {
      const yOffset = -20;
      const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [isExpanded]);

  return (
    <div 
      ref={containerRef}
      className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${gradientClass}`}
    >
      <MessagePreview
        content={content}
        timestamp={created_at}
        repliesCount={replies.length}
        currentLabel={currentLabel}
        labelText={labelText}
        isExpanded={isExpanded}
        onLabelTextChange={setLabelText}
        onSaveLabel={handleSaveLabel}
        onToggleExpand={onExpand}
      />

      {isExpanded && (
        <div className="border-t">
          <div 
            ref={messageContentRef}
            className="max-h-[400px] overflow-y-auto"
          >
            <MessageContent
              content={content}
              created_at={created_at}
              replies={replies}
            />
          </div>
          
          <div className="sticky bottom-0 bg-white border-t p-4">
            <MessageInput
              content={replyContent}
              isSubmitting={isSubmitting}
              showEmojiPicker={showEmojiPicker}
              onContentChange={onReplyChange}
              onEmojiSelect={onEmojiSelect}
              onSubmit={handleSubmit}
              onEmojiPickerToggle={setShowEmojiPicker}
            />
          </div>
        </div>
      )}
    </div>
  );
};