import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown,
  Globe,
  MapPin,
  Clock,
  BarChart3,
  Zap
} from "lucide-react";

const SkillDemandHeatmap = () => {
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  const skillDemandData = {
    global: [
      {
        skill: "AI Ethics in Healthcare",
        demand: 94,
        change: 23,
        trend: "up",
        jobs: 1247,
        avgSalary: "$145K",
        topLocations: ["Nordic Countries", "Switzerland", "Netherlands"]
      },
      {
        skill: "Quantum Machine Learning",
        demand: 89,
        change: 31,
        trend: "up", 
        jobs: 892,
        avgSalary: "$180K",
        topLocations: ["Silicon Valley", "Toronto", "London"]
      },
      {
        skill: "Sustainable Supply Chain AI",
        demand: 87,
        change: 18,
        trend: "up",
        jobs: 1563,
        avgSalary: "$125K", 
        topLocations: ["Germany", "Denmark", "Costa Rica"]
      },
      {
        skill: "Blockchain Security Auditing",
        demand: 83,
        change: -5,
        trend: "down",
        jobs: 743,
        avgSalary: "$165K",
        topLocations: ["Singapore", "Dubai", "Malta"]
      },
      {
        skill: "Neural Interface Programming",
        demand: 78,
        change: 42,
        trend: "up",
        jobs: 234,
        avgSalary: "$220K",
        topLocations: ["California", "Massachusetts", "Israel"]
      }
    ],
    "north-america": [
      {
        skill: "Edge AI Optimization",
        demand: 92,
        change: 27,
        trend: "up",
        jobs: 2341,
        avgSalary: "$155K",
        topLocations: ["Seattle", "Austin", "Boston"]
      },
      {
        skill: "Climate Tech Data Science",
        demand: 88,
        change: 19,
        trend: "up",
        jobs: 1876,
        avgSalary: "$140K",
        topLocations: ["San Francisco", "Toronto", "Vancouver"]
      }
    ],
    europe: [
      {
        skill: "GDPR-Compliant AI Systems",
        demand: 96,
        change: 34,
        trend: "up",
        jobs: 3245,
        avgSalary: "€130K",
        topLocations: ["Amsterdam", "Berlin", "Stockholm"]
      },
      {
        skill: "Renewable Energy AI",
        demand: 91,
        change: 22,
        trend: "up",
        jobs: 2187,
        avgSalary: "€125K",
        topLocations: ["Copenhagen", "Munich", "Oslo"]
      }
    ]
  };

  const getDemandColor = (demand: number) => {
    if (demand >= 90) return "bg-red-500";
    if (demand >= 80) return "bg-orange-500";
    if (demand >= 70) return "bg-yellow-500";
    if (demand >= 60) return "bg-blue-500";
    return "bg-gray-400";
  };

  const getTrendIcon = (trend: string, change: number) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const currentData = skillDemandData[selectedRegion as keyof typeof skillDemandData];

  return (
    <div className="space-y-6 glass-panel p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold headline-bauhaus">Real-Time Skill Demand Heatmap</h2>
        <p className="text-muted-foreground">
          Live demand tracking across geographies and industries
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">🌍 Global</SelectItem>
            <SelectItem value="north-america">🇺🇸 North America</SelectItem>
            <SelectItem value="europe">🇪🇺 Europe</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {currentData.map((skill, index) => (
          <Card key={index} className="glass-card liquid-motion">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getDemandColor(skill.demand)}`}></div>
                  <h3 className="font-semibold text-lg">{skill.skill}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(skill.trend, skill.change)}
                  <span className={`font-semibold ${
                    skill.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {skill.change > 0 ? "+" : ""}{skill.change}%
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Demand Score</p>
                  <p className="text-2xl font-bold text-ai-primary">{skill.demand}/100</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-xl font-semibold">{skill.jobs.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Avg Salary</p>
                  <p className="text-xl font-semibold text-green-600">{skill.avgSalary}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Hotspots</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skill.topLocations.map((location, locIndex) => (
                      <Badge key={locIndex} variant="outline" className="text-xs">
                        <MapPin className="h-2 w-2 mr-1" />
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  View Trends
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Set Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card bg-gradient-secondary border-ai-primary/20 liquid-motion">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-ai-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-ai-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Live Market Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Data aggregated from LinkedIn Jobs, Indeed, Glassdoor, and 50+ job boards. 
                Updated every 15 minutes with micro-trend analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button className="bg-gradient-primary hover:shadow-glow">
          <Globe className="h-4 w-4 mr-2" />
          Explore Full Global Heatmap
        </Button>
      </div>
    </div>
  );
};

export default SkillDemandHeatmap;