import { format } from "date-fns";
import { Reply } from "@/types/message.types";

interface ReplyListProps {
  replies: Reply[];
}

export const ReplyList = ({ replies }: ReplyListProps) => {
  if (!replies?.length) return null;

  return (
    <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
      {replies.map((reply) => (
        <div 
          key={reply.id} 
          className={`rounded p-3 ${
            reply.is_from_visitor 
              ? 'bg-blue-50' 
              : 'bg-purple-50'
          }`}
        >
          <p className="text-gray-800">{reply.content}</p>
          <div className="text-sm text-gray-500 mt-2">
            {format(new Date(reply.created_at), 'MMM d, yyyy h:mm a')}
            <span className="ml-2 text-xs">
              {reply.is_from_visitor ? '(Visitor)' : '(You)'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};