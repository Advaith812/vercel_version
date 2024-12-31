import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { WelcomeSection } from "@/components/profile/WelcomeSection";
import { AnonymousLinksSection } from "@/components/profile/AnonymousLinksSection";
import { InboxToggle } from "@/components/profile/InboxToggle";
import { ShareToolkit } from "@/components/profile/ShareToolkit";
import { Inbox } from "@/components/Inbox";
import { Inbox2 } from "@/components/Inbox2";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const session = useSession();
  const { isLoading: isSessionLoading } = useSessionContext();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<"messages" | "conversations" | "saved">("messages");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "saved" || viewParam === "conversations" || viewParam === "messages") {
      setView(viewParam);
    }
  }, [searchParams]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
    setIsRefreshing(false);
  };

  if (isSessionLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session && !isSessionLoading) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <ProfileHeader />
      <WelcomeSection />
      <AnonymousLinksSection />
      
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <InboxToggle view={view} onViewChange={setView} />
          <ShareToolkit 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
        {view === "saved" ? (
          <Inbox2 />
        ) : (
          <Inbox viewType={view} />
        )}
      </Card>
    </div>
  );
};

export default Profile;