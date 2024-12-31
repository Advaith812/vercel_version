import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ReplyFormProps {
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleReply: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const ReplyForm = ({ 
  replyContent, 
  setReplyContent, 
  handleReply,
  isSubmitting 
}: ReplyFormProps) => {
  return (
    <form onSubmit={handleReply} className="flex items-end gap-2">
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Type your message..."
        className="min-h-[40px] max-h-[120px] resize-none bg-gray-50 border-gray-200"
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        size="icon"
        className="bg-primary hover:bg-primary/90 h-[40px] w-[40px] shrink-0"
        disabled={isSubmitting || !replyContent.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};