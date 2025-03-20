"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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

export default function SimpleInterviewPage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleToggle = (value: string) => {
    if (selectedTopics.includes(value)) {
      setSelectedTopics(selectedTopics.filter((item) => item !== value));
    } else {
      setSelectedTopics([...selectedTopics, value]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Simple Topic Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Topics</h3>
            <div className="border rounded-md p-4">
              <div className="space-y-2">
                {TOPICS.map((topic) => (
                  <div
                    key={topic.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`topic-${topic.value}`}
                      checked={selectedTopics.includes(topic.value)}
                      onChange={() => handleToggle(topic.value)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`topic-${topic.value}`} className="text-sm">
                      {topic.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Topics */}
          <div>
            <h3 className="text-lg font-medium mb-2">Selected Topics</h3>
            {selectedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map((value) => {
                  const topic = TOPICS.find((t) => t.value === value);
                  return (
                    <div
                      key={value}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                    >
                      {topic?.label || value}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No topics selected
              </p>
            )}
          </div>

          {/* Debug Button */}
          <Button
            onClick={() => {
              console.log("Selected topics:", selectedTopics);
              toast.info(
                `Selected ${selectedTopics.length} topics: ${selectedTopics.join(", ")}`
              );
            }}
          >
            Debug Selected Topics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
