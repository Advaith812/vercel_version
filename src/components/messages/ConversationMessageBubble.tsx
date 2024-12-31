import { formatDistanceToNow } from "date-fns";

interface ConversationMessageBubbleProps {
  content: string;
  timestamp: string;
  isVisitor: boolean;
}

export const ConversationMessageBubble = ({ 
  content, 
  timestamp,
  isVisitor,
}: ConversationMessageBubbleProps) => {
  // In conversation view: visitor messages are right-aligned, others are left
  const isRightAligned = isVisitor;
  
  return (
    <div className={`flex ${isRightAligned ? "justify-end" : "justify-start"}`}>
      <div 
        className={`
          rounded-2xl p-3 max-w-[80%] break-words
          ${isRightAligned
            ? "bg-purple-100 rounded-tr-none" 
            : "bg-white rounded-tl-none shadow-sm"
          }
        `}
      >
        <p className="text-gray-800">
          {content}
        </p>
        <p className="text-[11px] text-gray-500 mt-1">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};