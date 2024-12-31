import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LabelDialogProps {
  currentLabel: string | null;
  labelText: string;
  onLabelTextChange: (value: string) => void;
  onSave: () => void;
}

export const LabelDialog = ({
  currentLabel,
  labelText,
  onLabelTextChange,
  onSave,
}: LabelDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
          <Tag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentLabel ? 'Edit' : 'Add'} Label</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={labelText}
            onChange={(e) => onLabelTextChange(e.target.value)}
            placeholder="Enter label text"
          />
          <Button onClick={onSave} disabled={!labelText.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};