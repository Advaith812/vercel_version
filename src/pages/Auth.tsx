import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { MessageSquare, Lock, UserPlus, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const conversationId = searchParams.get('conversation');
  const [countdown, setCountdown] = useState(3);

  const handleSaveAndRedirect = async (userId: string) => {
    if (conversationId) {
      try {
        // Start countdown toast
        const countdownToast = toast({
          title: "Saving your conversation...",
          description: `Redirecting to inbox in ${countdown} seconds. Your anonymity is preserved.`,
          duration: 3000,
        });

        // Save the conversation
        const { error: saveError } = await supabase
          .from('saved_conversations')
          .insert({
            profile_id: userId,
            conversation_id: conversationId,
            was_visitor: true
          });

        if (saveError) throw saveError;

        // Countdown effect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/profile?view=saved');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Error saving conversation:', error);
        toast({
          title: "Error",
          description: "Failed to save conversation. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      navigate('/profile');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleSaveAndRedirect(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, conversationId, countdown]);

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
      title: "Anonymous Messages",
      description: "Receive messages while keeping sender identity private"
    },
    {
      icon: <Lock className="w-6 h-6 text-indigo-500" />,
      title: "Secure & Private",
      description: "Your conversations are protected and only visible to you"
    },
    {
      icon: <UserPlus className="w-6 h-6 text-blue-500" />,
      title: "Easy Setup",
      description: "Create your profile and start receiving messages instantly"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-violet-500" />,
      title: "Organized Inbox",
      description: "Keep track of all your anonymous conversations in one place"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Auth Box */}
        <Card className="p-6 lg:p-8 shadow-xl border-purple-100">
          <div className="max-w-sm mx-auto">
            <Tabs defaultValue="register" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="register">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center text-primary">
                    Create Account
                  </h2>
                  <SupabaseAuth 
                    supabaseClient={supabase}
                    appearance={{ 
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#4C1D95',
                            brandAccent: '#7C3AED',
                          },
                        },
                      },
                      style: {
                        button: { 
                          background: '#4C1D95',
                          color: 'white',
                          borderRadius: '6px',
                        },
                        anchor: { color: '#7C3AED' },
                        message: { color: '#DC2626' },
                      },
                    }}
                    providers={[]}
                    view="sign_up"
                    redirectTo={window.location.origin}
                  />
                </div>
              </TabsContent>

              <TabsContent value="login">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center text-primary">
                    Welcome Back
                  </h2>
                  <SupabaseAuth 
                    supabaseClient={supabase}
                    appearance={{ 
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#4C1D95',
                            brandAccent: '#7C3AED',
                          },
                        },
                      },
                      style: {
                        button: { 
                          background: '#4C1D95',
                          color: 'white',
                          borderRadius: '6px',
                        },
                        anchor: { color: '#7C3AED' },
                        message: { color: '#DC2626' },
                      },
                    }}
                    providers={[]}
                    view="sign_in"
                    redirectTo={window.location.origin}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary text-center">
              Welcome to AnonChatLink
            </h1>
            <p className="text-lg text-gray-600 text-center">
              Create your anonymous message inbox and start receiving honest feedback from anyone, anywhere.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-4 hover:shadow-md transition-shadow duration-200 border-purple-100"
              >
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
