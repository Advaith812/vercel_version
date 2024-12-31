import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ThreadList } from "./inbox/ThreadList";
import { useSavedConversations } from "@/hooks/useSavedConversations";

export const Inbox2 = () => {
  const session = useSession();
  const { toast } = useToast();
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: messagesData,
    isLoading,
    refetch,
  } = useSavedConversations(currentPage);

  const handleSubmitReply = async (messageId: string) => {
    if (!session?.user?.id || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("replies").insert({
        message_id: messageId,
        content: replyContent.trim(),
        sender_id: session.user.id,
        is_from_visitor: false,
      });

      if (error) throw error;

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      });

      setReplyContent("");
      setReplyingTo(null);
      refetch();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!messagesData?.messages?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No saved conversations yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ThreadList
        messages={messagesData.messages}
        expandedMessage={expandedMessage}
        replyingTo={replyingTo}
        replyContent={replyContent}
        isSubmitting={isSubmitting}
        isSavedView={true}
        onExpand={(id) => setExpandedMessage(expandedMessage === id ? null : id)}
        onReplyClick={(id) => setReplyingTo(id)}
        onReplyChange={(content) => setReplyContent(content)}
        onReplySubmit={handleSubmitReply}
        onReplyCancel={() => {
          setReplyingTo(null);
          setReplyContent("");
        }}
      />

      {messagesData.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: messagesData.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < messagesData.totalPages)
                    setCurrentPage(currentPage + 1);
                }}
                className={
                  currentPage === messagesData.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};