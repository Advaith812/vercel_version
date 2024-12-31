import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const ProfileHeader = () => {
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

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
      setDisplayName(data?.display_name || '');
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (!session) return null;

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      navigate("/auth");
    }
  };

  const updateDisplayName = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', session.user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      toast({
        title: "Profile updated",
        description: "Your display name has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      toast({
        title: "Error",
        description: "Failed to update display name. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA]">
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 ring-2 ring-white/50">
            <AvatarImage src={session.user.user_metadata.avatar_url} />
            <AvatarFallback className="bg-white/20 text-white">
              {userProfile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-8 w-48 bg-white/90"
                  placeholder="Enter display name"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={updateDisplayName}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CardTitle className="text-2xl text-white">
                  {userProfile?.display_name || 'Set your display name'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-sm text-white/80">
              Member since {new Date(session.user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleSignOut} className="bg-white/20 text-white hover:bg-white/30">
          Sign Out
        </Button>
      </CardHeader>
    </Card>
  );
};