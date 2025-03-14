import React from "react";
import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { RefreshCw, StopCircle, Send, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProblemChatProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => Promise<void>;
  onRegenerate?: () => void;
  onStop?: () => void;
  onClear?: () => void;
  className?: string;
  title?: string;
}

const PROMPT_HINTS = [
  { icon: "✨", text: "Explain this problem" },
  { icon: "💡", text: "Give me a hint" },
  { icon: "🔍", text: "Help me understand the constraints" },
  { icon: "📝", text: "Show me a similar problem" },
];

export const ProblemChat = ({
  messages,
  isLoading,
  onSend,
  onRegenerate,
  onStop,
  onClear,
  className,
  title = "AI Assistant",
}: ProblemChatProps) => {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const message = input;
      setInput("");
      await onSend(message);
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (!isLoading) {
      onSend(prompt);
    }
  };

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-xs font-medium">{title}...</h2>
        <div className="flex items-center gap-2">
          {messages.length > 0 && !isLoading && (
            <>
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRegenerate}
                  className="h-8 w-8"
                  aria-label="Regenerate response"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {onClear && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
          {isLoading && onStop && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onStop}
              className="h-8 w-8 text-red-500 hover:text-red-600"
              aria-label="Stop generating"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Start a conversation about the problem
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isUser && (
                    <Avatar
                      className="h-8 w-8"
                      src="/bot-avatar.png"
                      alt="AI Assistant"
                      fallback="AI"
                    />
                  )}
                  <Card
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </p>
                  </Card>
                  {isUser && (
                    <Avatar
                      className="h-8 w-8"
                      src="/user-avatar.png"
                      alt="User"
                      fallback="U"
                    />
                  )}
                </div>
              );
            })
          )}
          {isLoading && (
            <div className="flex justify-start gap-3">
              <Avatar
                className="h-8 w-8"
                src="/bot-avatar.png"
                alt="AI Assistant"
                fallback="AI"
              />
              <Card className="max-w-[80%] rounded-lg bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-.3s]" />
                  </div>
                  {onStop && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onStop}
                      className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
                    >
                      Stop
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="border-t bg-white">
        {/* Prompt Hints */}
        <div className="p-2 border-b bg-muted/30">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {PROMPT_HINTS.map((hint, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(hint.text)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-background rounded-full border hover:bg-muted/50 transition-colors whitespace-nowrap"
              >
                <span>{hint.icon}</span>
                <span>{hint.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the problem..."
              className="flex-1 rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}; 