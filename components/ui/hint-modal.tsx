import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hardcoded hints for now - will come from API later
const HINTS = [
  {
    id: 1,
    title: "Initial Approach",
    content: "Think about using a hash map to store the values and their indices.",
    details: {
      approach: "Using a hash map allows us to store each number as a key and its index as the value. This gives us O(1) lookup time.",
      example: "For array [2, 7, 11, 15] and target 9:\n1. Store each number and index in hash map\n2. For each number, check if (target - number) exists in map",
      code_snippet: `def two_sum(nums, target):
    seen = {}  # hash map to store numbers
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`,
      visualization: "nums: [2, 7, 11, 15], target: 9\n→ Check: 9 - 2 = 7\n→ Store: {2: 0}\n→ Check: 9 - 7 = 2 ✓\n→ Found pair: [0, 1]"
    },
    isRevealed: true,
    type: "concept",
  },
  {
    id: 2,
    title: "Optimization Hint",
    content: "You can solve this in a single pass through the array.",
    details: {
      approach: "Instead of using two loops (brute force), we can solve this in a single pass by using extra space (hash map) to trade space for time.",
      example: "Rather than checking every pair of numbers (n²), we store previously seen numbers and check for complements (n).",
      code_snippet: `# Brute Force (O(n²))
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]

# Optimized (O(n))
seen = {}
for i, num in enumerate(nums):
    if target - num in seen:
        return [seen[target - num], i]
    seen[num] = i`,
      visualization: "Time Complexity Comparison:\nBrute Force: O(n²) → 100 elements = 10,000 operations\nOptimized: O(n) → 100 elements = 100 operations"
    },
    isRevealed: true,
    type: "optimization",
  },
  {
    id: 3,
    title: "Code Structure",
    content: "Consider using early returns to handle edge cases first.",
    details: {
      approach: "Start by handling edge cases to make your code more robust and easier to understand. This includes checking for invalid inputs and boundary conditions.",
      example: "Common edge cases:\n1. Empty array\n2. Array with single element\n3. No solution exists\n4. Multiple solutions possible",
      code_snippet: `def solution(nums, target):
    # Edge cases
    if not nums or len(nums) < 2:
        return []  # or raise exception
        
    # Input validation
    if not isinstance(target, (int, float)):
        raise TypeError("Target must be a number")
        
    # Main logic
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
        
    return []  # No solution found`,
      visualization: "Code Flow:\n1. Validate inputs\n2. Handle edge cases\n3. Process main logic\n4. Handle no-solution case"
    },
    isRevealed: false,
    type: "implementation",
  },
  {
    id: 4,
    title: "Time Complexity",
    content: "The optimal solution should run in O(n) time.",
    details: {
      approach: "Understanding the time and space complexity helps in choosing the right approach. Here's a breakdown of different solutions.",
      example: "For an array of size n:\n1. Brute Force: O(n²) time, O(1) space\n2. Sorting: O(n log n) time, O(1) space\n3. Hash Map: O(n) time, O(n) space",
      code_snippet: `# Different approaches and their complexities

# 1. Brute Force - O(n²) time, O(1) space
def brute_force(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]

# 2. Sorting - O(n log n) time, O(1) space
def sorting_approach(nums, target):
    sorted_nums = sorted(enumerate(nums), key=lambda x: x[1])
    left, right = 0, len(nums) - 1
    while left < right:
        current_sum = sorted_nums[left][1] + sorted_nums[right][1]
        if current_sum == target:
            return [sorted_nums[left][0], sorted_nums[right][0]]
        if current_sum < target:
            left += 1
        else:
            right -= 1

# 3. Hash Map - O(n) time, O(n) space
def hash_map_approach(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i`,
      visualization: "Space-Time Tradeoff:\n\nApproach     Time       Space\n--------------------------------\nBrute Force  O(n²)      O(1)\nSorting      O(n log n)  O(1)\nHash Map     O(n)        O(n)"
    },
    isRevealed: false,
    type: "complexity",
  }
];

interface HintCardProps {
  hint: typeof HINTS[0];
  onReveal: (id: number) => void;
}

const HintCard = ({ hint, onReveal }: HintCardProps) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "concept":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "optimization":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "implementation":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "complexity":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      hint.isRevealed ? "bg-card" : "bg-muted/50"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className={getBadgeStyle(hint.type)}>
            {hint.type}
          </Badge>
          {!hint.isRevealed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReveal(hint.id)}
              className="text-muted-foreground hover:text-primary"
            >
              <Lock className="h-4 w-4 mr-1" />
              Reveal
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground hover:text-primary"
            >
              <Eye className="h-4 w-4 mr-1" />
              {showDetails ? 'Hide Details' : 'View Details'}
            </Button>
          )}
        </div>
        
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          {hint.title}
          {hint.isRevealed && <Sparkles className="h-4 w-4 text-yellow-500" />}
        </h3>
        
        {hint.isRevealed ? (
          <>
            <p className="text-sm text-muted-foreground">{hint.content}</p>
            
            {/* Detailed View */}
            {showDetails && (
              <Card className="mt-4 p-4 bg-muted/30">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Approach</h4>
                    <p className="text-sm text-muted-foreground">{hint.details.approach}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Example</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{hint.details.example}</p>
                  </div>
                  
                  {hint.details.code_snippet && (
                    <div>
                      <h4 className="font-medium mb-2">Code Example</h4>
                        <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
                          <code>{hint.details.code_snippet}</code>
                        </pre>
                      </div>
                  )}
                  
                  {hint.details.visualization && (
                    <div>
                      <h4 className="font-medium mb-2">Visualization</h4>
                        <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
                          <code>{hint.details.visualization}</code>
                        </pre>
                      </div>
                  )}
                </div>
              </Card>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-20 bg-muted/30 rounded-md">
            <EyeOff className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {hint.isRevealed && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
      )}
    </Card>
  );
};

export const HintModal = ({ isOpen, onClose }: HintModalProps) => {
  const [hints, setHints] = React.useState(HINTS);
  const [revealedCount, setRevealedCount] = React.useState(
    HINTS.filter(h => h.isRevealed).length
  );

  const handleReveal = (id: number) => {
    setHints(prev => 
      prev.map(hint => 
        hint.id === id ? { ...hint, isRevealed: true } : hint
      )
    );
    setRevealedCount(prev => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Problem Hints
            <Badge variant="secondary" className="ml-2">
              {revealedCount}/{hints.length} revealed
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {hints.map((hint) => (
              <HintCard
                key={hint.id}
                hint={hint}
                onReveal={handleReveal}
              />
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {hints.every(h => h.isRevealed) ? (
              <p className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                All hints revealed
              </p>
            ) : (
              <p className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                {hints.filter(h => !h.isRevealed).length} hints remaining
              </p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 