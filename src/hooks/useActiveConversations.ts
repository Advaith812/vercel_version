import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message.types";

const MESSAGES_PER_PAGE = 10;

export const useActiveConversations = (currentPage: number) => {
  const session = useSession();

  return useQuery({
    queryKey: ["active-conversations", session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // First get message IDs that have replies from the user
      const { data: repliedMessageIds } = await supabase
        .from("replies")
        .select("message_id")
        .eq("sender_id", session.user.id)
        .eq("is_from_visitor", false);

      const messageIdsWithReplies = repliedMessageIds?.map(r => r.message_id) || [];

      if (messageIdsWithReplies.length === 0) {
        return {
          messages: [],
          totalCount: 0,
          totalPages: 0,
        };
      }

      // Get conversation IDs that are saved
      const { data: savedConversations } = await supabase
        .from("saved_conversations")
        .select("conversation_id")
        .eq("profile_id", session.user.id);

      const savedConversationIds = savedConversations?.map(sc => sc.conversation_id) || [];

      // Build the query based on whether there are saved conversations
      let query = supabase
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
        .in('id', messageIdsWithReplies)
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * MESSAGES_PER_PAGE,
          currentPage * MESSAGES_PER_PAGE - 1
        );

      // Only add the not.in filter if there are saved conversations
      if (savedConversationIds.length > 0) {
        query = query.not('conversation_id', 'in', `(${savedConversationIds.join(',')})`);
      }

      const { data: messages, error: messagesError, count } = await query;

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
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