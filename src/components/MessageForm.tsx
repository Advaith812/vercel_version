import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface MessageFormProps {
  linkId?: string;
  recipientName?: string;
  conversationId?: string;
}

export const MessageForm = ({ linkId, recipientName, conversationId }: MessageFormProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use linkId prop if provided, otherwise fall back to URL param
  const activeLinkId = linkId || id;

  const validateMessage = (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateLinkId = (linkId: string | undefined) => {
    if (!linkId) {
      toast({
        title: "Invalid Link",
        description: "This link appears to be invalid.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const getRecipientProfile = async (linkId: string) => {
    const { data, error } = await supabase
      .from("anonymous_links")
      .select("profile_id")
      .eq("link_id", linkId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      throw new Error("Failed to process message");
    }

    if (!data) {
      throw new Error("Invalid link");
    }

    return data.profile_id;
  };

  const saveToLocalStorage = async (conversationId: string, recipientId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        // Check if the user is the link owner
        const { data: linkData } = await supabase
          .from("anonymous_links")
          .select("profile_id")
          .eq("link_id", id)
          .single();

        // Only save if the user is not the link owner
        if (linkData?.profile_id !== session.session.user.id) {
          const { error: saveError } = await supabase
            .from("saved_conversations")
            .insert({
              conversation_id: conversationId,
              profile_id: session.session.user.id,
              was_visitor: true // Explicitly set to true for visitors
            });

          if (saveError) {
            console.error("Error saving conversation:", saveError);
            throw saveError;
          }
        }
      } else {
        // If not authenticated, save to localStorage
        const storedConversations = localStorage.getItem('anonymousConversations');
        const conversations = storedConversations 
          ? JSON.parse(storedConversations) 
          : [];
        
        if (!conversations.includes(conversationId)) {
          conversations.push(conversationId);
          localStorage.setItem('anonymousConversations', JSON.stringify(conversations));
        }
      }
    } catch (error) {
      console.error("Error in saveToLocalStorage:", error);
      // Fallback to localStorage
      const storedConversations = localStorage.getItem('anonymousConversations');
      const conversations = storedConversations 
        ? JSON.parse(storedConversations) 
        : [];
      
      if (!conversations.includes(conversationId)) {
        conversations.push(conversationId);
        localStorage.setItem('anonymousConversations', JSON.stringify(conversations));
      }
    }
  };

  const createMessage = async (recipientId: string, content: string) => {
    const conversation_id = crypto.randomUUID();
    
    const { error: messageError } = await supabase
      .from("messages")
      .insert([
        {
          content: content.trim(),
          recipient_id: recipientId,
          is_anonymous: true,
          conversation_id,
          link_id: id
        }
      ]);

    if (messageError) {
      console.error("Message creation error:", messageError);
      throw messageError;
    }

    // Save conversation ID with recipient info
    await saveToLocalStorage(conversation_id, recipientId);

    return conversation_id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMessage(message) || !validateLinkId(activeLinkId)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const recipientId = await getRecipientProfile(activeLinkId!);
      const conversationId = await createMessage(recipientId, message);

      // Generate conversation URL
      const newConversationUrl = `${window.location.origin}/view/${conversationId}`;
      setConversationUrl(newConversationUrl);

      // Show success message
      toast({
        title: "Message Sent!",
        description: "Your message has been delivered successfully.",
      });

      // Show URL copy toast
      toast({
        title: "Save This Link",
        description: "Use this link to continue the conversation:",
        action: <Button onClick={() => navigator.clipboard.writeText(newConversationUrl)}>Copy Link</Button>,
        duration: 10000,
      });

      // Reset form
      setMessage("");
      
      // Navigate after a delay
      setTimeout(() => {
        navigate(`/view/${conversationId}`);
      }, 2000);

    } catch (error) {
      console.error("Message submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
      <div className="space-y-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Write your anonymous message${recipientName ? ` to ${recipientName}` : ''}...`}
          className="min-h-[150px] resize-none"
          disabled={isSubmitting}
          required
        />
        {message.length > 0 && (
          <p className="text-sm text-gray-500 text-right">
            {message.length} characters
          </p>
        )}
      </div>
      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={isSubmitting || !message.trim()}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
      
      {conversationUrl && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Conversation Link:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={conversationUrl}
              readOnly
              className="flex-1 p-2 text-sm bg-white border border-gray-300 rounded"
            />
            <Button
              onClick={() => navigator.clipboard.writeText(conversationUrl)}
              variant="outline"
              size="sm"
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};