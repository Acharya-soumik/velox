"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  CheckCircle,
  Timer,
  Target,
  Server,
  Building,
  Building2,
  Globe,
  Briefcase,
  DollarSign,
  Rocket,
  Landmark,
  Cpu,
  Package,
  Database,
  Cloud,
  CreditCard,
  Shuffle,
  X,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const TOPICS = [
  { value: "arrays", label: "Arrays" },
  { value: "strings", label: "Strings" },
  { value: "linked_lists", label: "Linked Lists" },
  { value: "trees", label: "Trees" },
  { value: "graphs", label: "Graphs" },
  { value: "dynamic_programming", label: "Dynamic Programming" },
  { value: "sorting", label: "Sorting" },
  { value: "searching", label: "Searching" },
  { value: "recursion", label: "Recursion" },
  { value: "backtracking", label: "Backtracking" },
];

const TOPICS_MAP = TOPICS.reduce(
  (acc, topic) => {
    acc[topic.value] = topic.label;
    return acc;
  },
  {} as Record<string, string>
);

// Define company types with icons
const COMPANY_TYPES = [
  { value: "faang", label: "FAANG/MAANG", icon: Building },
  { value: "startup", label: "Startups", icon: Rocket },
  { value: "finance", label: "Financial", icon: DollarSign },
  { value: "enterprise", label: "Enterprise", icon: Building2 },
  { value: "tech", label: "Tech Giants", icon: Server },
  { value: "international", label: "International", icon: Globe },
];

// Define companies by type with icons
const COMPANIES_BY_TYPE = {
  faang: [
    { value: "meta", label: "Meta", icon: Building },
    { value: "apple", label: "Apple", icon: Cpu },
    { value: "amazon", label: "Amazon", icon: Package },
    { value: "netflix", label: "Netflix", icon: Server },
    { value: "google", label: "Google", icon: Globe },
    { value: "microsoft", label: "Microsoft", icon: Building2 },
  ],
  startup: [
    { value: "airbnb", label: "Airbnb", icon: Building },
    { value: "stripe", label: "Stripe", icon: CreditCard },
    { value: "uber", label: "Uber", icon: Globe },
    { value: "coinbase", label: "Coinbase", icon: DollarSign },
    { value: "robinhood", label: "Robinhood", icon: DollarSign },
  ],
  finance: [
    { value: "jpmorgan", label: "JP Morgan", icon: Landmark },
    { value: "goldman", label: "Goldman Sachs", icon: DollarSign },
    { value: "bofa", label: "Bank of America", icon: Landmark },
    { value: "visa", label: "Visa", icon: CreditCard },
  ],
  enterprise: [
    { value: "ibm", label: "IBM", icon: Server },
    { value: "oracle", label: "Oracle", icon: Database },
    { value: "salesforce", label: "Salesforce", icon: Cloud },
    { value: "sap", label: "SAP", icon: Package },
  ],
  tech: [
    { value: "twitter", label: "Twitter", icon: Globe },
    { value: "linkedin", label: "LinkedIn", icon: Briefcase },
    { value: "nvidia", label: "NVIDIA", icon: Cpu },
    { value: "adobe", label: "Adobe", icon: Server },
    { value: "paypal", label: "PayPal", icon: DollarSign },
  ],
  international: [
    { value: "alibaba", label: "Alibaba", icon: Package },
    { value: "tencent", label: "Tencent", icon: Globe },
    { value: "samsung", label: "Samsung", icon: Cpu },
    { value: "baidu", label: "Baidu", icon: Globe },
  ],
};

