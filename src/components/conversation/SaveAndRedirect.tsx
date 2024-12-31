import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SaveAndRedirectProps {
  conversationId: string;
}

export const SaveAndRedirect = ({ conversationId }: SaveAndRedirectProps) => {
  const navigate = useNavigate();
  const session = useSession();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(3);
  const [isSaving, setIsSaving] = useState(true);

  useEffect(() => {
    const saveConversation = async () => {
      if (!session?.user?.id) return;

      try {
        // Check if conversation is already saved
        const { data: existingSave } = await supabase
          .from("saved_conversations")
          .select("id")
          .eq("profile_id", session.user.id)
          .eq("conversation_id", conversationId)
          .maybeSingle();

        if (existingSave) {
          setIsSaving(false);
          startCountdown();
          return;
        }

        const { error } = await supabase.from("saved_conversations").insert({
          profile_id: session.user.id,
          conversation_id: conversationId,
          was_visitor: true,
        });

        if (error) throw error;

        toast({
          title: "Conversation saved",
          description: "This conversation has been saved to your inbox.",
        });
        
        setIsSaving(false);
        startCountdown();
      } catch (error) {
        console.error("Error saving conversation:", error);
        toast({
          title: "Error",
          description: "Failed to save conversation. Please try again.",
          variant: "destructive",
        });
      }
    };

    saveConversation();
  }, [session?.user?.id, conversationId, toast]);

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/profile?view=saved");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="p-8">
        <div className="text-center space-y-4">
          {isSaving ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-lg">Saving conversation...</p>
            </>
          ) : (
            <>
              <p className="text-lg">
                Redirecting to your saved conversations in {countdown} seconds...
              </p>
              <p className="text-sm text-muted-foreground">
                You can view this conversation in your saved messages.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};