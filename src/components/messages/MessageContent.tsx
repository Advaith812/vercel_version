import { format } from "date-fns";
import { MessageCircle, Reply as ReplyIcon } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { Reply } from "@/types/message.types";

interface MessageContentProps {
  content: string;
  created_at: string;
  replies: Reply[];
}

export const MessageContent = ({
  content,
  created_at,
  replies,
}: MessageContentProps) => {
  const session = useSession();

  return (
    <div className="p-4 space-y-4">
      {/* Initial message */}
      <div className="flex justify-start">
        <div className="max-w-[80%] p-3 bg-white rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-4 h-4 mt-1 text-gray-500" />
            <div>
              <p className="text-gray-800 break-words whitespace-pre-line">{content}</p>
              <div className="text-[11px] text-gray-500 mt-1 flex justify-end">
                {format(new Date(created_at), 'h:mm a')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.map((reply) => (
        <div 
          key={reply.id} 
          className={`flex ${reply.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`
              max-w-[80%] p-3 flex items-start gap-2
              ${reply.sender_id === session?.user?.id
                ? 'bg-[#E7FFE1] rounded-2xl rounded-tr-none' 
                : 'bg-white rounded-2xl rounded-tl-none shadow-sm'
              }
            `}
          >
            <ReplyIcon className={`w-4 h-4 mt-1 ${
              reply.sender_id === session?.user?.id ? 'text-emerald-600' : 'text-gray-500'
            }`} />
            <div>
              <p className="text-gray-800 break-words whitespace-pre-line">{reply.content}</p>
              <div className="text-[11px] text-gray-500 mt-1 flex justify-end">
                {format(new Date(reply.created_at), 'h:mm a')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};