import { FormEvent, useMemo, useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Loader2, Send, X, Plus, Paperclip, MessageSquarePlus } from "lucide-react";
import { MarkdownRenderer } from "@/shared/components/common/MarkdownRenderer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

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
  const chatId = "ai-chat-hrm8-stream";

  const { messages, input, handleInputChange, handleSubmit, status, stop, error, setInput, setMessages } = useChat({
    api: `${API_BASE_URL}/api/assistant/chat/hrm8/stream`,
    fetch: (url: RequestInfo | URL, init?: RequestInit) => fetch(url, { ...init, credentials: "include" }),
    initialMessages: (() => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(chatId);
          if (stored) return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to load chat from localStorage", e);
        }
      }
      return [];
    })(),
  });

  const chatMessages = useMemo(() => messages as unknown as ChatMessage[], [messages]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "submitted" || status === "streaming";

  const lastUserMessageId = useMemo(() => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].role === 'user') return chatMessages[i].id;
    }
    return null;
  }, [chatMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatId, JSON.stringify(messages));
    } else {
      localStorage.removeItem(chatId);
    }
  }, [messages, chatId]);

  useEffect(() => {
    if (lastUserMessageId && lastUserMessageRef.current) {
      // Small delay to ensure render is complete
      setTimeout(() => {
        lastUserMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [lastUserMessageId]);

  const handleNewChat = () => {
    stop();
    setMessages([]);
    setInput('');
    setUploadedFiles(prev => {
      prev.forEach(f => URL.revokeObjectURL(f.url));
      return [];
    });
    localStorage.removeItem(chatId);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isStreaming) return;
    handleSubmit(event);
    // Clear uploaded files after sending message
    setUploadedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        formRef.current?.requestSubmit();
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          url,
          size: file.size
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          url,
          size: file.size
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <aside className="flex h-full min-h-0 flex-col bg-background p-4">
      <div className="flex h-full min-h-0 flex-col rounded-2xl border bg-card">
        <ScrollArea className="min-h-0 flex-1 p-4">
          {chatMessages.length === 0 ? (
            <div className="pt-20">
              <h2 className="text-4xl font-semibold tracking-tight">Hi there,</h2>
              <p className="mt-2 text-xl text-muted-foreground">How can I help?</p>
            </div>
          ) : (
            <div className="space-y-3 pb-[80vh]">
              {chatMessages.map((message) => {
                const text = renderText(message);
                if (!text) return null;

                const isUser = message.role === "user";
                const isLastUserMessage = isUser && message.id === lastUserMessageId;

                return (
                  <div
                    key={message.id}
                    ref={isLastUserMessage ? lastUserMessageRef : null}
                    className={`rounded-xl border bg-background p-4 scroll-mt-4 ${isUser ? "ml-auto max-w-[85%]" : "mr-auto max-w-[95%]"}`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-base leading-7">{text}</p>
                    ) : (
                      <MarkdownRenderer content={text} className="text-base leading-7" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {error && <p className="px-4 pb-2 text-xs text-destructive">{error.message || "Assistant request failed."}</p>}

        <div className="border-t border-border/30 bg-background p-4">
          <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
            <div
              className={`relative rounded-xl border bg-background shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md ${isDragOver ? 'border-dashed border-primary/50 bg-primary/5' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Uploaded Files Preview - Horizontal Gallery */}
              {uploadedFiles.length > 0 && (
                <div className="px-4 pt-3 border-b border-border/20 bg-muted/10">
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="group relative flex-shrink-0">
                        <div className="relative h-16 w-16 rounded-lg border border-border bg-muted overflow-hidden">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="h-5 w-5 rounded-full bg-destructive/80 hover:bg-destructive flex items-center justify-center transition-colors"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-background border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-xs pointer-events-none z-10">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                    ))}
                    {/* Add File Button */}
                    <div className="flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-16 w-16 border-dashed border-border hover:border-primary/50 flex flex-col gap-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-xs">Add</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message AI assistant..."
                disabled={isStreaming}
                className="w-full resize-none bg-background px-20 py-3 text-sm font-light outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
              />

              {/* Haripin/Attach button */}
              <div className="absolute left-3 top-3 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleNewChat}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="New Chat"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              {isStreaming ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => stop()}
                  className="absolute bottom-3 right-3 h-9 w-9"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="absolute bottom-3 right-3 h-9 w-9"
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
