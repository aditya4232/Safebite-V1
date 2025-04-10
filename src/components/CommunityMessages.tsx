import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, User, Clock, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from '@/utils/apiUtils';
import { getAuth } from "firebase/auth";

interface Message {
  _id: string;
  text: string;
  user: {
    id: string;
    name: string;
    photoURL?: string;
  };
  timestamp: Date;
}

interface CommunityMessagesProps {
  className?: string;
}

const CommunityMessages: React.FC<CommunityMessagesProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();

  // Check API status and fetch messages on component mount
  useEffect(() => {
    checkApiStatus();
    fetchMessages();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const isAvailable = response.ok;
      setApiStatus(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus(false);
      return false;
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check API status first
      const isApiAvailable = await checkApiStatus();
      
      if (!isApiAvailable) {
        setError('API is currently offline. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/messages`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Convert string timestamps to Date objects
        const formattedMessages = data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(formattedMessages);
      } else {
        setError('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      
      if (!user) {
        setError('You must be logged in to send messages');
        return;
      }
      
      // Check API status first
      const isApiAvailable = await checkApiStatus();
      
      if (!isApiAvailable) {
        setError('API is currently offline. Please try again later.');
        return;
      }
      
      const messageData = {
        text: newMessage.trim(),
        user: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          photoURL: user.photoURL || undefined
        },
        timestamp: new Date()
      };
      
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      // Clear input and refresh messages
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Format as date
    return timestamp.toLocaleDateString();
  };

  return (
    <Card className={`sci-fi-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Community Chat</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={apiStatus ? "default" : "destructive"} className="h-6">
              {apiStatus === null ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : apiStatus ? (
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
              ) : (
                <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
              )}
              {apiStatus === null ? 'Checking...' : apiStatus ? 'Online' : 'Offline'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMessages}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>
          Connect with other SafeBite users and share your experiences
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-[400px] overflow-y-auto mb-4 border rounded-md p-4 bg-safebite-dark-blue/5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div key={message._id} className="flex items-start space-x-3 mb-4">
                <Avatar>
                  <AvatarImage src={message.user.photoURL} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-safebite-text">{message.user.name}</span>
                    <span className="text-xs text-safebite-text-secondary flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-safebite-text">{message.text}</p>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="flex items-center justify-center h-full text-safebite-text-secondary">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-safebite-text-secondary">
              No messages yet. Be the first to start the conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {error && !isLoading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="sci-fi-input flex-1"
              disabled={!apiStatus || isSending || !auth.currentUser}
            />
            <Button 
              type="submit" 
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              disabled={!apiStatus || isSending || !newMessage.trim() || !auth.currentUser}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Send
            </Button>
          </div>
        </form>
        
        {!auth.currentUser && (
          <p className="text-xs text-safebite-text-secondary mt-2">
            You must be logged in to send messages.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityMessages;
