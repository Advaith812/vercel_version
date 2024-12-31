import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AnonymousConversations = () => {
  const [conversations, setConversations] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get conversation IDs from localStorage
    const storedConversations = localStorage.getItem('anonymousConversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  if (!conversations.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary">Your Anonymous Conversations</h2>
      <div className="grid gap-4">
        {conversations.map((conversationId) => (
          <div
            key={conversationId}
            className="bg-white rounded-lg shadow p-4 border border-gray-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="font-medium">Conversation #{conversationId.slice(0, 8)}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/view/${conversationId}`)}
            >
              View Conversation
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};