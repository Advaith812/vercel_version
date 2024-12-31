import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessageInputProps {
  content: string;
  isSubmitting: boolean;
  showEmojiPicker: boolean;
  onContentChange: (content: string) => void;
  onEmojiSelect: (emoji: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEmojiPickerToggle: (show: boolean) => void;
}

export const MessageInput = ({
  content,
  isSubmitting,
  showEmojiPicker,
  onContentChange,
  onEmojiSelect,
  onSubmit,
  onEmojiPickerToggle,
}: MessageInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        onSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your reply... (Shift + Enter for new line)"
            className="min-h-[50px] max-h-[120px] resize-y bg-gray-50 border-gray-200 pr-10 whitespace-pre-line"
            disabled={isSubmitting}
          />
          <Popover open={showEmojiPicker} onOpenChange={onEmojiPickerToggle}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2 h-6 w-6"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end">
              <Picker
                data={data}
                onEmojiSelect={onEmojiSelect}
                theme="light"
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button 
          type="submit"
          size="icon"
          className="bg-emerald-600 hover:bg-emerald-700 h-[50px] w-[50px] shrink-0"
          disabled={isSubmitting || !content.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};