import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from '@/components/DashboardSidebar';
import CommunityMessages from '@/components/CommunityMessages';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import {
  MessageSquare, Send, Share2, ThumbsUp,
  Award, Tag, ExternalLink, User, Users, Bell
} from 'lucide-react';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, collection, addDoc, orderBy, limit, onSnapshot, serverTimestamp, query } from "firebase/firestore";

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
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchMessages = async () => {
      const chatCollection = collection(db, "community", "general", "messages");
      const q = query(chatCollection, orderBy("timestamp", "asc"), limit(50));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            username: data.username || 'Anonymous',
            avatar: data.avatar || '',
            text: data.text || '',
            timestamp: data.timestamp?.toDate() || new Date(),
            isCurrentUser: user ? data.userId === user.uid : false,
            linkedProduct: data.linkedProduct
          };
        });
        setChatMessages(messages);
      });
    };

    fetchMessages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [db, user]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      userId: user?.uid,
      username: user?.displayName || user?.email || 'Anonymous',
      text: messageInput,
      timestamp: serverTimestamp(),
    };

    try {
      const chatCollection = collection(db, "community", "general", "messages");
      await addDoc(chatCollection, newMessage);
      setMessageInput('');
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error sending message to Firestore: ", error);
    }
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
              <Card className="sci-fi-card min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-safebite-card-bg-alt">
                  <h3 className="text-xl font-semibold text-safebite-text flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Live Community Chat Beta
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
