import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp, Users, Zap, CheckCircle } from "lucide-react";
import aiCareerHero from "@/assets/ai-career-hero.jpg";
import AssessmentFlow from "@/components/AssessmentFlow";
import CareerDashboard from "@/components/CareerDashboard";
import AIChat from "@/components/AIChat";

interface AssessmentResults {
  skills: string[];
  interests: string[];
  personality: Record<string, number>;
  experience: string;
  goals: string[];
}

const Index = () => {
  const [currentView, setCurrentView] = useState<"home" | "assessment" | "dashboard" | "chat">("home");
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);

  const handleStartAssessment = () => {
    setCurrentView("assessment");
  };

  const handleAssessmentComplete = (results: AssessmentResults) => {
    setAssessmentResults(results);
    setCurrentView("dashboard");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  const handleStartChat = () => {
    setCurrentView("chat");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  if (currentView === "assessment") {
    return (
      <AssessmentFlow 
        onComplete={handleAssessmentComplete}
        onBack={handleBackToHome}
      />
    );
  }

  if (currentView === "dashboard" && assessmentResults) {
    return (
      <CareerDashboard 
        results={assessmentResults}
        onStartChat={handleStartChat}
      />
    );
  }

  if (currentView === "chat") {
    return (
      <AIChat onBack={handleBackToDashboard} />
    );
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your skills, personality, and market trends to provide personalized career guidance.",
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "87.5-93% accuracy in career predictions through comprehensive skill mapping and personality profiling.",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Real-time job market data integration provides current salary trends and skill demand analysis.",
    },
    {
      icon: Users,
      title: "Personalized Guidance",
      description: "Tailored recommendations based on your unique profile, goals, and industry preferences.",
    },
  ];

  const stats = [
    { value: "93%", label: "Prediction Accuracy" },
    { value: "68%", label: "Successful Transitions" },
    { value: "85%", label: "User Satisfaction" },
    { value: "25%", label: "Performance Improvement" },
  ];

  const benefits = [
    "Comprehensive skills gap analysis",
    "Personalized learning pathways",
    "Real-time market insights",
    "Interview preparation tools",
    "Resume optimization guidance",
    "Career transition support",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CareerAI
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#results" className="text-muted-foreground hover:text-foreground transition-colors">Results</a>
          </nav>
          <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-ai-muted text-ai-primary border-ai-primary/20">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered Career Guidance
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Transform Your Career with{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    AI Intelligence
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
                  Discover your perfect career path through advanced AI analysis, personalized skill mapping, 
                  and real-time market intelligence. Join thousands who've successfully transformed their careers.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                  onClick={handleStartAssessment}
                >
                  Start AI Assessment
                </Button>
                <Button size="lg" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                  View Demo
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-ai-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
              <img 
                src={aiCareerHero} 
                alt="AI Career Advisor Interface" 
                className="relative rounded-3xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-ai-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our cutting-edge AI combines machine learning, natural language processing, 
              and real-time market data to deliver unprecedented career guidance accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-ai transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-gradient-primary rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Comprehensive Career Development Platform
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                From skills assessment to job placement, our AI-powered platform provides 
                end-to-end career guidance that adapts to your unique profile and goals.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-ai-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-l-4 border-l-ai-primary bg-gradient-secondary">
                <h3 className="font-semibold text-lg mb-2">Skills Gap Analysis</h3>
                <p className="text-muted-foreground">
                  Identify missing competencies with 82.5% precision and receive personalized learning recommendations.
                </p>
              </Card>
              
              <Card className="p-6 border-l-4 border-l-ai-secondary bg-gradient-secondary">
                <h3 className="font-semibold text-lg mb-2">Market Intelligence</h3>
                <p className="text-muted-foreground">
                  Real-time job market data from major platforms provides current salary and demand insights.
                </p>
              </Card>
              
              <Card className="p-6 border-l-4 border-l-ai-accent bg-gradient-secondary">
                <h3 className="font-semibold text-lg mb-2">Personality Profiling</h3>
                <p className="text-muted-foreground">
                  Big Five personality assessment ensures career recommendations align with your natural traits.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who have successfully navigated career transitions 
              with our AI-powered guidance system.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-ai-primary hover:bg-white/90 hover:shadow-glow transition-all duration-300 transform hover:scale-105"
              onClick={handleStartAssessment}
            >
              Start Your AI Assessment Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                CareerAI
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 CareerAI. Transforming careers with artificial intelligence.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;