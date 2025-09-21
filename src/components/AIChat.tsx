import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ArrowLeft, Lightbulb, TrendingUp, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatProps {
  onBack: () => void;
}

const AIChat = ({ onBack }: AIChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      // Try to get existing chat sessions
      const chats = await apiClient.getUserChats();
      if (chats.chats && chats.chats.length > 0) {
        // For now, use the most recent chat
        const latestChat = chats.chats[0];
        setChatSession(latestChat);

        // Load chat messages
        const messagesResponse = await apiClient.getChatMessages(latestChat.id);
        const formattedMessages: Message[] = messagesResponse.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender as "user" | "ai",
          timestamp: new Date(msg.timestamp),
          suggestions: msg.suggestions,
        }));
        setMessages(formattedMessages);
      } else {
        // Create new chat session
        const newChat = await apiClient.createChatSession();
        setChatSession(newChat.chat);

        // Add welcome message
        const welcomeMessage: Message = {
          id: "welcome",
          content: "Hello! I'm your AI Career Advisor. I've analyzed your assessment results and I'm here to help you with personalized career guidance. What would you like to discuss?",
          sender: "ai",
          timestamp: new Date(),
          suggestions: [
            "Tell me more about AI/ML Engineer path",
            "How can I improve my missing skills?",
            "What's the job market like for my interests?",
            "Help me create a career transition plan",
          ],
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Fallback welcome message
      setMessages([{
        id: "welcome",
        content: "Welcome! I'm here to help you with career guidance. Please try logging in first.",
        sender: "ai",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !chatSession) return;

    setNewMessage("");
    setIsTyping(true);

    try {
      // Send message to backend and get AI response
      const response = await apiClient.sendChatMessage(chatSession.id, content);

      // Add user message to local state
      const userMessage: Message = {
        id: response.userMessage.id,
        content: response.userMessage.content,
        sender: response.userMessage.sender,
        timestamp: new Date(response.userMessage.timestamp),
      };

      // Add AI response to local state
      const aiMessage: Message = {
        id: response.aiMessage.id,
        content: response.aiMessage.content,
        sender: response.aiMessage.sender,
        timestamp: new Date(response.aiMessage.timestamp),
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };



  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">AI Career Advisor</h1>
                <p className="text-sm text-muted-foreground">Your personalized career guidance assistant</p>
              </div>
            </div>
            <div className="flex-1"></div>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-ai-primary" />
              <span>Career Guidance Chat</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex space-x-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={message.sender === "ai" ? "bg-gradient-primary text-white" : "bg-secondary"}>
                          {message.sender === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-lg p-3 ${
                        message.sender === "user" 
                          ? "bg-ai-primary text-white" 
                          : "bg-muted"
                      }`}>
                        <div className="text-sm whitespace-pre-line">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-medium opacity-80">💡 Try asking:</div>
                            <div className="space-y-1">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="block w-full text-left text-xs p-2 bg-background/20 hover:bg-background/30 rounded border border-border/20 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3 max-w-[80%]">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-primary text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-ai-primary rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-ai-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-ai-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about your career..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(newMessage);
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSendMessage(newMessage)}
                  disabled={!newMessage.trim() || isTyping}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Career Planning
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Market Insights
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Skill Development
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;
