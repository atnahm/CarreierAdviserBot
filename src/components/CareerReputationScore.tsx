import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy,
  Users,
  Star,
  GitBranch,
  Linkedin,
  Award,
  TrendingUp,
  Shield,
  Target,
  Zap
} from "lucide-react";

const CareerReputationScore = () => {
  const reputationData = {
    overallScore: 847,
    maxScore: 1000,
    level: "Expert",
    percentile: 92,
    trend: "+23 this month"
  };

  const scoreBreakdown = [
    {
      category: "Technical Skills",
      score: 185,
      max: 200,
      description: "GitHub contributions, code quality, project impact",
      sources: ["GitHub", "Stack Overflow", "Technical Blogs"],
      recentActivity: "12 commits this week, 3 pull requests merged"
    },
    {
      category: "Professional Network", 
      score: 142,
      max: 150,
      description: "LinkedIn connections, endorsements, recommendations",
      sources: ["LinkedIn", "Professional Forums", "Industry Events"],
      recentActivity: "5 new endorsements, 2 recommendations received"
    },
    {
      category: "Knowledge Sharing",
      score: 98,
      max: 120,
      description: "Teaching, mentoring, content creation, conference talks",
      sources: ["Conference Speakers", "Online Courses", "Blog Posts"],
      recentActivity: "1 tech talk delivered, 3 blog posts published"
    },
    {
      category: "Industry Recognition",
      score: 89,
      max: 100,
      description: "Awards, certifications, peer recognition",
      sources: ["Industry Awards", "Certifications", "Peer Nominations"],
      recentActivity: "AWS certification earned, featured in tech newsletter"
    },
    {
      category: "Community Impact",
      score: 76,
      max: 100,
      description: "Open source contributions, volunteer work, social impact",
      sources: ["Open Source Projects", "Volunteer Platforms", "Social Impact"],
      recentActivity: "Contributed to 2 open source projects"
    },
    {
      category: "Thought Leadership",
      score: 67,
      max: 80,
      description: "Original ideas, innovation, industry influence",
      sources: ["Research Papers", "Patent Applications", "Industry Influence"],
      recentActivity: "Research paper in review, cited 8 times this month"
    }
  ];

  const achievements = [
    { 
      title: "GitHub Influencer", 
      icon: GitBranch, 
      description: "Top 5% contributor in your field",
      earnedDate: "2 weeks ago",
      rarity: "Rare"
    },
    {
      title: "Knowledge Catalyst",
      icon: Award,
      description: "Helped 100+ professionals through mentoring",
      earnedDate: "1 month ago", 
      rarity: "Epic"
    },
    {
      title: "Network Builder",
      icon: Users,
      description: "Built meaningful connections across 10+ companies",
      earnedDate: "3 weeks ago",
      rarity: "Common"
    },
    {
      title: "Innovation Pioneer",
      icon: Star,
      description: "First to implement emerging technology in your org",
      earnedDate: "2 months ago",
      rarity: "Legendary"
    }
  ];

  const networkStrength = {
    totalConnections: 1247,
    qualityScore: 8.4,
    influenceReach: 15600,
    mutualConnections: 89,
    industryLeaders: 23,
    crossIndustryBreadth: 7
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case "Common": return "text-gray-600";
      case "Rare": return "text-blue-600"; 
      case "Epic": return "text-purple-600";
      case "Legendary": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Career Reputation & Network Score</h2>
        <p className="text-muted-foreground">
          Gamified tracking of your professional reputation and network strength
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-primary text-white">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Trophy className="h-8 w-8" />
              <div>
                <h3 className="text-3xl font-bold">{reputationData.overallScore}</h3>
                <p className="text-lg opacity-90">{reputationData.level} Level</p>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              <Progress 
                value={(reputationData.overallScore / reputationData.maxScore) * 100} 
                className="h-3 bg-white/20"
              />
              <div className="flex justify-between text-sm mt-2 opacity-90">
                <span>0</span>
                <span>{reputationData.maxScore}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <p className="text-2xl font-bold">{reputationData.percentile}%</p>
                <p className="text-sm opacity-90">Top Percentile</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{reputationData.trend}</p>
                <p className="text-sm opacity-90">This Month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="network">Network Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {scoreBreakdown.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                    <Badge 
                      className={`${getScoreColor((category.score / category.max) * 100)} bg-transparent border-current`}
                      variant="outline"
                    >
                      {category.score}/{category.max}
                    </Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <Progress value={(category.score / category.max) * 100} className="h-2" />
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Data Sources</p>
                    <div className="flex flex-wrap gap-1">
                      {category.sources.map((source, sourceIndex) => (
                        <Badge key={sourceIndex} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Recent Activity</p>
                    <p className="text-sm">{category.recentActivity}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge 
                          className={`${getRarityColor(achievement.rarity)} bg-transparent border-current`}
                          variant="outline"
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Earned {achievement.earnedDate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-secondary border-ai-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-ai-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-ai-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Next Achievement Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    "Conference Speaker" - Give a talk at a major tech conference (67% progress)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="text-center">
                <Users className="h-8 w-8 mx-auto text-ai-primary mb-2" />
                <CardTitle className="text-2xl">{networkStrength.totalConnections}</CardTitle>
                <CardDescription>Total Connections</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Star className="h-8 w-8 mx-auto text-ai-primary mb-2" />
                <CardTitle className="text-2xl">{networkStrength.qualityScore}/10</CardTitle>
                <CardDescription>Network Quality</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-ai-primary mb-2" />
                <CardTitle className="text-2xl">{networkStrength.influenceReach.toLocaleString()}</CardTitle>
                <CardDescription>Influence Reach</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Network Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your professional network strength</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Industry Leaders Connected</p>
                  <p className="text-2xl font-bold text-ai-primary">{networkStrength.industryLeaders}</p>
                </div>
                <div>
                  <p className="font-medium">Cross-Industry Breadth</p>
                  <p className="text-2xl font-bold text-ai-primary">{networkStrength.crossIndustryBreadth} industries</p>
                </div>
                <div>
                  <p className="font-medium">Mutual Connections</p>
                  <p className="text-2xl font-bold text-ai-primary">{networkStrength.mutualConnections}</p>
                </div>
                <div>
                  <p className="font-medium">Network Growth</p>
                  <p className="text-2xl font-bold text-green-600">+12% this quarter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button className="bg-gradient-primary hover:shadow-glow">
          <Shield className="h-4 w-4 mr-2" />
          Boost Your Reputation Score
        </Button>
      </div>
    </div>
  );
};

export default CareerReputationScore;