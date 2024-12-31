import { formatDistanceToNow } from "date-fns";
import { useSession } from "@supabase/auth-helpers-react";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isVisitor: boolean;
  isSavedView?: boolean;
  senderId?: string | null;
  isFirstMessage?: boolean;
}

export const MessageBubble = ({ 
  content, 
  timestamp,
  isVisitor,
  isSavedView = false,
  senderId,
  isFirstMessage = false
}: MessageBubbleProps) => {
  const session = useSession();
  
  // Alignment logic for different views:
  // 1. Normal conversation view (isSavedView = false):
  //    - Visitor messages are right-aligned
  //    - Non-visitor messages are left-aligned
  // 2. Saved view (isSavedView = true):
  //    - First message or current user's messages are right-aligned
  //    - Other messages are left-aligned
  const shouldAlignRight = isSavedView
    ? isFirstMessage || senderId === session?.user?.id
    : isVisitor;
  
  return (
    <div className={`flex ${shouldAlignRight ? "justify-end" : "justify-start"}`}>
      <div 
        className={`
          rounded-2xl p-3 max-w-[80%] break-words
          ${shouldAlignRight
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