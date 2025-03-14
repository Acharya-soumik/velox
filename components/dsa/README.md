# DSA (Data Structures & Algorithms) Components

This directory contains components related to the DSA (Data Structures & Algorithms) module of the application.

## Directory Structure

- `/editor`: Components related to the code editor functionality
  - `code-editor.tsx`: Python code editor with execution capabilities

- `/problems`: Components related to problem display and interaction
  - `problem-chat.tsx`: Chat interface for discussing problems with AI assistant

## Usage

### Code Editor

```tsx
import { CodeEditor } from "@/components/dsa/editor/code-editor";

// In your component
<CodeEditor 
  defaultValue="def solution():\n    pass" 
  onChange={(code) => console.log(code)}
  onRun={(output) => console.log(output)}
/>
```

### Problem Chat

```tsx
import { ProblemChat } from "@/components/dsa/problems/problem-chat";

// In your component
<ProblemChat
  messages={messages}
  isLoading={isLoading}
  onSend={handleSendMessage}
  onRegenerate={handleRegenerate}
  onStop={handleStop}
  onClear={handleClear}
  title="Problem Assistant"
/>
``` 