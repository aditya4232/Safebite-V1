import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage, chatWithGemini } from '@/services/geminiService';
import { Loader2 } from 'lucide-react';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../firebase";
import { useToast } from "@/hooks/use-toast";

interface FoodChatBotProps {
  initialMessage?: string;
}

const FoodChatBot: React.FC<FoodChatBotProps> = ({ initialMessage = "Hi! I'm your SafeBite AI assistant. Ask me anything about food, nutrition, or healthy eating!" }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: initialMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get all messages for context
      const allMessages = [...messages, userMessage];

      // Get response from Gemini
      const response = await chatWithGemini(allMessages);

      // Add assistant message
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);

      // Save interaction to Firebase if user is logged in
      if (isLoggedIn) {
        try {
          const user = auth.currentUser;
          if (user) {
            // Save to user's chat history
            const chatRef = collection(db, 'users', user.uid, 'chatHistory');
            await addDoc(chatRef, {
              userMessage: userMessage.content,
              aiResponse: response,
              timestamp: serverTimestamp(),
              context: allMessages.map(msg => ({ role: msg.role, content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '') })),
              topics: extractTopics(userMessage.content)
            });

            // Update user's profile with learned preferences
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              aiLearning: {
                lastInteraction: serverTimestamp(),
                recentTopics: extractTopics(userMessage.content),
                interactionCount: allMessages.length / 2 // Approximate number of exchanges
              }
            }, { merge: true });
          }
        } catch (firebaseError) {
          console.error('Error saving chat to Firebase:', firebaseError);
          // Don't show error to user, just log it
        }
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract topics from user message
  const extractTopics = (message: string): string[] => {
    // Simple keyword extraction
    const keywords = [
      'nutrition', 'calories', 'protein', 'carbs', 'fat', 'diet',
      'vegetarian', 'vegan', 'gluten', 'allergy', 'organic', 'healthy',
      'recipe', 'meal', 'breakfast', 'lunch', 'dinner', 'snack',
      'vitamin', 'mineral', 'supplement', 'weight', 'exercise',
      'diabetes', 'heart', 'cholesterol', 'blood pressure'
    ];

    const foundTopics: string[] = [];
    const lowerMessage = message.toLowerCase();

    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        foundTopics.push(keyword);
      }
    }

    return foundTopics.length > 0 ? foundTopics : ['general'];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 rounded-full w-14 h-14 p-0 bg-safebite-teal hover:bg-safebite-teal/80 shadow-lg"
        >
          <Bot size={24} />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className={`fixed bottom-4 right-4 w-80 sm:w-96 shadow-lg transition-all duration-300 ease-in-out ${
          isMinimized ? 'h-16' : 'h-[500px]'
        }`}>
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-md flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/bot-avatar.png" alt="AI" />
                <AvatarFallback className="bg-safebite-teal text-safebite-dark-blue">AI</AvatarFallback>
              </Avatar>
              SafeBite AI Assistant
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 p-0">
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-4 overflow-y-auto h-[380px] bg-safebite-card-bg">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-safebite-teal text-safebite-dark-blue'
                            : 'bg-safebite-card-bg-alt text-safebite-text'
                        }`}
                      >
                        {message.content.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < message.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-safebite-card-bg-alt text-safebite-text">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Ask about food or nutrition..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-safebite-teal hover:bg-safebite-teal/80"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default FoodChatBot;
