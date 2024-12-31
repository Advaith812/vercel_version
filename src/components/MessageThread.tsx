import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message.types";
import { MessageForm } from "@/components/MessageForm";
import { MessageList } from "@/components/MessageList";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export const MessageThread = () => {
  const { conversationId } = useParams();
  const session = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    console.log("Fetching messages for conversation:", conversationId);
    if (!conversationId) return;

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        replies (
          *
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    console.log("Fetched messages:", messages);
    setMessages(messages || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to messages changes
    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Message change received!", payload);
          fetchMessages(); // Refresh all messages to ensure consistency
        }
      )
      .subscribe((status) => {
        console.log(`Messages channel status: ${status}`);
      });

    // Subscribe to replies changes for any message in this conversation
    const repliesChannel = supabase
      .channel(`replies:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "replies",
        },
        (payload) => {
          console.log("Reply change received!", payload);
          fetchMessages(); // Refresh all messages to get updated replies
        }
      )
      .subscribe((status) => {
        console.log(`Replies channel status: ${status}`);
      });

    return () => {
      console.log("Cleaning up subscriptions...");
      messagesChannel.unsubscribe();
      repliesChannel.unsubscribe();
    };
  }, [conversationId]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!messages.length) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="space-y-6">
        {!session && (
          <div className="bg-accent rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <h3 className="font-semibold text-primary">Want to save this conversation?</h3>
              <p className="text-sm text-gray-600">
                Register now to keep track of all your conversations
              </p>
            </div>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <LogIn className="w-4 h-4" />
                Register to Save
              </Button>
            </Link>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border h-[500px] flex flex-col">
          <MessageList messages={messages} />
          <MessageForm conversationId={conversationId!} />
        </div>
      </div>
    </div>
  );
};