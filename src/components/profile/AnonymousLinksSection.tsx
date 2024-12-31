import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AnonymousLinkItem } from "./AnonymousLinkItem";
import { useState } from "react";

export const AnonymousLinksSection = () => {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: anonymousLinks } = useQuery({
    queryKey: ['anonymousLinks', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('anonymous_links')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/message/${linkId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share this link with friends to receive anonymous messages.",
    });
  };

  const shareLink = async (linkId: string) => {
    const url = `${window.location.origin}/message/${linkId}`;
    const text = `Send me an anonymous message! 💭`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Send Secret Message",
          text: text,
          url: url,
        });
        toast({
          title: "Thanks for sharing!",
          description: "Your link has been shared successfully.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyLink(linkId);
      }
    } else {
      copyLink(linkId);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['anonymousLinks'] });
      toast({
        title: "Refreshed!",
        description: "Your messages list has been updated.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        {anonymousLinks && anonymousLinks.length > 0 ? (
          <div className="space-y-4">
            {anonymousLinks.map((link) => (
              <AnonymousLinkItem
                key={link.id}
                link={link}
                userProfile={userProfile}
                onShare={shareLink}
                onCopy={copyLink}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No anonymous links found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};