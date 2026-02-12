/**
 * AI Assistant Sidebar
 * Generic AI assistant chat component with access control
 * Works for all user types (HRM8, Consultant, Company)
 */

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Loader2, ArrowUp, Plus, Mic, Info, Settings2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { MarkdownRenderer } from "@/shared/components/common/MarkdownRenderer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  state: 'partial-call' | 'call' | 'result';
  result?: any;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content?: string;
  parts?: Array<{ type?: string; text?: string }>;
  toolInvocations?: ToolInvocation[];
}

function renderText(message: ChatMessage): string {
  if (typeof message.content === "string" && message.content.trim()) {
    return message.content;
  }

  const parts = Array.isArray(message.parts) ? message.parts : [];
  return parts
    .filter((part) => part?.type === "text" && typeof part?.text === "string")
    .map((part) => part.text as string)
    .join("\n");
}

/**
 * Convert snake_case tool name to Title Case
 * Example: get_my_daily_briefing -> Get My Daily Briefing
 */
function formatToolName(toolName: string): string {
  return toolName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Count words in a text string
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Truncate text to specified word count
 */
function truncateToWords(text: string, wordCount: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ");
}

/**
 * Component to display user messages with optional truncation
 */
function UserMessage({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wordCount = countWords(text);
  const shouldTruncate = wordCount > 50;

  if (!shouldTruncate) {
    return <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>;
  }

  const displayText = isExpanded ? text : truncateToWords(text, 50);

  return (
    <div>
      <p className="whitespace-pre-wrap text-sm leading-6">
        {displayText}
        {!isExpanded && "..."}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-xs font-medium text-primary hover:underline"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

/**
 * Thinking loader animation
 */
function ThinkingLoader() {
  return (
    <div className="rounded-xl p-3 w-fit max-w-[70%] mr-auto bg-muted/50 border border-border">
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/**
 * Component to display individual tool invocations
 */
function ToolInvocationDisplay({ invocation }: { invocation: ToolInvocation }) {
  const { toolName, state } = invocation;
  const displayName = formatToolName(toolName);

  // Determine icon and styling based on state
  const getStateDisplay = () => {
    switch (state) {
      case 'partial-call':
        return {
          icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
          label: "Preparing",
          className: "text-muted-foreground"
        };
      case 'call':
        return {
          icon: <Settings2 className="h-3.5 w-3.5 animate-spin text-blue-500" />,
          label: "Calling",
          className: "text-blue-500"
        };
      case 'result':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
          label: "Completed",
          className: "text-green-500"
        };
      default:
        return {
          icon: <XCircle className="h-3.5 w-3.5 text-destructive" />,
          label: "Unknown",
          className: "text-destructive"
        };
    }
  };

  const stateDisplay = getStateDisplay();

  return (
    <div className="mb-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
      <div className="flex items-center gap-1.5">
        {stateDisplay.icon}
        <span className={`text-xs font-medium ${stateDisplay.className}`}>
          {stateDisplay.label}:
        </span>
      </div>
      <span className="text-xs font-medium">{displayName}</span>
    </div>
  );
}

interface AiAssistantSidebarProps {
  /** API endpoint for the chat stream - determines access control */
  streamEndpoint?: string;
}

export function AiAssistantSidebar({
  streamEndpoint = "/api/assistant/chat/stream"
}: AiAssistantSidebarProps) {
  const { messages, input, handleInputChange, handleSubmit, status, stop, error, setInput } = useChat({
    api: `${API_BASE_URL}${streamEndpoint}`,
    fetch: (url: RequestInfo | URL, init?: RequestInit) =>
      fetch(url, { ...init, credentials: "include" }),
  });

  const chatMessages = useMemo(() => messages as unknown as ChatMessage[], [messages]);
  const isStreaming = status === "submitted" || status === "streaming";
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        let shouldRestart = false;

        recognitionInstance.onstart = () => {
          console.log("Speech recognition started");
        };

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            }
          }

          if (finalTranscript) {
            setInput((prev: string) => prev + finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "no-speech" || event.error === "audio-capture") {
            // Don't stop on these errors, just continue
            return;
          }
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          // Only restart if we're still supposed to be recording
          if (shouldRestart) {
            try {
              recognitionInstance.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
              setIsRecording(false);
            }
          }
        };

        // Store the restart flag in the recognition instance
        (recognitionInstance as any).setRestartFlag = (value: boolean) => {
          shouldRestart = value;
        };

        setRecognition(recognitionInstance);
      }
    }

    // Cleanup: stop recording when component unmounts
    return () => {
      if (recognition) {
        try {
          recognition.setRestartFlag?.(false);
          recognition.stop();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
    };
  }, [setInput]);

  // Stop recording when streaming starts
  useEffect(() => {
    if (isStreaming && isRecording && recognition) {
      recognition.setRestartFlag?.(false);
      recognition.stop();
      setIsRecording(false);
    }
  }, [isStreaming, isRecording, recognition]);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      // Stop recording
      recognition.setRestartFlag?.(false);
      recognition.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        recognition.setRestartFlag?.(true);
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
        alert("Failed to start speech recognition. Please try again.");
      }
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isStreaming) return;
    handleSubmit(event);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col bg-background p-3 overflow-hidden">
      <div className="flex h-full min-h-0 flex-col rounded-2xl border bg-card overflow-hidden">
        {/* Messages */}
        <ScrollArea className="min-h-0 flex-1 p-4">
          {chatMessages.length === 0 ? (
            <div className="pt-16">
              <h2 className="text-4xl font-semibold tracking-tight">Hi there,</h2>
              <p className="mt-2 text-xl text-muted-foreground">How can I help?</p>
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Try asking:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Show me my daily briefing</li>
                  <li>• What's my performance this month?</li>
                  <li>• How much commission have I earned?</li>
                  <li>• Show me my upcoming interviews</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {chatMessages.map((message) => {
                const text = renderText(message);
                const isUser = message.role === "user";
                const hasToolInvocations = message.toolInvocations && message.toolInvocations.length > 0;

                // Skip rendering if no text and no tool invocations
                if (!text && !hasToolInvocations) return null;

                return (
                  <div
                    key={message.id}
                    className={`rounded-xl p-3 w-fit max-w-[70%] ${
                      isUser
                        ? "ml-auto bg-primary text-primary-foreground border-primary"
                        : "mr-auto bg-muted/50 border border-border"
                    }`}
                  >
                    {/* Tool Invocations */}
                    {hasToolInvocations && !isUser && (
                      <div className="mb-2">
                        {message.toolInvocations!.map((invocation) => (
                          <ToolInvocationDisplay
                            key={invocation.toolCallId}
                            invocation={invocation}
                          />
                        ))}
                      </div>
                    )}

                    {/* Message Text */}
                    {text && (
                      <>
                        {isUser ? (
                          <UserMessage text={text} />
                        ) : (
                          <MarkdownRenderer content={text} className="text-sm leading-6" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {/* Thinking Loader */}
              {isStreaming && <ThinkingLoader />}
            </div>
          )}
        </ScrollArea>

        {/* Error */}
        {error && (
          <p className="px-4 pb-2 text-xs text-destructive">
            {error.message || "Assistant request failed."}
          </p>
        )}

        {/* Input */}
        <div className="p-3">
          <form onSubmit={onSubmit}>
            <div className="relative rounded-2xl border bg-background/50 backdrop-blur-sm shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md">
              {/* Add Context Button */}
              <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full border text-xs font-medium px-3"
                >
                  <Plus className="h-3 w-3" />
                  Add Context
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 ml-auto"
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Start a conversation..."
                  disabled={isStreaming}
                  rows={3}
                  className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isStreaming && input.trim()) {
                        handleSubmit(e as any);
                      }
                    }
                  }}
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between px-2 pb-2">
                <Button
                  type="button"
                  variant={isRecording ? "default" : "ghost"}
                  size="icon"
                  onClick={toggleRecording}
                  className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
                  disabled={isStreaming}
                >
                  <Mic className={`h-4 w-4 ${isRecording ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </Button>

                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {isRecording ? "Listening..." : isStreaming ? "Generating..." : "Press Enter to send"}
                  </p>
                  {isStreaming ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => stop()}
                      className="h-9 w-9 rounded-full"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim()}
                      className="h-9 w-9 rounded-full shadow-sm"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </aside>
  );
}
