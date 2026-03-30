import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  MessageCircle, 
  Star,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Lightbulb,
  Zap,
  Users,
  Trophy,
  Globe,
  Video
} from "lucide-react";
import PredictiveRoadmap from "./PredictiveRoadmap";
import SkillDemandHeatmap from "./SkillDemandHeatmap";
import VirtualMentors from "./VirtualMentors";
import CareerReputationScore from "./CareerReputationScore";

interface AssessmentResults {
  skills: string[];
  interests: string[];
  personality: Record<string, number>;
  experience: string;
  goals: string[];
}

interface CareerDashboardProps {
  results: AssessmentResults;
  onStartChat: () => void;
}

const CareerDashboard = ({ results, onStartChat }: CareerDashboardProps) => {
  const [selectedCareer, setSelectedCareer] = useState(0);

  // Mock AI-generated career recommendations based on assessment
  const careerRecommendations = [
    {
      title: "AI/ML Engineer",
      match: 94,
      description: "Build and deploy machine learning models and AI systems",
      salaryRange: "$120K - $180K",
      growth: "+22% (5 years)",
      skills: ["Python", "Machine Learning", "TensorFlow"],
      missingSkills: ["Docker", "Kubernetes", "MLOps"],
      companies: ["Google", "Microsoft", "OpenAI", "Tesla"],
      reasons: [
        "Strong technical skills alignment",
        "High openness to new experiences",
        "Interest in technology & innovation",
      ],
    },
    {
      title: "Product Manager",
      match: 87,
      description: "Lead product development and strategy for tech products",
      salaryRange: "$110K - $160K",
      growth: "+18% (5 years)",
      skills: ["Strategy", "Leadership", "Data Analysis"],
      missingSkills: ["Agile Methodologies", "User Research", "A/B Testing"],
      companies: ["Apple", "Meta", "Spotify", "Airbnb"],
      reasons: [
        "High agreeableness and conscientiousness",
        "Business strategy interest",
        "Strong communication skills",
      ],
    },
    {
      title: "UX Designer",
      match: 81,
      description: "Design user-centered digital experiences and interfaces",
      salaryRange: "$85K - $130K",
      growth: "+13% (5 years)",
      skills: ["UI/UX Design", "Figma", "User Research"],
      missingSkills: ["Prototyping", "Design Systems", "Usability Testing"],
      companies: ["Adobe", "Figma", "Uber", "Netflix"],
      reasons: [
        "Creative problem solving interest",
        "High openness score",
        "User experience focus",
      ],
    },
  ];

  // Mock skills gap analysis
  const skillsGapAnalysis = {
    strong: ["JavaScript", "Python", "React", "Problem Solving"],
    developing: ["Machine Learning", "Data Analysis", "Leadership"],
    missing: ["Docker", "Kubernetes", "System Design", "MLOps"],
  };

  // Mock learning recommendations
  const learningPaths = [
    {
      title: "Machine Learning Fundamentals",
      provider: "Coursera",
      duration: "6 weeks",
      level: "Beginner",
      rating: 4.8,
      relevance: 95,
    },
    {
      title: "Docker & Kubernetes Essentials",
      provider: "Udemy",
      duration: "4 weeks",
      level: "Intermediate",
      rating: 4.6,
      relevance: 88,
    },
    {
      title: "Product Management Bootcamp",
      provider: "Product School",
      duration: "8 weeks",
      level: "Beginner",
      rating: 4.7,
      relevance: 82,
    },
  ];

  const selectedCareerData = careerRecommendations[selectedCareer];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-100 to-cyan-100">
      {/* Header */}
      <div className="glass-panel border border-white/30 mx-4 mt-6 mb-6 p-4 md:p-6 md:mx-12">
        <div className="container mx-auto px-2 py-2 md:px-4 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl headline-bauhaus">Your <span className="bauhaus-underline">AI Career Analysis</span></h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">Personalized recommendations based on your unique profile</p>
            </div>
            <Button onClick={onStartChat} className="glass-badge text-white px-6 py-2 font-semibold transition transform hover:-translate-y-1 hover:shadow-glow bg-gradient-primary">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with AI Advisor
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="recommendations" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 glass-card p-1">
            <TabsTrigger value="recommendations" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Career Matches</span>
              <span className="sm:hidden">Matches</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Skills Analysis</span>
              <span className="sm:hidden">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Learning Paths</span>
              <span className="sm:hidden">Learning</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
              <span className="sm:hidden">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Future Careers</span>
              <span className="sm:hidden">Future</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Skill Demand</span>
              <span className="sm:hidden">Demand</span>
            </TabsTrigger>
            <TabsTrigger value="mentors" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">AI Mentors</span>
              <span className="sm:hidden">Mentors</span>
            </TabsTrigger>
            <TabsTrigger value="reputation" className="flex items-center justify-center space-x-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-white hover:bg-gradient-to-r from-cyan-500 to-blue-500 transition">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Reputation</span>
              <span className="sm:hidden">Score</span>
            </TabsTrigger>
          </TabsList>

          {/* Career Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Career List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-semibold">Top Career Matches</h2>
                {careerRecommendations.map((career, index) => (
                  <Card
                    key={index}
                    className={`glass-card cursor-pointer transition-all duration-300 ${
                      selectedCareer === index ? 'ring-2 ring-ai-primary shadow-glow' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCareer(index)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{career.title}</CardTitle>
                          <CardDescription className="mt-1">{career.salaryRange}</CardDescription>
                        </div>
                        <Badge 
                          className="bg-gradient-primary text-white font-semibold"
                          variant="secondary"
                        >
                          {career.match}% Match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {career.growth}
                        </span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Career Details */}
              <div className="lg:col-span-2">
                <Card className="glass-card h-fit liquid-motion">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl flex items-center">
                          {selectedCareerData.title}
                          <Badge className="ml-3 bg-gradient-primary text-white">
                            {selectedCareerData.match}% Match
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                          {selectedCareerData.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Salary & Growth */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Salary Range</h4>
                        <p className="text-2xl font-bold text-ai-primary">
                          {selectedCareerData.salaryRange}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Job Growth</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedCareerData.growth}
                        </p>
                      </div>
                    </div>

                    {/* Skills Match */}
                    <div>
                      <h4 className="font-semibold mb-3">Skills Analysis</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Your Matching Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCareerData.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Skills to Develop</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCareerData.missingSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="border-orange-300 text-orange-700">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Why This Match */}
                    <div>
                      <h4 className="font-semibold mb-3">Why This Career Fits You</h4>
                      <ul className="space-y-2">
                        {selectedCareerData.reasons.map((reason, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-ai-primary mr-2 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Top Companies */}
                    <div>
                      <h4 className="font-semibold mb-3">Top Hiring Companies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCareerData.companies.map((company) => (
                          <Badge key={company} variant="outline">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button className="bg-gradient-primary hover:shadow-glow">
                        View Job Openings
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                      <Button variant="outline">
                        Save Career Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Skills Analysis */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-green-600">Strong Skills</CardTitle>
                  <CardDescription>Your current competencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skillsGapAnalysis.strong.map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span>{skill}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Strong
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-yellow-600">Developing Skills</CardTitle>
                  <CardDescription>Areas for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skillsGapAnalysis.developing.map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span>{skill}</span>
                        <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                          Developing
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-red-600">Skills to Learn</CardTitle>
                  <CardDescription>Missing competencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skillsGapAnalysis.missing.map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span>{skill}</span>
                        <Badge variant="outline" className="border-red-300 text-red-700">
                          Missing
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Paths */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {learningPaths.map((course, index) => (
                <Card key={index} className="glass-card hover:-translate-y-1 hover:shadow-glow transition-transform duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge className="bg-gradient-primary text-white">
                        {course.relevance}% Relevant
                      </Badge>
                    </div>
                    <CardDescription>{course.provider}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Duration: {course.duration}</span>
                      <span>Level: {course.level}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">{course.rating}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Enroll Now
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personality Profile Summary</CardTitle>
                  <CardDescription>Based on Big Five assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(results.personality).map(([trait, score]) => (
                    <div key={trait} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{trait.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm text-muted-foreground">{score}/5</span>
                      </div>
                      <Progress value={(score / 5) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Intelligence</CardTitle>
                  <CardDescription>Real-time job market insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>AI/ML Engineer Demand</span>
                      <Badge className="bg-green-100 text-green-800">High</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Response Rate</span>
                      <span className="font-semibold">73%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Skills Premium</span>
                      <span className="font-semibold text-green-600">+25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Remote Opportunities</span>
                      <Badge className="bg-blue-100 text-blue-800">89% Available</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictive Career Roadmap */}
          <TabsContent value="roadmap">
            <PredictiveRoadmap />
          </TabsContent>

          {/* Real-Time Skill Demand Heatmap */}
          <TabsContent value="heatmap">
            <SkillDemandHeatmap />
          </TabsContent>

          {/* AI-Simulated Career Mentors */}
          <TabsContent value="mentors">
            <VirtualMentors />
          </TabsContent>

          {/* Career Reputation & Network Score */}
          <TabsContent value="reputation">
            <CareerReputationScore />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CareerDashboard;