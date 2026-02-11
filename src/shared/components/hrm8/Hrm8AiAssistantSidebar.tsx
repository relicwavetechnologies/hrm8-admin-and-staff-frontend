import { FormEvent, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { MarkdownRenderer } from "@/shared/components/common/MarkdownRenderer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content?: string;
  parts?: Array<{ type?: string; text?: string }>;
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

export function Hrm8AiAssistantSidebar() {
  const { messages, input, handleInputChange, handleSubmit, status, stop, error } = useChat({
    api: `${API_BASE_URL}/api/assistant/chat/hrm8/stream`,
    fetch: (url: RequestInfo | URL, init?: RequestInit) => fetch(url, { ...init, credentials: "include" }),
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
        <ScrollArea className="min-h-0 flex-1 p-4">
          {chatMessages.length === 0 ? (
            <div className="pt-16">
              <h2 className="text-4xl font-semibold tracking-tight">Hi there,</h2>
              <p className="mt-2 text-xl text-muted-foreground">How can I help?</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatMessages.map((message) => {
                const text = renderText(message);
                if (!text) return null;

                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`rounded-xl border bg-background p-3 ${isUser ? "ml-8" : "mr-8"}`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>
                    ) : (
                      <MarkdownRenderer content={text} className="text-sm leading-6" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {error && <p className="px-4 pb-2 text-xs text-destructive">{error.message || "Assistant request failed."}</p>}

        <div className="border-t p-3">
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask anything..."
                disabled={isStreaming}
                className="min-h-[120px] w-full resize-none rounded-xl border bg-background px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-ring"
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
          </form>
        </div>
      </div>
    </aside>
  );
}
