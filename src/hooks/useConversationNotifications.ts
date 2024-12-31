import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConversationNotifications = () => {
  const session = useSession();

  return useQuery({
    queryKey: ["conversation-notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      // Get message IDs that have replies from the user
      const { data: repliedMessageIds } = await supabase
        .from("replies")
        .select("message_id")
        .eq("sender_id", session.user.id)
        .eq("is_from_visitor", false);

      const messageIdsWithReplies = repliedMessageIds?.map(r => r.message_id) || [];

      // Count unread messages that have replies (active conversations)
      const { count } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true })
        .eq("recipient_id", session.user.id)
        .eq("read", false)
        .in("id", messageIdsWithReplies);

      return count || 0;
    },
    enabled: !!session?.user?.id,
  });
};