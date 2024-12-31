import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LabelDialog } from "./LabelDialog";

interface MessagePreviewProps {
  content: string;
  timestamp: string;
  repliesCount: number;
  currentLabel?: string | null;
  labelText: string;
  isExpanded: boolean;
  onLabelTextChange: (text: string) => void;
  onSaveLabel: () => void;
  onToggleExpand: () => void;
}

export const MessagePreview = ({
  content,
  timestamp,
  repliesCount,
  currentLabel,
  labelText,
  isExpanded,
  onLabelTextChange,
  onSaveLabel,
  onToggleExpand,
}: MessagePreviewProps) => {
  return (
    <div 
      onClick={onToggleExpand}
      className="p-4 flex items-center justify-between cursor-pointer"
    >
      <div className="flex-1">
        <p className="text-gray-800 line-clamp-2 whitespace-pre-line">{content}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">
            {format(new Date(timestamp), 'MMM d, h:mm a')}
          </p>
          {repliesCount > 0 && (
            <span className="text-xs text-gray-500">
              · {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
            </span>
          )}
          {currentLabel && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {currentLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LabelDialog
          currentLabel={currentLabel}
          labelText={labelText}
          onLabelTextChange={onLabelTextChange}
          onSave={onSaveLabel}
        />
        <Button variant="ghost" size="icon">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};