
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from '@/components/DashboardSidebar';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { 
  MessageSquare, Send, Share2, ThumbsUp, 
  Award, Tag, ExternalLink, User, Users, Bell
} from 'lucide-react';

interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
  linkedProduct?: {
    name: string;
    image?: string;
  };
}

interface ForumPost {
  id: string;
  username: string;
  avatar: string;
  title: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: number;
  tags: string[];
  linkedProduct?: {
    name: string;
    image?: string;
  };
}

const Community = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isGuest } = useGuestMode();

  // Mock initial chat messages
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'NutritionExpert',
        avatar: '',
        text: 'Welcome to SafeBite Community! Ask questions about food safety or share your experiences.',
        timestamp: new Date(Date.now() - 3600000 * 3),
        isCurrentUser: false
      },
      {
        id: '2',
        username: 'HealthyEater21',
        avatar: '',
        text: 'Has anyone tried the new plant-based protein bars from GreenLife? Wondering if they\'re worth it.',
        timestamp: new Date(Date.now() - 3600000 * 2),
        isCurrentUser: false
      },
      {
        id: '3',
        username: 'FitnessFoodie',
        avatar: '',
        text: 'I just scanned them yesterday! They have good protein content but high in sugar.',
        timestamp: new Date(Date.now() - 3600000),
        isCurrentUser: false,
        linkedProduct: {
          name: 'GreenLife Plant Protein Bar',
          image: 'https://source.unsplash.com/random/100x100/?protein'
        }
      }
    ];

    const mockPosts: ForumPost[] = [
      {
        id: '1',
        username: 'DietSpecialist',
        avatar: '',
        title: 'Guide: Reading Food Labels for Hidden Sugars',
        content: 'Sugar can be listed under many different names on ingredient lists. Here\'s how to identify them...',
        timestamp: new Date(Date.now() - 86400000 * 2),
        likes: 42,
        replies: 15,
        tags: ['Food Labels', 'Nutrition', 'Sugar']
      },
      {
        id: '2',
        username: 'OrganicChef',
        avatar: '',
        title: 'Are preservatives in packaged foods harmful?',
        content: 'I\'ve been researching food preservatives and want to share what I found about their health impacts...',
        timestamp: new Date(Date.now() - 86400000),
        likes: 28,
        replies: 22,
        tags: ['Preservatives', 'Food Safety', 'Health']
      },
      {
        id: '3',
        username: 'WeightLossJourney',
        avatar: '',
        title: 'My 30-Day Experience with SafeBite Food Tracking',
        content: 'I\'ve been using SafeBite to track everything I eat for a month. Here are my results...',
        timestamp: new Date(Date.now() - 43200000),
        likes: 56,
        replies: 18,
        tags: ['Success Story', 'Weight Loss', 'Tracking']
      },
    ];

    setChatMessages(mockMessages);
    setForumPosts(mockPosts);
  }, []);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: isGuest ? 'Guest User' : 'You',
      avatar: '',
      text: messageInput,
      timestamp: new Date(),
      isCurrentUser: true
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');

    // Simulate response after a short delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        username: 'HealthBot',
        avatar: '',
        text: 'Thank you for sharing! Anyone else have experience with this?',
        timestamp: new Date(),
        isCurrentUser: false
      };

      setChatMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const handleLikePost = (postId: string) => {
    setForumPosts(posts => 
      posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 } 
          : post
      )
    );

    toast({
      title: "Post liked",
      description: "Your engagement helps the community!",
    });
  };

  const handleSharePost = (postId: string) => {
    toast({
      title: "Share link copied!",
      description: "You can now paste the link to share this post.",
    });
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    
    toast({
      title: isSubscribed ? "Unsubscribed from notifications" : "Subscribed to notifications",
      description: isSubscribed 
        ? "You'll no longer receive community updates" 
        : "You'll receive notifications for new posts and replies",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
              <h1 className="text-3xl font-bold text-safebite-text mb-2">Community</h1>
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
              <Card className="sci-fi-card min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-safebite-card-bg-alt">
                  <h3 className="text-xl font-semibold text-safebite-text flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Live Community Chat
                    <Badge className="ml-2 bg-safebite-teal text-safebite-dark-blue">
                      {chatMessages.length} messages
                    </Badge>
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] ${
                            message.isCurrentUser 
                              ? 'bg-safebite-teal text-safebite-dark-blue rounded-tl-lg rounded-tr-none' 
                              : 'bg-safebite-card-bg-alt text-safebite-text rounded-tr-lg rounded-tl-none'
                          } rounded-bl-lg rounded-br-lg p-3`}
                        >
                          <div className="flex items-center mb-1">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className={message.isCurrentUser ? 'bg-safebite-dark-blue text-safebite-teal' : ''}>
                                {message.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{message.username}</span>
                            <span className="text-xs ml-2 opacity-70">{formatTime(message.timestamp)}</span>
                          </div>
                          
                          <p>{message.text}</p>
                          
                          {message.linkedProduct && (
                            <div className="mt-2 p-2 bg-safebite-card-bg rounded-md flex items-center">
                              <img 
                                src={message.linkedProduct.image} 
                                alt={message.linkedProduct.name}
                                className="h-10 w-10 rounded-md object-cover mr-2"
                              />
                              <span className="text-sm">{message.linkedProduct.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>
                
                <div className="p-4 border-t border-safebite-card-bg-alt">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      className="sci-fi-input"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="sci-fi-button">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="forum" className="mt-0">
              <div className="grid gap-6">
                {forumPosts.map((post) => (
                  <Card key={post.id} className="sci-fi-card">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-safebite-text">{post.username}</h4>
                            <p className="text-xs text-safebite-text-secondary">
                              Posted on {formatDate(post.timestamp)}
                            </p>
                          </div>
                        </div>
                        {post.username === 'DietSpecialist' && (
                          <Badge className="bg-safebite-purple">
                            <Award className="h-3 w-3 mr-1" /> Expert
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-safebite-text mb-2">{post.title}</h3>
                      <p className="text-safebite-text-secondary mb-4">{post.content}</p>
                      
                      {post.linkedProduct && (
                        <div className="mb-4 p-3 bg-safebite-card-bg-alt rounded-md flex items-center">
                          <img 
                            src={post.linkedProduct.image} 
                            alt={post.linkedProduct.name}
                            className="h-12 w-12 rounded-md object-cover mr-3"
                          />
                          <span>{post.linkedProduct.name}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="border-safebite-teal text-safebite-teal">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="sci-fi-button"
                            onClick={() => handleLikePost(post.id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="sci-fi-button"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.replies} Replies
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="sci-fi-button"
                          onClick={() => handleSharePost(post.id)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-safebite-text-secondary mt-6 text-right">
            Created by Aditya Shenvi
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
