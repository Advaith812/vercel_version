import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply } from "@/types/message.types";
import { MessageCircle, Reply as ReplyIcon } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";

interface MessageItemProps {
  id: string;
  content: string;
  created_at: string;
  replies: Reply[];
  replyingTo: string | null;
  replyContent: string;
  isSubmitting: boolean;
  isSavedView?: boolean;
  onReplyClick: (messageId: string) => void;
  onReplyChange: (content: string) => void;
  onReplySubmit: (messageId: string) => void;
  onReplyCancel: () => void;
}

export const MessageItem = ({
  id,
  content,
  created_at,
  replies,
  replyingTo,
  replyContent,
  isSubmitting,
  isSavedView = false,
  onReplyClick,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
}: MessageItemProps) => {
  const session = useSession();

  // Determine message alignment based on the view type and sender
  const shouldAlignRight = (senderId?: string | null) => {
    if (isSavedView) {
      // In saved view (Inbox2): Initial messages and current user's messages are right-aligned
      return senderId === session?.user?.id;
    } else {
      // In regular view (Inbox1): Only current user's messages are right-aligned
      return senderId === session?.user?.id;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        {/* Initial message */}
        <div className={`flex ${shouldAlignRight(session?.user?.id) ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] p-3 rounded-2xl ${
            shouldAlignRight(session?.user?.id)
              ? 'bg-purple-100 rounded-tr-none' 
              : 'bg-white rounded-tl-none shadow-sm'
          }`}>
            <div className="flex items-start gap-2">
              <MessageCircle className={`w-4 h-4 mt-1 ${
                shouldAlignRight(session?.user?.id) ? 'text-purple-500' : 'text-gray-500'
              }`} />
              <div>
                <p className="text-gray-800">{content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.map((reply) => (
          <div 
            key={reply.id} 
            className={`flex ${shouldAlignRight(reply.sender_id) ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[80%] p-3 rounded-2xl flex items-start gap-2
                ${shouldAlignRight(reply.sender_id)
                  ? 'bg-purple-100 rounded-tr-none' 
                  : 'bg-white rounded-tl-none shadow-sm'
                }
              `}
            >
              <ReplyIcon className={`w-4 h-4 mt-1 ${
                shouldAlignRight(reply.sender_id) ? 'text-purple-500' : 'text-gray-500'
              }`} />
              <div>
                <p className="text-gray-800">{reply.content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(reply.created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {replyingTo === id ? (
        <div className="space-y-3">
          <Textarea
            value={replyContent}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder="Write your reply..."
            className="min-h-[100px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onReplySubmit(id)}
              disabled={isSubmitting || !replyContent.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Sending..." : "Send Reply"}
            </Button>
            <Button
              variant="outline"
              onClick={onReplyCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => onReplyClick(id)}
          className="w-full"
        >
          Reply
        </Button>
      )}
    </div>
  );
};