import { formatDistanceToNow } from "date-fns";

interface MessageDateProps {
  timestamp: string;
}

export const MessageDate = ({ timestamp }: MessageDateProps) => (
  <span className="text-[11px] text-gray-500 mt-1">
    {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
  </span>
);