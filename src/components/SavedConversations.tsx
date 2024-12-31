import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatThread } from "./ChatThread";
import { Message } from "@/types/message.types";

interface SavedConversation {
  id: string;
  conversation_id: string;
  created_at: string;
  was_visitor: boolean;
  messages: Message[];
}

export const SavedConversations = () => {
  const session = useSession();
  const { toast } = useToast();

  const { data: savedConversations, isLoading } = useQuery({
    queryKey: ["saved-conversations", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // First fetch saved conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("saved_conversations")
        .select("*")
        .eq("profile_id", session.user.id)
        .order("created_at", { ascending: false });

      if (conversationsError) {
        console.error("Error fetching saved conversations:", conversationsError);
        throw conversationsError;
      }

      // Then fetch messages for each conversation
      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conversation) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select(`
              *,
              replies (
                id,
                content,
                created_at,
                sender_id,
                is_from_visitor
              )
            `)
            .eq("conversation_id", conversation.conversation_id)
            .order("created_at", { ascending: true });

          if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            return {
              ...conversation,
              messages: [],
            };
          }

          return {
            ...conversation,
            messages: messagesData || [],
          };
        })
      );

      return conversationsWithMessages as SavedConversation[];
    },
    enabled: !!session?.user?.id,
  });

  const copyToClipboard = (conversationId: string) => {
    // Create URL using window.location.protocol and window.location.host
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const url = `${baseUrl}/view/${conversationId}`;
    
    console.log("Copying URL:", url); // Debug log
    
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Conversation URL has been copied to clipboard",
      });
    }).catch(error => {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard",
        variant: "destructive"
      });
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!savedConversations?.length) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-8">
          <div className="text-center space-y-2">
            <MessageCircle className="w-12 h-12 mx-auto text-primary opacity-50" />
            <h3 className="font-semibold text-lg text-primary">No Saved Conversations</h3>
            <p className="text-sm text-gray-600">
              Your saved conversations will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Saved Conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {savedConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(conversation.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(conversation.conversation_id)}
                      className="text-gray-500 hover:text-primary"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Link to={`/view/${conversation.conversation_id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ChatThread messages={conversation.messages} isSavedView={true} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};