import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  content: string;
  setContent: (content: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const MessageInput = ({ 
  content, 
  setContent, 
  onSubmit, 
  isSubmitting 
}: MessageInputProps) => {
  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 bg-white p-4 border-t">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="min-h-[50px] max-h-[120px] resize-none bg-gray-50 border-gray-200"
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        size="icon"
        className="bg-purple-600 hover:bg-purple-700 h-[50px] w-[50px] shrink-0"
        disabled={isSubmitting || !content.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};