export default function InterviewConfig() {
  const router = useRouter();
  const { toast } = useToast();
  const [duration, setDuration] = useState(60); // in minutes
  const [difficulty, setDifficulty] = useState("medium");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [companyType, setCompanyType] = useState("faang");
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveInterview, setHasActiveInterview] = useState(false);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(
    null
  );
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // When company type changes, reset the selected target companies
  useEffect(() => {
    setTargetCompanies([]);
  }, [companyType]);

  // Check for active interview on component mount
  useEffect(() => {
    checkActiveInterview();
  }, []);

  const checkActiveInterview = () => {
    if (typeof window !== "undefined") {
      // Check localStorage for any active interview session
      const keys = Object.keys(localStorage);
      const interviewKeys = keys.filter((key) =>
        key.startsWith("interview_session_")
      );
      if (interviewKeys.length > 0) {
        const latestKey = interviewKeys.sort().pop();
        if (latestKey) {
          const interviewId = latestKey.replace("interview_session_", "");
          setHasActiveInterview(true);
          setActiveInterviewId(interviewId);
        }
      }
    }
  };

  const handleTopicToggle = (value: string) => {
    if (selectedTopics.includes(value)) {
      setSelectedTopics(selectedTopics.filter((item) => item !== value));
    } else {
      setSelectedTopics([...selectedTopics, value]);
    }
  };

  const handleSelectRandomTopic = () => {
    // Clear current selection
    setSelectedTopics([]);

    // Decide how many topics to select (1-3)
    const numTopics = Math.floor(Math.random() * 3) + 1;
    const allTopics = Object.keys(TOPICS_MAP);
    const shuffledTopics = [...allTopics].sort(() => 0.5 - Math.random());
    const randomTopics = shuffledTopics.slice(0, numTopics);

    // Set the selected topics
    setSelectedTopics(randomTopics);

    // Show feedback to the user
    const topicLabels = randomTopics
      .map((topicValue) => TOPICS_MAP[topicValue])
      .join(", ");

    toast({
      title: "Random Topics",
      description: `Randomly selected: ${topicLabels}`,
      variant: "default",
    });
  };

  const handleSelectRandomCompanies = () => {
    // Get available companies for the selected company type
    const availableCompanies = COMPANIES_BY_TYPE[companyType] || [];

    if (availableCompanies.length === 0) {
      toast({
        title: "No Companies",
        description: "No companies available for this company type",
        variant: "destructive",
      });
      return;
    }

    // Clear current selection
    setTargetCompanies([]);

    // Decide how many companies to select (1-2)
    const numCompanies = Math.floor(Math.random() * 2) + 1;
    const shuffledCompanies = [...availableCompanies]
      .sort(() => 0.5 - Math.random())
      .map((c) => c.value);
    const randomCompanies = shuffledCompanies.slice(0, numCompanies);

    // Set the selected companies
    setTargetCompanies(randomCompanies);

    // Show feedback to the user
    const companyLabels = randomCompanies
      .map((value) => {
        const company = availableCompanies.find((c) => c.value === value);
        return company ? company.label : value;
      })
      .join(", ");

    toast({
      title: "Random Companies",
      description: `Randomly selected: ${companyLabels}`,
      variant: "default",
    });
  };

  const handleCompanyToggle = (value: string) => {
    if (targetCompanies.includes(value)) {
      setTargetCompanies(targetCompanies.filter((item) => item !== value));
    } else {
      setTargetCompanies([...targetCompanies, value]);
    }
  };

  const startInterview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTopics.length === 0) {
      toast({
        title: "Select Topics",
        description: "Please select at least one topic for your interview",
        variant: "destructive",
      });
      return;
    }

    if (hasActiveInterview) {
      const confirmNew = window.confirm(
        "You have an unfinished interview. Starting a new one will abandon your progress. Do you want to continue?"
      );

      if (!confirmNew) {
        // Redirect to the active interview
        if (activeInterviewId) {
          router.push(`/interview/${activeInterviewId}`);
        }
        return;
      }

      // Clear the active interview if user confirms
      if (activeInterviewId && typeof window !== "undefined") {
        localStorage.removeItem(`interview_session_${activeInterviewId}`);
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/interview/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topics: selectedTopics,
          difficulty,
          duration,
          companyType,
          targetCompanies:
            targetCompanies.length > 0 ? targetCompanies : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create interview");
      }

      const data = await response.json();
      console.log("Interview created:", data);

      // Store mock interview data in localStorage if it's a mock interview
      if (data.isMockInterview && typeof window !== "undefined") {
        localStorage.setItem(
          `interview_session_${data.id}`,
          JSON.stringify(data)
        );
        console.log("Stored mock interview data in localStorage:", data.id);
      }

      router.push(`/interview/${data.id}`);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Error",
        description: "Failed to start the interview. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleQuickRandomInterview = async () => {
    // Get random topics
    setIsLoading(true);
    try {
      // Set a random difficulty
      const difficulties = DIFFICULTY_OPTIONS.map((d) => d.value);
      const randomDifficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];
      setDifficulty(randomDifficulty);

      // Set random topics (1-3)
      handleSelectRandomTopic();

      // Set a random company type
      const companyTypes = COMPANY_TYPES.map((c) => c.value);
      const randomCompanyType =
        companyTypes[Math.floor(Math.random() * companyTypes.length)];
      setCompanyType(randomCompanyType);

      // Wait to ensure company type is set before selecting random companies
      setTimeout(() => {
        // Set random target companies
        handleSelectRandomCompanies();

        // Finally start the interview
        setTimeout(() => {
          // Use null as the event parameter as we're triggering this programmatically
          startInterview({ preventDefault: () => {} } as React.FormEvent);
        }, 100);
      }, 100);
    } catch (error) {
      console.error("Error starting quick random interview:", error);
      toast({
        title: "Error",
        description: "Failed to start a random interview. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
    toast({
      title: "Debug Mode",
      description: `Debug information is now ${showDebugInfo ? "hidden" : "visible"}`,
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Interview Practice</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <form onSubmit={startInterview}>
            <CardHeader>
              <CardTitle>Configure Interview</CardTitle>
              <CardDescription>
                Customize your interview settings to match your practice goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasActiveInterview && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">
                    You have an unfinished interview
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    You can continue your previous interview or start a new one.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/interview/${activeInterviewId}`)
                    }
                    className="mr-2"
                  >
                    Continue Interview
                  </Button>
                </div>
              )}

              {/* Interview Selection Info */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  How Question Selection Works
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  We'll select 1-3 questions that match your selected topics. If
                  we can't find enough direct matches, we'll include questions
                  with related patterns.
                </p>
                <div className="bg-white p-3 rounded-md text-xs space-y-1.5 text-blue-900">
                  <p className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                    <strong>Direct Matches:</strong> Questions with your
                    selected topics
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                    <strong>Pattern Matches:</strong> Questions with related
                    patterns to your topics
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    <strong>Company Style:</strong> Tailored to your selected
                    companies
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  Duration (minutes)
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[duration]}
                    onValueChange={(value: number[]) => setDuration(value[0])}
                    min={30}
                    max={180}
                    step={15}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-medium">
                    {duration} min
                  </span>
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topics */}
              <div className="space-y-4">
                <Label>Topics</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {TOPICS.map((topic) => (
                      <div
                        key={topic.value}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`topic-${topic.value}`}
                          checked={selectedTopics.includes(topic.value)}
                          onChange={() => handleTopicToggle(topic.value)}
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor={`topic-${topic.value}`}
                          className="text-sm"
                        >
                          {topic.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {selectedTopics.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Selected {selectedTopics.length} topic(s)
                    </div>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={handleSelectRandomTopic}
                          className="gap-2 ml-auto"
                        >
                          <Shuffle className="h-4 w-4" />
                          Random Topics
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select 1-3 random topics for your interview</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Company Type */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Company Type
                </Label>
                <Select value={companyType} onValueChange={setCompanyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Companies */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Target Companies
                </Label>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-3">
                    {COMPANIES_BY_TYPE[companyType]?.map((company) => {
                      const Icon = company.icon;
                      return (
                        <div
                          key={company.value}
                          className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                            targetCompanies.includes(company.value)
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`company-${company.value}`}
                            checked={targetCompanies.includes(company.value)}
                            onChange={() => handleCompanyToggle(company.value)}
                            className="h-4 w-4"
                          />
                          <label
                            htmlFor={`company-${company.value}`}
                            className="text-sm flex items-center cursor-pointer flex-1"
                          >
                            <Icon className="h-4 w-4 mr-2 text-primary" />
                            {company.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected companies pills */}
                {targetCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {targetCompanies.map((value) => {
                      const company = COMPANIES_BY_TYPE[companyType]?.find(
                        (c) => c.value === value
                      );
                      if (!company) return null;

                      const Icon = company.icon;
                      return (
                        <div
                          key={value}
                          className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs flex items-center gap-2 border border-primary/20 shadow-sm"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {company.label}
                          <button
                            type="button"
                            onClick={() => handleCompanyToggle(value)}
                            className="text-primary hover:text-primary/80 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  {targetCompanies.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Selected {targetCompanies.length} company/companies
                    </div>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={handleSelectRandomCompanies}
                          className="gap-2 ml-auto"
                        >
                          <Shuffle className="h-4 w-4" />
                          Random Company
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select 1-2 random target companies</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleQuickRandomInterview}
                  disabled={isLoading}
                  className="relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out group-hover:w-full opacity-10"></div>
                  {isLoading ? (
                    <>
                      <span className="mr-2">Loading...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="relative z-10">
                        Quick Random Interview
                      </span>
                    </>
                  )}
                </Button>
                <Button type="submit" disabled={isLoading} className="px-6">
                  {isLoading ? (
                    <>
                      <span className="mr-2">Starting...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </div>

              {/* Debug Button */}
              <Button
                variant="outline"
                type="button"
                className="w-full mt-2"
                onClick={toggleDebugInfo}
              >
                Debug Mode
              </Button>

              {showDebugInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-semibold mb-2">
                    Debug Information
                  </h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Duration: {duration} minutes</p>
                    <p>Difficulty: {difficulty}</p>
                    <p>Topics: {selectedTopics.join(", ") || "None"}</p>
                    <p>Company Type: {companyType}</p>
                    <p>
                      Target Companies: {targetCompanies.join(", ") || "None"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </form>
        </Card>

        {/* Right column - maybe tips or history */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                <span>Answer questions as if you were in a real interview</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                <span>Practice explaining your thought process out loud</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                <span>Time yourself to simulate real interview conditions</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                <span>Review feedback to improve your performance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
