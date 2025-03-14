'use client';

import { CreateProblemInput, Pattern, Topic } from '@/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check, X, Search } from 'lucide-react';

export default function NewProblemPage() {
  const router = useRouter();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [patternSearch, setPatternSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [formData, setFormData] = useState<CreateProblemInput>({
    title: '',
    description: '',
    difficulty: 'easy',
    category: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    test_cases: [{ input: {}, output: null }],
    time_complexity: '',
    space_complexity: '',
    context: '',
    pattern_ids: [],
    topic_ids: []
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send the form data directly without additional JSON serialization
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)  // formData is already in the correct format
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create problem');
      }

      router.push('/problems');
    } catch (error: any) {
      console.error('Error creating problem:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleChange = (index: number, field: keyof typeof formData.examples[0], value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const handleConstraintChange = (index: number, value: string) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = value;
    setFormData({ ...formData, constraints: newConstraints });
  };

  const addConstraint = () => {
    setFormData({
      ...formData,
      constraints: [...formData.constraints, '']
    });
  };

  // Filter patterns based on search
  const filteredPatterns = patterns?.filter?.(pattern =>
    pattern?.name?.toLowerCase().includes(patternSearch.toLowerCase())
  );

  // Filter topics based on search
  const filteredTopics = topics?.filter?.(topic =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  // Update the label rendering helper
  const renderLabel = (label: string, required: boolean = false) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-semibold mb-6">Create New Problem</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              {renderLabel('Title', true)}
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              {renderLabel('Difficulty', true)}
              <Select.Root 
                value={formData.difficulty} 
                onValueChange={value => setFormData({ ...formData, difficulty: value as 'easy' | 'medium' | 'hard' })}
              >
                <Select.Trigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm gap-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary">
                  <Select.Value placeholder="Select difficulty" />
                  <Select.Icon>
                    <ChevronDown className="h-4 w-4" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200">
                    <Select.Viewport className="p-1">
                      <Select.Item value="easy" className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100">
                        <Select.ItemText>Easy</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                      </Select.Item>
                      <Select.Item value="medium" className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100">
                        <Select.ItemText>Medium</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                      </Select.Item>
                      <Select.Item value="hard" className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100">
                        <Select.ItemText>Hard</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="space-y-2">
              {renderLabel('Category', true)}
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Pattern Selection */}
            <div className="space-y-2">
              {renderLabel('Patterns', true)}
              <div className="min-h-[38px] rounded-md border border-gray-300 px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.pattern_ids.map(id => {
                    const pattern = patterns.find(p => p.id === id);
                    return pattern ? (
                      <span
                        key={pattern.id}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs"
                      >
                        {pattern.name}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            pattern_ids: formData.pattern_ids.filter(pid => pid !== id)
                          })}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                <Select.Root
                  onValueChange={(value) => {
                    if (!formData.pattern_ids.includes(value)) {
                      setFormData({
                        ...formData,
                        pattern_ids: [...formData.pattern_ids, value]
                      });
                    }
                  }}
                >
                  <Select.Trigger className="inline-flex items-center justify-between text-sm text-gray-500 hover:text-gray-700">
                    <Select.Value placeholder="Select patterns" />
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200">
                      <div className="flex items-center border-b border-gray-200 p-2">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <input
                          className="outline-none text-sm"
                          placeholder="Search patterns..."
                          value={patternSearch}
                          onChange={(e) => setPatternSearch(e.target.value)}
                        />
                      </div>
                      <Select.Viewport className="p-1">
                        {filteredPatterns?.map(pattern => (
                          <Select.Item
                            key={pattern.id}
                            value={pattern.id}
                            disabled={formData.pattern_ids.includes(pattern.id)}
                            className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                          >
                            <Select.ItemText>{pattern.name}</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                              <Check className="h-4 w-4" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                        {filteredPatterns?.length === 0 && (
                          <div className="py-2 px-8 text-sm text-gray-500">
                            No patterns found
                          </div>
                        )}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
              {renderLabel('Topics', true)}
              <div className="min-h-[38px] rounded-md border border-gray-300 px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.topic_ids.map(id => {
                    const topic = topics.find(t => t.id === id);
                    return topic ? (
                      <span
                        key={topic.id}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs"
                      >
                        {topic.name}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            topic_ids: formData.topic_ids.filter(tid => tid !== id)
                          })}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                <Select.Root
                  onValueChange={(value) => {
                    if (!formData.topic_ids.includes(value)) {
                      setFormData({
                        ...formData,
                        topic_ids: [...formData.topic_ids, value]
                      });
                    }
                  }}
                >
                  <Select.Trigger className="inline-flex items-center justify-between text-sm text-gray-500 hover:text-gray-700">
                    <Select.Value placeholder="Select topics" />
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200">
                      <div className="flex items-center border-b border-gray-200 p-2">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <input
                          className="outline-none text-sm"
                          placeholder="Search topics..."
                          value={topicSearch}
                          onChange={(e) => setTopicSearch(e.target.value)}
                        />
                      </div>
                      <Select.Viewport className="p-1">
                        {filteredTopics?.map(topic => (
                          <Select.Item
                            key={topic.id}
                            value={topic.id}
                            disabled={formData.topic_ids.includes(topic.id)}
                            className="relative flex items-center px-8 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                          >
                            <Select.ItemText>{topic.name}</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                              <Check className="h-4 w-4" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                        {filteredTopics?.length === 0 && (
                          <div className="py-2 px-8 text-sm text-gray-500">
                            No topics found
                          </div>
                        )}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {renderLabel('Description', true)}
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-4">
            {renderLabel('Examples', true)}
            {formData.examples.map((example, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Input</label>
                  <input
                    type="text"
                    value={example.input}
                    onChange={e => handleExampleChange(index, 'input', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Output</label>
                  <input
                    type="text"
                    value={example.output}
                    onChange={e => handleExampleChange(index, 'output', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Explanation</label>
                  <input
                    type="text"
                    value={example.explanation}
                    onChange={e => handleExampleChange(index, 'explanation', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExample}
              className="text-sm text-primary hover:text-primary/90"
            >
              Add Example
            </button>
          </div>

          <div className="space-y-4">
            {renderLabel('Constraints', true)}
            {formData.constraints.map((constraint, index) => (
              <input
                key={index}
                type="text"
                value={constraint}
                onChange={e => handleConstraintChange(index, e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            ))}
            <button
              type="button"
              onClick={addConstraint}
              className="text-sm text-primary hover:text-primary/90"
            >
              Add Constraint
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              {renderLabel('Time Complexity', true)}
              <input
                id="timeComplexity"
                type="text"
                value={formData.time_complexity}
                onChange={e => setFormData({ ...formData, time_complexity: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              {renderLabel('Space Complexity', true)}
              <input
                id="spaceComplexity"
                type="text"
                value={formData.space_complexity}
                onChange={e => setFormData({ ...formData, space_complexity: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            {renderLabel('Context/Explanation', true)}
            <textarea
              id="context"
              value={formData.context}
              onChange={e => setFormData({ ...formData, context: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 