"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Send,
  RefreshCw,
  StopCircle,
  Trash2,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  Loader2,
  TrainFront,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReusableChatProps {
  apiEndpoint: string;
  chatId: string;
  initialMessages?: any[];
  bodyData?: any;
  className?: string;
  title?: string;
  promptHints?: string[];
  codeContext?: string;
}

const defaultPromptHints = [
  "Explain this concept",
  "How does this work?",
  "Give me an example",
  "What are best practices?",
];

export function ReusableChat({
  apiEndpoint,
  chatId,
  initialMessages = [],
  bodyData = {},
  className = "",
  title = "Chat",
  promptHints = defaultPromptHints,
  codeContext = "",
}: ReusableChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [showPromptHints, setShowPromptHints] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Include code context in the body data if it exists
  const enhancedBodyData = {
    ...bodyData,
    code: codeContext,
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    reload,
    stop,
    setMessages,
  } = useChat({
    api: apiEndpoint,
    id: chatId,
    initialMessages,
    body: enhancedBodyData,
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSubmit(e);
      setInputValue("");
      setShowPromptHints(false);
    }
  };

  const handleStopGeneration = () => {
    stop();
  };

  const handleRegenerateResponse = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      reload();
    }
  };

  const setInput = (value: string) => {
    handleInputChange({
      target: { value },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    setInputValue(value);
  };

  const handlePromptHintClick = (hint: string) => {
    setInput(hint);
    setInputValue(hint);
    setShowPromptHints(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <Card
      className={cn("flex flex-col h-full", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleClearChat}
                  disabled={messages.length === 0 || isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear chat</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <ScrollArea className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Bot className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Ask me anything about this problem or code. I'm here to help!
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-sm">
                {promptHints.slice(0, 4).map((hint, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start h-auto py-2 px-3"
                    onClick={() => handlePromptHintClick(hint)}
                  >
                    <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{hint}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex max-w-[85%] gap-2 rounded-lg p-2.5",
                  message.role === "user"
                    ? "ml-auto bg-[hsl(var(--user-message-bg))] text-primary"
                    : "bg-[hsl(var(--ai-message-bg))]"
                )}
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5">
                  {message.role === "user" ? (
                    <User className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-secondary" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs leading-relaxed break-words">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[80px] resize-none pr-12 text-sm"
              onFocus={() => setShowPromptHints(true)}
            />
            <div className="absolute right-2 bottom-2">
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isLoading}
                className="h-8 w-8"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {messages.length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleRegenerateResponse}
                    disabled={isLoading || messages.length < 2}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                  {isLoading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleStopGeneration}
                    >
                      <StopCircle className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  )}
                </>
              )}
            </div>
            {promptHints.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowPromptHints(!showPromptHints)}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Suggestions
                <ChevronDown
                  className={cn(
                    "h-3 w-3 ml-1 transition-transform",
                    showPromptHints ? "rotate-180" : ""
                  )}
                />
              </Button>
            )}
          </div>

          {showPromptHints && promptHints.length > 0 && (
            <div className="mt-1 p-2 bg-muted rounded-md">
              <div className="grid grid-cols-1 gap-1">
                {promptHints.map((hint, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1.5 px-2 justify-start text-xs"
                    onClick={() => handlePromptHintClick(hint)}
                  >
                    {hint}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
}
