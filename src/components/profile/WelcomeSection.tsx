import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Smile, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const WelcomeSection = () => {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const { data: userProfile, refetch: refetchProfile } = useQuery({
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

  const { data: anonymousLink } = useQuery({
    queryKey: ['firstAnonymousLink', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('anonymous_links')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSubmit = async () => {
    if (!displayName.trim() || !session?.user?.id) return;

    setIsSubmitting(true);
    try {
      // First update the user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() }
      });

      if (metadataError) throw metadataError;

      // Then update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Update the anonymous link name
      if (anonymousLink) {
        const { error: linkError } = await supabase
          .from('anonymous_links')
          .update({ name: `Send message to ${displayName.trim()}` })
          .eq('id', anonymousLink.id);

        if (linkError) throw linkError;
      }

      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
        queryClient.invalidateQueries({ queryKey: ['anonymousLinks'] }),
        queryClient.invalidateQueries({ queryKey: ['firstAnonymousLink'] })
      ]);

      await refetchProfile();
      setShowLink(true);
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your display name has been set successfully.",
      });
    } catch (error) {
      console.error('Error updating display name:', error);
      toast({
        title: "Error",
        description: "Failed to update display name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/message/${linkId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "You can now share this link with others!",
    });
  };

  // If user already has a display name, don't show the welcome section
  if (userProfile?.display_name) return null;

  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <Card className="w-full max-w-md overflow-hidden bg-gradient-to-br from-[#9b87f5] to-[#D6BCFA]">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Smile className="w-8 h-8 text-[#8B5CF6]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome to AnonChatLink!</h2>
            <p className="text-white/90">
              Let's get started by setting up your display name
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <User className="h-5 w-5 text-[#8B5CF6]" />
              </div>
              <Input
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 bg-white/90 border-transparent focus:border-white"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!displayName.trim() || isSubmitting}
              className="w-full bg-white text-[#8B5CF6] hover:bg-white/90"
            >
              {isSubmitting ? (
                "Setting up..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Set Display Name
                </>
              )}
            </Button>
          </div>

          {showLink && anonymousLink && (
            <div className={cn(
              "mt-4 p-4 bg-white/10 rounded-lg space-y-2 transition-all duration-300",
              "animate-fadeIn"
            )}>
              <p className="text-sm font-medium text-white">Your anonymous link is ready:</p>
              <div className="flex items-center justify-between gap-2 bg-white/20 rounded p-2">
                <code className="text-xs text-white flex-1 break-all">
                  {`${window.location.origin}/message/${anonymousLink.link_id}`}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(anonymousLink.link_id)}
                  className="hover:bg-white/20 text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};