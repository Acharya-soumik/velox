import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";
import { Card } from "./card";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ChatMessageProps
>(({ className, message, isLoading, ...props }, ref) => {
  const isUser = message.role === "user";

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full items-start gap-4 p-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      {...props}
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
          "max-w-[80%] break-words rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <p className="text-sm">{message.content}</p>
        {isLoading && (
          <div className="mt-2 flex items-center gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-.3s]" />
          </div>
        )}
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
});

ChatMessage.displayName = "ChatMessage";

interface ChatListProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ChatListProps
>(({ className, messages, isLoading, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-4 p-4", className)}
      {...props}
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && (
        <ChatMessage
          message={{
            id: "loading",
            content: "",
            role: "assistant",
            timestamp: new Date(),
          }}
          isLoading={true}
        />
      )}
    </div>
  );
});

ChatList.displayName = "ChatList";

interface ChatInputProps {
  onSubmit: (value: string) => Promise<void> | void;
  isDisabled?: boolean;
}

const ChatInput = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ChatInputProps
>(({ className, onSubmit, isDisabled, ...props }, ref) => {
  const [value, setValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isDisabled) {
      onSubmit(value);
      setValue("");
    }
  };

  return (
    <div
      ref={ref}
      className={cn("border-t bg-background p-4", className)}
      {...props}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isDisabled}
        />
        <button
          type="submit"
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={isDisabled}
        >
          Send
        </button>
      </form>
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export { ChatMessage, ChatList, ChatInput }; 
