import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message.types";

const MESSAGES_PER_PAGE = 10;

export const useNewMessages = (currentPage: number) => {
  const session = useSession();

  return useQuery({
    queryKey: ["new-messages", session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // First get total count of messages
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", session.user.id);

      // If no messages or requested page is beyond available data, return empty result
      if (!count || (currentPage - 1) * MESSAGES_PER_PAGE >= count) {
        return {
          messages: [],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / MESSAGES_PER_PAGE),
        };
      }

      // Get message IDs that have replies from the user
      const { data: repliedMessageIds } = await supabase
        .from("replies")
        .select("message_id")
        .eq("sender_id", session.user.id)
        .eq("is_from_visitor", false);

      const messageIdsWithReplies = repliedMessageIds?.map(r => r.message_id) || [];

      // Get messages WITHOUT user replies
      const { data: messages, error: messagesError } = await supabase
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
        `)
        .eq("recipient_id", session.user.id)
        .not("id", "in", `(${messageIdsWithReplies.length > 0 ? messageIdsWithReplies.join(',') : '00000000-0000-0000-0000-000000000000'})`)
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * MESSAGES_PER_PAGE,
          currentPage * MESSAGES_PER_PAGE - 1
        );

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