import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReplyForm } from "../ReplyForm";

interface ReplyHandlerProps {
  messageId: string;
  conversationId: string;
}

export const ReplyHandler = ({ messageId, conversationId }: ReplyHandlerProps) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    console.log("Sending reply for message:", messageId);
    console.log("Reply content:", replyContent);

    try {
      const { data, error } = await supabase
        .from("replies")
        .insert({
          message_id: messageId,
          content: replyContent.trim(),
          is_from_visitor: true
        })
        .select();

      if (error) {
        console.error("Error sending reply:", error);
        toast({
          title: "Error",
          description: "Failed to send reply. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Reply sent successfully:", data);
      setReplyContent("");
      toast({
        title: "Success",
        description: "Reply sent successfully!",
      });
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

  return (
    <ReplyForm
      replyContent={replyContent}
      setReplyContent={setReplyContent}
      handleReply={handleReply}
      isSubmitting={isSubmitting}
    />
  );
};