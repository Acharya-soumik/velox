"use client";

import React from "react";
import Editor, { EditorProps } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, RotateCcw, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeEditorProps extends Partial<EditorProps> {
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  onRun?: (output: string) => void;
  onReset?: () => void;
  onGetHint?: () => void;
  onSubmit?: () => void;
  className?: string;
}

export const CodeEditor = ({
  defaultValue = "def solution():\n    # Write your solution here\n    pass",
  onChange,
  onRun,
  onReset,
  onGetHint,
  onSubmit,
  className,
  ...props
}: CodeEditorProps) => {
  const [code, setCode] = React.useState(defaultValue);
  const [isRunning, setIsRunning] = React.useState(false);
  const [output, setOutput] = React.useState<string>("");
  const [pyodideReady, setPyodideReady] = React.useState(false);
  const pyodideRef = React.useRef<any>(null);

  // Initialize Pyodide
  React.useEffect(() => {
    async function loadPyodideModule() {
      try {
        // Load Pyodide script
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.async = true;
        script.onload = async () => {
          try {
            // @ts-ignore
            const pyodide = await loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
            });
            pyodideRef.current = pyodide;
            setPyodideReady(true);
          } catch (err) {
            console.error("Error initializing Pyodide:", err);
            setOutput("Error: Failed to initialize Python environment");
          }
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error("Error loading Pyodide script:", err);
        setOutput("Error: Failed to load Python environment");
      }
    }

    loadPyodideModule();
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    onChange?.(value);

    // Make the current code available for the chat component
    if (typeof window !== "undefined") {
      window.currentEditorCode = value || "";
    }
  };

  const handleReset = () => {
    setCode(defaultValue);
    setOutput("");
    onChange?.(defaultValue);
    onReset?.();
  };

  const handleRun = async () => {
    if (!pyodideRef.current || isRunning) return;

    setIsRunning(true);
    setOutput("");

    try {
      const pyodide = pyodideRef.current;

      // Redirect stdout to capture print statements
      let stdout = "";
      let stderr = "";

      pyodide.setStderr({
        batched: (msg: string) => {
          stderr += msg + "\n";
          setOutput((prev) => prev + "Error: " + msg + "\n");
        },
      });

      pyodide.setStdout({
        batched: (msg: string) => {
          stdout += msg + "\n";
          setOutput((prev) => prev + msg + "\n");
        },
      });

      // Run the code
      const result = await pyodide.runPythonAsync(code);

      // If there's a return value, show it
      if (result !== undefined && result !== null) {
        setOutput((prev) => prev + "Return value: " + result.toString() + "\n");
      }

      // If no output and no errors, show success message
      if (!stdout && !stderr && (result === undefined || result === null)) {
        setOutput("Code executed successfully with no output.");
      }

      onRun?.(stdout || "Code executed successfully!");
    } catch (error: any) {
      setOutput("Error: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const formatOutput = (output: string) => {
    if (!output) return "";
    return output
      .split("\n")
      .map((line, i) =>
        line.startsWith("Error:")
          ? `\x1b[31m${line}\x1b[0m` // Red color for errors
          : line
      )
      .join("\n");
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Python Code Editor</h3>
          <TooltipProvider>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset Code</p>
                </TooltipContent>
              </Tooltip>

              {onGetHint && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onGetHint}>
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get Hint</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={handleRun}
                    disabled={isRunning || !pyodideReady}
                    className={isRunning ? "animate-pulse" : ""}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isRunning
                      ? "Running..."
                      : !pyodideReady
                        ? "Loading Python..."
                        : "Run Code"}
                  </p>
                </TooltipContent>
              </Tooltip>

              {onSubmit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="default" onClick={onSubmit}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Submit Solution</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        <Editor
          height="60vh"
          defaultLanguage="python"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            wrappingIndent: "indent",
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            quickSuggestions: true,
          }}
          {...props}
        />
      </div>

      {/* Output Console */}
      <div className="p-4 bg-background border-t">
        {" "}
        {/* Using theme background */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Output</h4>
          {output && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOutput("")}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="bg-muted rounded-md p-3 font-mono text-sm">
          <div className="max-h-[200px] overflow-y-auto">
            {output ? (
              <div className="space-y-1">
                {output.split("\n").map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-2 py-0.5 rounded",
                      line.startsWith("Error:") &&
                        "text-destructive bg-destructive/10",
                      line.startsWith("Return value:") &&
                        "text-blue-500 bg-blue-500/10",
                      !line.startsWith("Error:") &&
                        !line.startsWith("Return value:") &&
                        "text-foreground"
                    )}
                  >
                    {line || "\u00A0"}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground italic">
                {!pyodideReady
                  ? "Loading Python environment..."
                  : "Run your code to see the output here..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
