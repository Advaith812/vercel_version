import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Input } from "@/components/ui/input";

export const LinkGenerator = () => {
  const [link, setLink] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const session = useSession();

  const generateLink = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to generate links",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a thread name",
        variant: "destructive",
      });
      return;
    }

    // Generate a 12-character alphanumeric ID
    const generateSimpleId = () => {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
      let result = '';
      for (let i = 0; i < 12; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    };

    const uniqueId = generateSimpleId();
    const newLink = `${window.location.origin}/message/${uniqueId}`;

    try {
      // First, check if this link_id already exists
      const { data: existingLink } = await supabase
        .from("anonymous_links")
        .select()
        .eq("link_id", uniqueId)
        .maybeSingle();

      if (existingLink) {
        // If link exists, try generating a new one
        toast({
          title: "Error",
          description: "Please try again to generate a unique link.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("anonymous_links").insert({
        profile_id: session.user.id,
        link_id: uniqueId,
        name: name.trim(),
      });

      if (error) {
        console.error("Error generating link:", error);
        throw error;
      }

      setLink(newLink);
      setName(""); // Reset name after successful creation
      toast({
        title: "Link Generated",
        description: "Your anonymous message link is ready to share.",
      });
    } catch (error) {
      console.error("Link generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Share this link to receive anonymous messages.",
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Create Anonymous Link</h2>
        <p className="text-gray-600">Generate a unique link to receive anonymous messages</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-md">
          <Input
            type="text"
            placeholder="Enter thread name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          onClick={generateLink}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
          disabled={!name.trim()}
        >
          Generate Link
        </Button>

        {link && (
          <div className="w-full max-w-md p-4 bg-accent rounded-lg flex items-center justify-between gap-2 animate-fadeIn">
            <p className="text-primary font-medium truncate">{link}</p>
            <Button
              onClick={copyLink}
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};