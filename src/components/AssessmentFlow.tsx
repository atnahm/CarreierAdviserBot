import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Brain, Target, User } from "lucide-react";

interface AssessmentFlowProps {
  onComplete: (results: AssessmentResults) => void;
  onBack: () => void;
}

interface AssessmentResults {
  skills: string[];
  interests: string[];
  personality: Record<string, number>;
  experience: string;
  goals: string[];
}

const AssessmentFlow = ({ onComplete, onBack }: AssessmentFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<AssessmentResults>({
    skills: [],
    interests: [],
    personality: {},
    experience: "",
    goals: [],
  });

  const steps = [
    {
      id: "skills",
      title: "Technical Skills Assessment",
      description: "Select your current technical competencies",
      icon: Brain,
    },
    {
      id: "interests",
      title: "Career Interests",
      description: "What areas of work excite you most?",
      icon: Target,
    },
    {
      id: "personality",
      title: "Personality Profile",
      description: "Help us understand your work style preferences",
      icon: User,
    },
  ];

  const skillCategories = {
    "Programming": ["JavaScript", "Python", "Java", "C++", "React", "Node.js", "SQL"],
    "Design": ["UI/UX Design", "Graphic Design", "Product Design", "Figma", "Adobe Creative Suite"],
    "Data": ["Data Analysis", "Machine Learning", "Statistics", "Excel", "Tableau", "R"],
    "Business": ["Project Management", "Marketing", "Sales", "Strategy", "Operations"],
    "Communication": ["Public Speaking", "Writing", "Leadership", "Team Collaboration"],
  };

  const interests = [
    "Technology & Innovation",
    "Creative Problem Solving",
    "Leadership & Management",
    "Data & Analytics",
    "User Experience",
    "Business Strategy",
    "Social Impact",
    "Research & Development",
    "Education & Training",
    "Healthcare",
    "Finance",
    "Marketing & Communications",
  ];

  const personalityQuestions = [
    {
      id: "openness",
      question: "I enjoy exploring new ideas and creative approaches to work",
      trait: "Openness to Experience",
    },
    {
      id: "conscientiousness", 
      question: "I prefer structured environments and detailed planning",
      trait: "Conscientiousness",
    },
    {
      id: "extraversion",
      question: "I thrive when working with teams and in social environments",
      trait: "Extraversion",
    },
    {
      id: "agreeableness",
      question: "I prioritize harmony and collaboration in the workplace",
      trait: "Agreeableness",
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSkillToggle = (skill: string) => {
    setResults(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setResults(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handlePersonalityResponse = (questionId: string, value: string) => {
    setResults(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        [questionId]: parseInt(value),
      },
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return results.skills.length > 0;
      case 1:
        return results.interests.length > 0;
      case 2:
        return Object.keys(results.personality).length === personalityQuestions.length;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(results);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <StepIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-cursive">{currentStepData.title}</h1>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </div>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <StepIcon className="h-5 w-5 text-ai-primary" />
              <span>{currentStepData.title}</span>
            </CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                {Object.entries(skillCategories).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3 text-ai-primary">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skills.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={results.skills.includes(skill)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <Label htmlFor={skill} className="text-sm cursor-pointer">
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-ai-muted/20 transition-colors">
                    <Checkbox
                      id={interest}
                      checked={results.interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <Label htmlFor={interest} className="cursor-pointer flex-1">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                {personalityQuestions.map((question) => (
                  <div key={question.id} className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">{question.question}</h3>
                      <p className="text-sm text-muted-foreground">Assessing: {question.trait}</p>
                    </div>
                    
                    <RadioGroup
                      value={results.personality[question.id]?.toString() || ""}
                      onValueChange={(value) => handlePersonalityResponse(question.id, value)}
                      className="flex space-x-6"
                    >
                      {[
                        { value: "1", label: "Strongly Disagree" },
                        { value: "2", label: "Disagree" },
                        { value: "3", label: "Neutral" },
                        { value: "4", label: "Agree" },
                        { value: "5", label: "Strongly Agree" },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                          <Label htmlFor={`${question.id}-${option.value}`} className="text-sm cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? "Back to Home" : "Previous"}
          </Button>
          
          <Button 
            onClick={nextStep}
            disabled={!canProceed()}
            className="bg-gradient-primary hover:shadow-glow"
          >
            {currentStep === steps.length - 1 ? "Complete Assessment" : "Next Step"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentFlow;