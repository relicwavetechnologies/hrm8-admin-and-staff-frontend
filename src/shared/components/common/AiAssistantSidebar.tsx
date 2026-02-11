/**
 * AI Assistant Sidebar
 * Generic AI assistant chat component with access control
 * Works for all user types (HRM8, Consultant, Company)
 */

import { FormEvent, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Loader2, Send, Sparkles, Settings2, CheckCircle2, XCircle, Clock } from "lucide-react";
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
  const { messages, input, handleInputChange, handleSubmit, status, stop, error } = useChat({
    api: `${API_BASE_URL}${streamEndpoint}`,
    fetch: (url: RequestInfo | URL, init?: RequestInit) =>
      fetch(url, { ...init, credentials: "include" }),
  });

  const chatMessages = useMemo(() => messages as unknown as ChatMessage[], [messages]);
  const isStreaming = status === "submitted" || status === "streaming";

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isStreaming) return;
    handleSubmit(event);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col bg-background p-3">
      <div className="flex h-full min-h-0 flex-col rounded-2xl border bg-card">
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
          <span className="ml-auto text-xs text-muted-foreground">Cmd+K</span>
        </div>

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
                    className={`rounded-xl border bg-background p-3 ${isUser ? "ml-8" : "mr-8"}`}
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
                          <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>
                        ) : (
                          <MarkdownRenderer content={text} className="text-sm leading-6" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
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
        <div className="border-t p-3">
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask anything..."
                disabled={isStreaming}
                className="min-h-[120px] w-full resize-none rounded-xl border bg-background px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isStreaming && input.trim()) {
                      handleSubmit(e as any);
                    }
                  }
                }}
              />
              {isStreaming ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => stop()}
                  className="absolute bottom-2 right-2 h-8 w-8"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="absolute bottom-2 right-2 h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </aside>
  );
}
