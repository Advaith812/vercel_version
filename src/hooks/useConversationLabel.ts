import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useConversationLabel = (conversationId: string) => {
  const session = useSession();
  const [labelText, setLabelText] = useState("");
  const [currentLabel, setCurrentLabel] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLabel = async () => {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('conversation_tags')
        .select('name')
        .eq('conversation_id', conversationId)
        .eq('profile_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching label:', error);
        return;
      }
      
      if (data) {
        setCurrentLabel(data.name);
        setLabelText(data.name);
      } else {
        setCurrentLabel(null);
        setLabelText("");
      }
    };

    fetchLabel();
  }, [conversationId, session?.user?.id]);

  const handleSaveLabel = async () => {
    if (!session?.user?.id || !labelText.trim()) return;

    try {
      if (currentLabel) {
        // Update existing tag
        const { error } = await supabase
          .from('conversation_tags')
          .update({ name: labelText.trim() })
          .eq('conversation_id', conversationId)
          .eq('profile_id', session.user.id);

        if (error) throw error;
      } else {
        // Insert new tag
        const { error } = await supabase
          .from('conversation_tags')
          .insert({
            conversation_id: conversationId,
            profile_id: session.user.id,
            name: labelText.trim()
          });

        if (error) throw error;
      }

      setCurrentLabel(labelText.trim());
      toast({
        title: "Success",
        description: `Label ${currentLabel ? 'updated' : 'added'} successfully`,
      });
    } catch (error) {
      console.error('Error saving label:', error);
      toast({
        title: "Error",
        description: "Failed to save label",
        variant: "destructive",
      });
    }
  };

  return {
    labelText,
    setLabelText,
    currentLabel,
    handleSaveLabel
  };
};