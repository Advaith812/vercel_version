import { MessageDate } from "./MessageDate";

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isVisitor: boolean;
}

export const ChatBubble = ({ content, timestamp, isVisitor }: ChatBubbleProps) => (
  <div className={`flex ${isVisitor ? "justify-end" : "justify-start"} mb-4`}>
    <div
      className={`
        max-w-[80%] rounded-lg p-3 break-words
        ${
          isVisitor
            ? "bg-purple-100 rounded-tr-none text-purple-900"  // Visitor messages (right-aligned)
            : "bg-white rounded-tl-none shadow-sm text-gray-800"  // Received messages (left-aligned)
        }
      `}
    >
      <p className="text-inherit">{content}</p>
      <MessageDate timestamp={timestamp} />
    </div>
  </div>
);