import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationHeader } from "@/components/conversation/ConversationHeader";
import { ChatThread } from "@/components/conversation/ChatThread";
import { MessageInput } from "@/components/conversation/MessageInput";
import { SaveAndRedirect } from "@/components/conversation/SaveAndRedirect";

const ViewMessages = () => {
  const { id: conversationId } = useParams();
  const { toast } = useToast();
  const session = useSession();
  const { isLoading: isSessionLoading } = useSessionContext();
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // Save conversation to user's profile
  const saveConversation = async (userId: string, convId: string) => {
    if (!userId || !convId || hasAttemptedSave) return;
    
    setIsSaving(true);
    setHasAttemptedSave(true);
    
    try {
      // Check if conversation is already saved
      const { data: existingSave } = await supabase
        .from('saved_conversations')
        .select('id')
        .eq('profile_id', userId)
        .eq('conversation_id', convId)
        .maybeSingle();

      if (existingSave) {
        console.log('Conversation already saved');
        return;
      }

      const { error } = await supabase
        .from('saved_conversations')
        .insert({
          profile_id: userId,
          conversation_id: convId
        });

      if (error) throw error;

      toast({
        title: "Conversation Saved",
        description: "This conversation has been saved to your profile.",
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: "Error",
        description: "Failed to save the conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && conversationId) {
        setHasAttemptedSave(false); // Reset the save attempt flag on new sign in
        await saveConversation(session.user.id, conversationId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  // Auto-save for already logged in users
  useEffect(() => {
    if (session?.user?.id && conversationId && !hasAttemptedSave) {
      saveConversation(session.user.id, conversationId);
    }
  }, [session?.user?.id, conversationId, hasAttemptedSave]);

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) {
        throw new Error("No conversation ID provided");
      }

      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(`
          *,
          replies (
            id,
            content,
            sender_id,
            created_at,
            is_from_visitor
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("Error fetching messages:", fetchError);
        throw fetchError;
      }

      return data;
    },
    enabled: !!conversationId
  });

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting || !messages?.[0]) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("replies").insert({
        message_id: messages[0].id,
        content: replyContent.trim(),
        is_from_visitor: true
      });

      if (error) {
        console.error("Error sending reply:", error);
        toast({
          title: "Error",
          description: "Failed to send reply. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setReplyContent("");
      toast({
        title: "Success",
        description: "Reply sent successfully!",
      });
      refetch();
    } catch (error) {
      console.error("Error in handleReply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add SaveAndRedirect component for logged-in users
  if (session && conversationId) {
    return <SaveAndRedirect conversationId={conversationId} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 w-full flex-1 flex flex-col">
        {!session && !isSessionLoading && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 flex items-center justify-between shadow-sm my-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-primary">Want to save this conversation?</h3>
              <p className="text-sm text-gray-600">
                Register or login to keep track of all your conversations
              </p>
            </div>
            <Link to={`/auth?conversation=${conversationId}`}>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
                disabled={isSaving}
              >
                <LogIn className="w-4 h-4" />
                Register/Login to Save
              </Button>
            </Link>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <ConversationHeader />
          </div>
          {messages?.length ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <ChatThread messages={messages} isSavedView={!!session} />
              </div>
              <div className="p-4 border-t bg-gray-50">
                <MessageInput
                  content={replyContent}
                  setContent={setReplyContent}
                  onSubmit={handleReply}
                  isSubmitting={isSubmitting}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500">No messages in this conversation.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMessages;
