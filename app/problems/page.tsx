'use client';

import { Problem, Pattern, Topic } from '@/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      const [patternsRes, topicsRes] = await Promise.all([
        fetch('/api/patterns'),
        fetch('/api/topics')
      ]);
      const [patternsData, topicsData] = await Promise.all([
        patternsRes.json(),
        topicsRes.json()
      ]);
      setPatterns(patternsData);
      setTopics(topicsData);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPattern !== "all") params.append('pattern_id', selectedPattern);
      if (selectedTopic !== "all") params.append('topic_id', selectedTopic);
      
      const res = await fetch(`/api/problems?${params}`);
      const data = await res.json();
      setProblems(data);
      setLoading(false);
    };
    fetchProblems();
  }, [selectedPattern, selectedTopic]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (!confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete problem');
      }

      // Remove the problem from the local state
      setProblems(problems.filter(p => p.id !== id));
      toast.success('Problem deleted successfully');
    } catch (error) {
      console.error('Error deleting problem:', error);
      toast.error('Failed to delete problem');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Problems</h1>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
          <Link href="/problems/new" className="text-white no-underline">
            Add Problem
          </Link>
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        {/* Pattern Select */}
        <Select.Root value={selectedPattern} onValueChange={setSelectedPattern}>
          <Select.Trigger className="inline-flex items-center justify-between rounded-md border border-gray-300 px-4 py-2 text-sm gap-2 bg-white w-[200px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary">
            <Select.Value placeholder="Filter by Pattern" />
            <Select.Icon>
              <ChevronDown className="h-4 w-4" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200">
              <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                <ChevronUp className="h-4 w-4" />
              </Select.ScrollUpButton>

              <Select.Viewport className="p-1">
                <Select.Item value="all" className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100">
                  <Select.ItemText>All Patterns</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>

                {patterns.map(pattern => (
                  <Select.Item
                    key={pattern.id}
                    value={pattern.id}
                    className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100"
                  >
                    <Select.ItemText>{pattern.name}</Select.ItemText>
                    <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>

              <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                <ChevronDown className="h-4 w-4" />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* Topic Select */}
        <Select.Root value={selectedTopic} onValueChange={setSelectedTopic}>
          <Select.Trigger className="inline-flex items-center justify-between rounded-md border border-gray-300 px-4 py-2 text-sm gap-2 bg-white w-[200px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary">
            <Select.Value placeholder="Filter by Topic" />
            <Select.Icon>
              <ChevronDown className="h-4 w-4" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200">
              <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                <ChevronUp className="h-4 w-4" />
              </Select.ScrollUpButton>

              <Select.Viewport className="p-1">
                <Select.Item value="all" className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100">
                  <Select.ItemText>All Topics</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>

                {topics.map(topic => (
                  <Select.Item
                    key={topic.id}
                    value={topic.id}
                    className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100"
                  >
                    <Select.ItemText>{topic.name}</Select.ItemText>
                    <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>

              <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                <ChevronDown className="h-4 w-4" />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-20 w-full bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          problems && problems.map(problem => (
            <Link key={problem.id} href={`/problems/${problem.id}`} className="no-underline">
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full relative group">
                <button
                  onClick={(e) => handleDelete(problem.id, e)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete problem"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{problem.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs text-white ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {problem.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {problem.patterns?.map(pattern => (
                    <span key={pattern.id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {pattern.name}
                    </span>
                  ))}
                  {problem.topics?.map(topic => (
                    <span key={topic.id} className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 