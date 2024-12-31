import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message.types";

const MESSAGES_PER_PAGE = 10;

export const useSavedConversations = (currentPage: number) => {
  const session = useSession();

  return useQuery({
    queryKey: ["saved-conversations", session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Get saved conversation IDs
      const { data: savedConversations } = await supabase
        .from("saved_conversations")
        .select("conversation_id")
        .eq("profile_id", session.user.id)
        .order("created_at", { ascending: false });

      const conversationIds = savedConversations?.map(sc => sc.conversation_id) || [];

      if (conversationIds.length === 0) {
        return {
          messages: [],
          totalCount: 0,
          totalPages: 0,
        };
      }

      const { data: messages, error: messagesError, count } = await supabase
        .from("messages")
        .select(`
          *,
          replies (
            id,
            content,
            created_at,
            sender_id,
            is_from_visitor
          )
        `, { count: 'exact' })
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * MESSAGES_PER_PAGE,
          currentPage * MESSAGES_PER_PAGE - 1
        );

      if (messagesError) {
        console.error("Error fetching saved messages:", messagesError);
        throw messagesError;
      }

      return {
        messages: messages as Message[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / MESSAGES_PER_PAGE),
      };
    },
    enabled: !!session?.user?.id,
  });
};