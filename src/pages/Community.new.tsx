import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from '@/components/DashboardSidebar';
import CommunityMessages from '@/components/CommunityMessages';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import {
  MessageSquare, Users, Bell, Award
} from 'lucide-react';

const Community = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { isGuest } = useGuestMode();

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    
    toast({
      title: isSubscribed ? "Unsubscribed from notifications" : "Subscribed to notifications",
      description: isSubscribed
        ? "You'll no longer receive community updates"
        : "You'll receive notifications for new posts and replies",
    });
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>

      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-safebite-text mb-2">Live Community Chat Beta</h1>
              <p className="text-safebite-text-secondary">
                Connect with other users, share food discoveries, and get advice
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant={isSubscribed ? "default" : "outline"}
                className={isSubscribed
                  ? "bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                  : "sci-fi-button"
                }
                onClick={handleSubscribe}
              >
                <Bell className="mr-2 h-4 w-4" />
                {isSubscribed ? "Subscribed" : "Subscribe to Updates"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="chat" className="mb-6" onValueChange={setActiveTab}>
            <div className="sci-fi-card mb-2 p-4">
              <TabsList className="grid grid-cols-2 gap-2">
                <TabsTrigger
                  value="chat"
                  className={activeTab === 'chat' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Live Chat
                </TabsTrigger>
                <TabsTrigger
                  value="forum"
                  className={activeTab === 'forum' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Forum Discussions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="mt-0">
              {/* New Community Messages Component */}
              <CommunityMessages />
            </TabsContent>

            <TabsContent value="forum" className="mt-0">
              <div className="grid gap-4">
                <div className="sci-fi-card p-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-safebite-teal" />
                  <h3 className="text-xl font-semibold text-safebite-text mb-2">
                    Forum Coming Soon
                  </h3>
                  <p className="text-safebite-text-secondary mb-4">
                    We're working on building a comprehensive forum for in-depth discussions about nutrition, 
                    recipes, and healthy eating habits.
                  </p>
                  <Badge variant="outline" className="mx-auto">
                    Coming in next update
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Community;
