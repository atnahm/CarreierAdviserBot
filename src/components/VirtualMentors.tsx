import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Video,
  MessageCircle,
  Star,
  PlayCircle,
  Users,
  Award,
  Calendar,
  Clock
} from "lucide-react";

const VirtualMentors = () => {
  const [selectedMentor, setSelectedMentor] = useState(0);

  const virtualMentors = [
    {
      name: "AI Satya Nadella",
      title: "CEO of Microsoft",
      specialization: "Technology Leadership & Innovation",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.9,
      sessions: 15642,
      description: "Get strategic insights on technology leadership, AI transformation, and building culture in tech companies.",
      capabilities: [
        "Leadership Strategy",
        "AI & Cloud Computing",
        "Corporate Transformation",
        "Team Building"
      ],
      sessionTypes: [
        { type: "Career Strategy Session", duration: "30 min", description: "Discuss your leadership path and strategic thinking" },
        { type: "Mock Interview", duration: "45 min", description: "Practice executive-level interviews" },
        { type: "Innovation Workshop", duration: "60 min", description: "Learn to drive innovation in organizations" }
      ],
      recentFeedback: [
        "Incredible strategic insights that transformed my approach to leadership",
        "The AI mentor felt genuinely like talking to Satya - amazing technology",
        "Got practical advice I couldn't find anywhere else"
      ]
    },
    {
      name: "AI Ada Lovelace",
      title: "Computing Pioneer & Mathematician",
      specialization: "STEM Innovation & Problem Solving",
      avatar: "/placeholder-avatar.jpg", 
      rating: 4.8,
      sessions: 8934,
      description: "Learn analytical thinking, mathematical problem-solving, and pioneering innovation in technology.",
      capabilities: [
        "Analytical Thinking",
        "Mathematical Reasoning",
        "Innovation Mindset",
        "STEM Career Guidance"
      ],
      sessionTypes: [
        { type: "Problem Solving Session", duration: "30 min", description: "Develop systematic approach to complex problems" },
        { type: "STEM Career Guidance", duration: "45 min", description: "Navigate challenges in technology careers" },
        { type: "Innovation Methodology", duration: "60 min", description: "Learn to think like a pioneer" }
      ],
      recentFeedback: [
        "Helped me approach technical problems from entirely new angles",
        "Inspiring guidance for women in STEM fields",
        "The historical perspective combined with modern insights is unique"
      ]
    },
    {
      name: "AI Steve Jobs",
      title: "Co-founder of Apple",
      specialization: "Product Vision & Entrepreneurship", 
      avatar: "/placeholder-avatar.jpg",
      rating: 4.7,
      sessions: 12456,
      description: "Master product thinking, design philosophy, and entrepreneurial vision that changed the world.",
      capabilities: [
        "Product Vision",
        "Design Thinking", 
        "Entrepreneurship",
        "Presentation Skills"
      ],
      sessionTypes: [
        { type: "Product Strategy", duration: "30 min", description: "Learn to think different about products" },
        { type: "Pitch Practice", duration: "45 min", description: "Master compelling presentations" },
        { type: "Entrepreneurial Mindset", duration: "60 min", description: "Develop revolutionary thinking" }
      ],
      recentFeedback: [
        "Transformed how I think about product development",
        "The design philosophy sessions were eye-opening", 
        "Gained confidence in presenting bold ideas"
      ]
    }
  ];

  const currentMentor = virtualMentors[selectedMentor];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">AI-Simulated Career Mentors</h2>
        <p className="text-muted-foreground">
          Interactive coaching with AI avatars of legendary leaders and innovators
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mentor Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold">Choose Your Mentor</h3>
          {virtualMentors.map((mentor, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedMentor === index ? 'ring-2 ring-ai-primary shadow-ai' : ''
              }`}
              onClick={() => setSelectedMentor(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.avatar} />
                    <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{mentor.name}</h4>
                    <p className="text-xs text-muted-foreground">{mentor.title}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs ml-1">{mentor.rating}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {mentor.sessions.toLocaleString()} sessions
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mentor Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentMentor.avatar} />
                  <AvatarFallback className="text-lg">
                    {currentMentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{currentMentor.name}</CardTitle>
                  <CardDescription className="text-base">{currentMentor.title}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">{currentMentor.specialization}</p>
                  
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1">{currentMentor.rating} rating</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm ml-1">{currentMentor.sessions.toLocaleString()} sessions</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{currentMentor.description}</p>

              <div>
                <h4 className="font-semibold mb-3">Core Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {currentMentor.capabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Available Session Types</h4>
                <div className="space-y-3">
                  {currentMentor.sessionTypes.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-ai-muted/20 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium">{session.type}</h5>
                        <p className="text-sm text-muted-foreground">{session.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {session.duration}
                        </div>
                        <Button size="sm">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recent User Feedback</h4>
                <div className="space-y-2">
                  {currentMentor.recentFeedback.map((feedback, index) => (
                    <div key={index} className="p-3 bg-gradient-secondary rounded-lg">
                      <p className="text-sm italic">"{feedback}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button className="bg-gradient-primary hover:shadow-glow">
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Session
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Quick Chat
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-gradient-secondary border-ai-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-ai-primary/10 rounded-lg">
              <Award className="h-5 w-5 text-ai-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Cutting-Edge AI Technology</h3>
              <p className="text-sm text-muted-foreground">
                Our mentors use advanced deepfake video generation, natural language processing, 
                and personality modeling to deliver authentic coaching experiences based on extensive 
                research of each leader's methodologies and philosophies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VirtualMentors;