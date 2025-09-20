import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Zap, 
  Globe, 
  Atom, 
  Rocket, 
  Brain, 
  Shield,
  ExternalLink,
  Calendar,
  Target
} from "lucide-react";

const PredictiveRoadmap = () => {
  const [selectedTimeline, setSelectedTimeline] = useState("2025");

  const emergingCareers = {
    "2025": [
      {
        title: "AI Ethics Specialist",
        probability: 92,
        description: "Ensure responsible AI development and deployment",
        salaryRange: "$140K - $200K",
        skills: ["AI Ethics", "Policy Analysis", "Machine Learning"],
        companies: ["OpenAI", "Anthropic", "Google DeepMind"],
        icon: Shield,
        trend: "High demand due to AI regulation requirements"
      },
      {
        title: "Quantum Computing Safety Analyst", 
        probability: 78,
        description: "Secure quantum systems against emerging threats",
        salaryRange: "$180K - $250K",
        skills: ["Quantum Computing", "Cryptography", "Security"],
        companies: ["IBM Quantum", "Google Quantum AI", "IonQ"],
        icon: Atom,
        trend: "Growing with quantum computing breakthroughs"
      }
    ],
    "2027": [
      {
        title: "Space Resource Economist",
        probability: 85,
        description: "Manage economics of asteroid mining and space commerce",
        salaryRange: "$200K - $300K",
        skills: ["Space Economics", "Resource Analysis", "Policy"],
        companies: ["SpaceX", "Blue Origin", "Planetary Resources"],
        icon: Rocket,
        trend: "Critical for space commercialization"
      },
      {
        title: "Synthetic Biology Ethicist",
        probability: 74,
        description: "Navigate ethical implications of engineered organisms",
        salaryRange: "$130K - $180K",
        skills: ["Bioethics", "Synthetic Biology", "Regulation"],
        companies: ["Ginkgo Bioworks", "Zymergen", "Twist Bioscience"],
        icon: Brain,
        trend: "Essential as synthetic biology advances"
      }
    ],
    "2030": [
      {
        title: "Neural Interface Designer",
        probability: 69,
        description: "Create brain-computer interface experiences",
        salaryRange: "$250K - $400K",
        skills: ["Neuroscience", "UX Design", "Brain-Computer Interfaces"],
        companies: ["Neuralink", "Meta Reality Labs", "Synchron"],
        icon: Brain,
        trend: "Revolutionary field with massive potential"
      },
      {
        title: "Climate Geoengineering Coordinator",
        probability: 82,
        description: "Manage large-scale climate intervention projects",
        salaryRange: "$160K - $220K",
        skills: ["Climate Science", "Project Management", "Policy"],
        companies: ["Climeworks", "Carbon Engineering", "NOAA"],
        icon: Globe,
        trend: "Critical for climate crisis response"
      }
    ]
  };

  const timelineData = emergingCareers[selectedTimeline as keyof typeof emergingCareers];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Predictive Career Roadmap</h2>
        <p className="text-muted-foreground">
          AI-powered forecasting of future career opportunities based on emerging tech trends
        </p>
      </div>

      <Tabs value={selectedTimeline} onValueChange={setSelectedTimeline}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="2025">2025 Careers</TabsTrigger>
          <TabsTrigger value="2027">2027 Careers</TabsTrigger>
          <TabsTrigger value="2030">2030+ Careers</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeline} className="space-y-4">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {timelineData.map((career, index) => (
              <Card key={index} className="hover:shadow-ai transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-primary rounded-lg">
                        <career.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{career.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {career.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-gradient-primary text-white font-semibold">
                      {career.probability}% Likely
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Projected Salary</p>
                      <p className="text-lg font-semibold text-ai-primary">{career.salaryRange}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {career.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Leading Companies</p>
                    <div className="flex flex-wrap gap-2">
                      {career.companies.slice(0, 2).map((company) => (
                        <Badge key={company} variant="secondary" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                      {career.companies.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{career.companies.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{career.trend}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Target className="h-3 w-3 mr-1" />
                      Add to Goals
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Set Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-secondary border-ai-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-ai-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-ai-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Insight</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on patent filings, research trends, and market analysis, these careers have high emergence probability. 
                    Start building relevant skills now to be ahead of the curve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveRoadmap;