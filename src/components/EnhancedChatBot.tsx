import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Send, X, Mic, MicOff, Bot, User, Sparkles,
  Loader2, MessageSquare, ThumbsUp, ThumbsDown,
  Copy, Check, Maximize2, Minimize2, Volume2, VolumeX
} from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { enhancedChatWithGemini, ChatMessage, UserContext, getCurrentUserContext, generateProactiveSuggestion, extractTopicsAndEntities } from '@/services/enhancedGeminiService';
import speechUtils from '@/utils/speechPolyfill';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { trackUserInteraction } from '@/services/mlService';

interface EnhancedChatBotProps {
  initialMessage?: string;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const EnhancedChatBot: React.FC<EnhancedChatBotProps> = ({
  initialMessage,
  onClose,
  isExpanded = false,
  onToggleExpand
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(false);
  const [isSpeechSynthesisActive, setIsSpeechSynthesisActive] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({ isGuest: true });
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [proactiveSuggestion, setProactiveSuggestion] = useState<string | null>(null);
  const [showProactiveSuggestion, setShowProactiveSuggestion] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognition = useRef<any>(null);
  const speechSynthesis = window.speechSynthesis;
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: initialMessage || "Hi there! I'm SafeBite AI, your nutrition and health assistant. How can I help you today?"
    };
    setMessages([welcomeMessage]);

    // Load user context
    loadUserContext();

    // Initialize speech recognition if available
    speechRecognition.current = speechUtils.initSpeechRecognition();

    if (speechRecognition.current) {
      speechRecognition.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setInputValue(transcript);
      };

      speechRecognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsSpeechRecognitionActive(false);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };
    }

    // Generate initial suggestions
    generateInitialSuggestions();

    // Check for proactive suggestions after a delay
    const proactiveTimer = setTimeout(() => {
      checkForProactiveSuggestion();
    }, 5000);

    return () => {
      // Clean up speech recognition
      if (speechRecognition.current) {
        try {
          if (isSpeechRecognitionActive) {
            speechRecognition.current.stop();
          }
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }

      // Clean up speech synthesis
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }

      // Clean up timers
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
      clearTimeout(proactiveTimer);
    };
  }, [initialMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load user context from Firebase
  const loadUserContext = async () => {
    try {
      const context = await getCurrentUserContext();

      // If user is logged in, get additional data from Firestore
      if (!context.isGuest && context.userId) {
        const userRef = doc(db, 'users', context.userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Extract relevant user data
          context.dietaryPreferences = userData.profile?.dietary_preferences
            ? userData.profile.dietary_preferences.split(',').map((p: string) => p.trim())
            : [];

          context.healthGoals = userData.profile?.health_goals
            ? userData.profile.health_goals.split(',').map((g: string) => g.trim())
            : [];

          context.healthConditions = userData.profile?.health_conditions
            ? userData.profile.health_conditions.split(',').map((c: string) => c.trim())
            : [];

          // Get recent activity
          context.recentActivity = userData.recentActivity || [];

          // Get weekly check-in data
          context.weeklyCheckin = userData.weeklyCheckin || null;
        }
      }

      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  // Generate initial suggestions based on user context
  const generateInitialSuggestions = () => {
    const defaultSuggestions = [
      "What foods are good for energy?",
      "How can I improve my diet?",
      "Tell me about healthy breakfast options",
      "What are the benefits of eating more vegetables?"
    ];

    setSuggestions(defaultSuggestions);
  };

  // Check for proactive suggestions
  const checkForProactiveSuggestion = async () => {
    try {
      const suggestion = await generateProactiveSuggestion(userContext);
      if (suggestion) {
        setProactiveSuggestion(suggestion);
        setShowProactiveSuggestion(true);

        // Hide after 15 seconds if not interacted with
        setTimeout(() => {
          setShowProactiveSuggestion(false);
        }, 15000);
      }
    } catch (error) {
      console.error('Error generating proactive suggestion:', error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Extract topics for tracking
      const { topics } = await extractTopicsAndEntities(userMessage.content);

      // Track this interaction
      trackUserInteraction('chatbot_query', {
        query: userMessage.content,
        topics: topics.join(',')
      });

      // Save to user's chat history if logged in
      if (!userContext.isGuest && userContext.userId) {
        try {
          const userRef = doc(db, 'users', userContext.userId);
          await updateDoc(userRef, {
            chatHistory: arrayUnion({
              message: userMessage.content,
              timestamp: new Date(),
              topics: topics
            })
          });
        } catch (e) {
          console.error('Error saving chat history:', e);
        }
      }

      // Get AI response
      const response = await enhancedChatWithGemini(
        [...messages, userMessage],
        userContext
      );

      // Add AI response with typing effect
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };

      // Start typing effect
      startTypingEffect(assistantMessage.content);

      // Generate new suggestions based on the conversation
      generateNewSuggestions(userMessage.content, assistantMessage.content);

    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again."
        }
      ]);

      setIsLoading(false);
    }
  };

  // Start typing effect for AI responses
  const startTypingEffect = (text: string) => {
    setIsTyping(true);
    setTypingText(text);
    setTypingIndex(0);

    // Use a timer to simulate typing
    const typeNextChar = () => {
      setTypingIndex(prev => {
        const newIndex = prev + 1;

        // If we've typed the whole message
        if (newIndex >= text.length) {
          // Add the complete message to the chat
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: text
            }
          ]);

          setIsTyping(false);
          setIsLoading(false);

          // Speak the response if speech synthesis is active
          if (isSpeechSynthesisActive) {
            speakText(text);
          }

          return 0;
        }

        // Calculate typing speed (faster for shorter messages)
        const baseSpeed = 30; // ms per character for long messages
        const minSpeed = 10; // ms per character for short messages
        const speedFactor = Math.max(0.2, Math.min(1, text.length / 500));
        const typingSpeed = baseSpeed * speedFactor + minSpeed * (1 - speedFactor);

        // Schedule next character
        typingTimer.current = setTimeout(typeNextChar, typingSpeed);

        return newIndex;
      });
    };

    // Start typing
    typingTimer.current = setTimeout(typeNextChar, 200);
  };

  // Generate new suggestions based on the conversation
  const generateNewSuggestions = (userMessage: string, aiResponse: string) => {
    // This is a simplified version - in a real app, you might use AI to generate these
    const commonFollowUps = [
      "Can you explain that in more detail?",
      "How does that affect my health?",
      "What foods should I avoid?",
      "Are there any recipes you recommend?"
    ];

    // For now, just use common follow-ups
    setSuggestions(commonFollowUps);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle proactive suggestion click
  const handleProactiveSuggestionClick = () => {
    if (proactiveSuggestion) {
      setInputValue(proactiveSuggestion);
      setShowProactiveSuggestion(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!speechRecognition.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeechRecognitionActive) {
      speechRecognition.current.stop();
      setIsSpeechRecognitionActive(false);
    } else {
      try {
        speechRecognition.current.start();
        setIsSpeechRecognitionActive(true);
        toast({
          title: "Listening...",
          description: "Speak now. Click the microphone again to stop.",
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Speech Recognition Error",
          description: "Could not start speech recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Toggle speech synthesis
  const toggleSpeechSynthesis = () => {
    setIsSpeechSynthesisActive(!isSpeechSynthesisActive);

    if (!isSpeechSynthesisActive) {
      toast({
        title: "Text-to-Speech Enabled",
        description: "AI responses will be read aloud.",
      });
    } else {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    }
  };

  // Speak text using speech synthesis
  const speakText = (text: string) => {
    speechUtils.speakText(text);
  };

  // Copy message to clipboard
  const copyMessageToClipboard = (message: string, index: number) => {
    navigator.clipboard.writeText(message)
      .then(() => {
        setCopiedMessageId(index);
        setTimeout(() => setCopiedMessageId(null), 2000);

        toast({
          title: "Copied to clipboard",
          description: "Message content copied to clipboard.",
        });
      })
      .catch(err => {
        console.error('Error copying text:', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
          variant: "destructive",
        });
      });
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Animation variants
  const chatContainerVariants = {
    expanded: {
      width: '100%',
      height: '100%',
      borderRadius: '0px',
      transition: { duration: 0.3 }
    },
    collapsed: {
      width: '380px',
      height: '500px',
      borderRadius: '12px',
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`bg-safebite-dark-blue border border-safebite-card-bg-alt shadow-xl flex flex-col ${
        isExpanded ? 'fixed inset-0 z-50' : 'rounded-xl'
      }`}
      variants={chatContainerVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      initial="collapsed"
    >
      {/* Header */}
      <div className="p-3 border-b border-safebite-card-bg-alt flex justify-between items-center bg-safebite-card-bg rounded-t-xl">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-2">
            <Bot className="h-4 w-4 text-safebite-teal" />
          </div>
          <div>
            <h3 className="font-medium text-safebite-text">SafeBite AI</h3>
            <p className="text-xs text-safebite-text-secondary">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-safebite-text-secondary hover:text-safebite-text"
                  onClick={toggleSpeechSynthesis}
                >
                  {isSpeechSynthesisActive ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSpeechSynthesisActive ? 'Disable' : 'Enable'} text-to-speech</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-safebite-text-secondary hover:text-safebite-text"
                  onClick={onToggleExpand}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? 'Minimize' : 'Maximize'} chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-safebite-text-secondary hover:text-safebite-text"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'ml-2 bg-safebite-teal/20' : 'mr-2 bg-safebite-card-bg'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-safebite-teal" />
                  ) : (
                    <Bot className="h-4 w-4 text-safebite-teal" />
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg relative group ${
                    message.role === 'user'
                      ? 'bg-safebite-teal text-safebite-dark-blue'
                      : 'bg-safebite-card-bg text-safebite-text'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-safebite-text-secondary hover:text-safebite-text"
                        onClick={() => copyMessageToClipboard(message.content, index)}
                      >
                        {copiedMessageId === index ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-safebite-card-bg-alt flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-safebite-text-secondary">
                        Was this helpful?
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-safebite-text-secondary hover:text-green-500"
                          onClick={() => {
                            toast({
                              title: "Feedback Received",
                              description: "Thanks for your positive feedback!",
                            });
                          }}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-safebite-text-secondary hover:text-red-500"
                          onClick={() => {
                            toast({
                              title: "Feedback Received",
                              description: "Thanks for your feedback. We'll work to improve.",
                            });
                          }}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex flex-row">
                <div className="w-8 h-8 rounded-full bg-safebite-card-bg flex items-center justify-center mr-2">
                  <Bot className="h-4 w-4 text-safebite-teal" />
                </div>
                <div className="p-3 rounded-lg bg-safebite-card-bg text-safebite-text">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {typingText.substring(0, typingIndex)}
                    </ReactMarkdown>
                  </div>
                  <div className="flex space-x-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-safebite-teal/50 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-safebite-teal/50 animate-pulse delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-safebite-teal/50 animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {!isLoading && suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-safebite-card-bg-alt">
          <p className="text-xs text-safebite-text-secondary mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-safebite-card-bg hover:bg-safebite-card-bg-alt cursor-pointer transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Proactive suggestion */}
      <AnimatePresence>
        {showProactiveSuggestion && proactiveSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 border-t border-safebite-card-bg-alt bg-safebite-teal/10"
          >
            <div className="flex items-start">
              <Sparkles className="h-4 w-4 text-safebite-teal mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-safebite-teal mb-1">Suggestion:</p>
                <p className="text-sm text-safebite-text">{proactiveSuggestion}</p>
                <div className="flex justify-end mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-safebite-text-secondary hover:text-safebite-text"
                    onClick={() => setShowProactiveSuggestion(false)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-safebite-teal"
                    onClick={handleProactiveSuggestionClick}
                  >
                    Ask this
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-safebite-card-bg-alt">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none bg-safebite-card-bg border-safebite-card-bg-alt focus-visible:ring-safebite-teal"
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`${
                      isSpeechRecognitionActive
                        ? 'bg-safebite-teal text-safebite-dark-blue'
                        : 'bg-safebite-card-bg'
                    }`}
                    onClick={toggleSpeechRecognition}
                    disabled={isLoading || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
                  >
                    {isSpeechRecognitionActive ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSpeechRecognitionActive ? 'Stop' : 'Start'} voice input</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-safebite-text-secondary text-center">
          <p>SafeBite AI provides general information, not medical advice.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedChatBot;
