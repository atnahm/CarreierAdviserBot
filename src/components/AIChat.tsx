import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ArrowLeft, Lightbulb, TrendingUp, BookOpen } from "lucide-react";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Career Advisor. I've analyzed your assessment results and I'm here to help you with personalized career guidance. What would you like to discuss?",
      sender: "ai",
      timestamp: new Date(),
      suggestions: [
        "Tell me more about AI/ML Engineer path",
        "How can I improve my missing skills?",
        "What's the job market like for my interests?",
        "Help me create a career transition plan",
      ],
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userMessage: string): Message => {
    // Simple mock AI responses based on keywords
    let response = "";
    let suggestions: string[] = [];

    if (userMessage.toLowerCase().includes("ai") || userMessage.toLowerCase().includes("ml") || userMessage.toLowerCase().includes("engineer")) {
      response = "Great choice! As an AI/ML Engineer, you'll be at the forefront of technology innovation. Based on your assessment, you have strong programming fundamentals which is excellent. Here's what I recommend:\n\n✅ Your Python and JavaScript skills are perfect starting points\n⚡ Focus on learning TensorFlow/PyTorch for deep learning\n📊 Strengthen your statistics and linear algebra foundation\n🐳 Docker and Kubernetes are crucial for MLOPs - high priority\n\nThe job market is extremely hot right now with 22% growth projected. Would you like me to create a detailed 6-month learning roadmap?";
      suggestions = [
        "Create a 6-month ML learning plan",
        "Show me ML Engineer job openings",
        "What ML projects should I build?",
        "How much can I earn as an ML Engineer?",
      ];
    } else if (userMessage.toLowerCase().includes("skill") || userMessage.toLowerCase().includes("improve") || userMessage.toLowerCase().includes("learn")) {
      response = "Perfect question! Based on your skills gap analysis, here's my prioritized recommendation:\n\n🎯 **High Priority Skills (Next 3 months):**\n• Docker & Kubernetes - Essential for modern deployment\n• System Design - Critical for senior roles\n• MLOps - Bridges development to production\n\n📚 **Learning Strategy:**\n• Hands-on projects beat theory every time\n• Contribute to open-source ML projects\n• Build and deploy at least 3 end-to-end ML applications\n\nYour learning style (high openness score) suggests you'll excel with experimental, project-based learning. Want specific course recommendations?";
      suggestions = [
        "Give me specific course recommendations",
        "How long will it take to learn these skills?",
        "What projects should I build?",
        "Find me mentors in ML field",
      ];
    } else if (userMessage.toLowerCase().includes("job") || userMessage.toLowerCase().includes("market") || userMessage.toLowerCase().includes("salary")) {
      response = "The job market analysis for your profile is very promising! Here's the current landscape:\n\n💰 **Salary Ranges:**\n• AI/ML Engineer: $120K-$180K (your top match)\n• Product Manager: $110K-$160K  \n• UX Designer: $85K-$130K\n\n📈 **Market Trends:**\n• AI roles growing 22% annually\n• 89% offer remote work options\n• Average response rate: 73% for qualified candidates\n\n🏢 **Hot Companies Hiring:**\nGoogle, Microsoft, OpenAI, Tesla are actively recruiting. Your technical background + high conscientiousness score makes you very attractive to employers.";
      suggestions = [
        "Show me current job openings",
        "How to optimize my resume for AI roles?",
        "What interview questions should I expect?",
        "Help me negotiate my salary",
      ];
    } else if (userMessage.toLowerCase().includes("transition") || userMessage.toLowerCase().includes("plan") || userMessage.toLowerCase().includes("roadmap")) {
      response = "Let's create your personalized career transition roadmap! Based on your profile, here's a strategic 6-month plan:\n\n🗓️ **Month 1-2: Foundation Building**\n• Complete Docker/Kubernetes course\n• Build first ML project end-to-end\n• Update portfolio and LinkedIn\n\n🗓️ **Month 3-4: Skill Deepening**\n• Advanced ML algorithms course\n• Contribute to 2 open-source projects\n• Network with ML professionals\n\n🗓️ **Month 5-6: Job Market Entry**\n• Apply to target companies\n• Technical interview preparation\n• Salary negotiation practice\n\nYour high conscientiousness suggests you'll excel with structured timelines. Ready to dive deeper into any specific month?";
      suggestions = [
        "Detail Month 1-2 specific tasks",
        "Help me find open-source projects",
        "Create a networking strategy",
        "Practice technical interviews",
      ];
    } else {
      response = "I understand you're looking for career guidance. As your AI advisor, I'm here to help with:\n\n🎯 **Career Path Optimization**\n📊 **Skills Development Strategy** \n💼 **Job Market Intelligence**\n🚀 **Transition Planning**\n📈 **Salary Negotiation**\n\nBased on your assessment, you're well-positioned for success in AI/ML roles. Your combination of technical skills, high openness to experience, and strong problem-solving abilities align perfectly with the current market demands.\n\nWhat specific aspect of your career journey would you like to focus on?";
      suggestions = [
        "Help me choose between career paths",
        "Create a skill development plan",
        "Show me salary negotiation tips",
        "Find networking opportunities",
      ];
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: "ai",
      timestamp: new Date(),
      suggestions,
    };
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