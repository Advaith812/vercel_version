import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { MessageForm } from "@/components/MessageForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, UserCircle2, Shield, AlertTriangle } from "lucide-react";

const Message = () => {
  const { id } = useParams();
  const session = useSession();
  const { toast } = useToast();
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipientName = async () => {
      if (!id) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching link data for ID:', id);
        const { data: linkData, error: linkError } = await supabase
          .from('anonymous_links')
          .select('profile_id, name')
          .eq('link_id', id)
          .maybeSingle();

        if (linkError) {
          console.error('Error fetching link:', linkError);
          throw linkError;
        }

        if (!linkData) {
          console.log('No link found for ID:', id);
          setError('This message link does not exist or has been deleted.');
          setLoading(false);
          return;
        }

        console.log('Found link data:', linkData);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', linkData.profile_id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        setRecipientName(profileData?.display_name || linkData.name);
      } catch (err) {
        console.error('Error in fetchRecipientName:', err);
        setError('Could not load this message link. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipientName();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">{error}</div>
          <Link to="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-purple-900 tracking-tight">
                Send message to {recipientName}
              </h1>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-purple-500" />
              <p>Your identity will remain anonymous forever, even if you create an account later</p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-purple-500" />
              <p>Please be respectful and kind. Any form of harassment or abuse will not be tolerated.</p>
            </div>
          </div>
          
          <MessageForm linkId={id} recipientName={recipientName} />
        </div>
      </div>
    </div>
  );
};

export default Message;