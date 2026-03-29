/**
 * AI Assistant Sidebar
 * Generic AI assistant chat component with access control
 * Works for all user types (HRM8, Consultant, Company)
 */

import { FormEvent, useMemo, useState, useEffect, useRef, lazy, Suspense } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Loader2, ArrowUp, Mic, X, Plus, Paperclip, MessageSquarePlus, Tag, Briefcase, User, Building2, FileText, Users, BotMessageSquare, RefreshCw, Lock } from "lucide-react";
import TextShimmer from "@/shared/components/common/TextShimmer";
import { MarkdownRenderer } from "@/shared/components/common/MarkdownRenderer";
import { useAiReferences } from "@/shared/hooks/useAiReferences";
import { useCanUseAiFeatures } from "@/shared/hooks/useCanUseAiFeatures";
import { EntityReference } from "@/shared/types/ai-references";
import { ConfirmationCard } from "@/shared/components/common/ConfirmationCard";
import { UpgradePlanDialog } from "@/shared/components/UpgradePlanDialog";

// Use empty string to leverage Vite's proxy configuration for /api requests
const API_BASE_URL = "";

const AssistantToolVizChartLazy = lazy(() => import("@/shared/components/common/AssistantToolVizChart"));

function extractAssistantVizFromToolResult(result: unknown): unknown {
  if (result === null || typeof result !== "object") return null;

  const pickViz = (obj: Record<string, unknown>): unknown => {
    if ("_viz" in obj && obj._viz !== null && obj._viz !== undefined) return obj._viz;
    const data = obj.data;
    if (data && typeof data === "object" && data !== null && "_viz" in (data as object)) {
      return (data as Record<string, unknown>)._viz;
    }
    const output = obj.output;
    if (output && typeof output === "object" && output !== null) {
      const o = output as Record<string, unknown>;
      if ("_viz" in o) return o._viz;
      const inner = o.result ?? o.value;
      if (inner && typeof inner === "object" && inner !== null && "_viz" in (inner as object)) {
        return (inner as Record<string, unknown>)._viz;
      }
    }
    return null;
  };

  const r = result as Record<string, unknown>;
  const direct = pickViz(r);
  if (direct) return direct;

  const toolPayload = r.data;
  if (toolPayload && typeof toolPayload === "object" && !Array.isArray(toolPayload)) {
    const fromData = pickViz(toolPayload as Record<string, unknown>);
    if (fromData) return fromData;
    const nestedViz = (toolPayload as Record<string, unknown>)._viz;
    if (nestedViz !== undefined && nestedViz !== null) return nestedViz;
  }

  for (const key of ["result", "value", "payload"] as const) {
    const inner = r[key];
    if (inner && typeof inner === "object" && inner !== null) {
      const v = pickViz(inner as Record<string, unknown>);
      if (v) return v;
    }
  }

  return null;
}

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: 'partial-call' | 'call' | 'result';
  result?: unknown;
}

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
  parts?: Array<Record<string, unknown>>;
  toolInvocations?: ToolInvocation[];
}

function getMessageToolInvocations(message: ChatMessage): ToolInvocation[] {
  const direct = message.toolInvocations;
  if (Array.isArray(direct) && direct.length > 0) return direct;

  const parts = message.parts;
  if (!Array.isArray(parts)) return [];

  const out: ToolInvocation[] = [];
  for (const raw of parts) {
    if (!raw || typeof raw !== "object") continue;
    const part = raw as Record<string, unknown>;
    const inv = part.toolInvocation;
    if (part.type === "tool-invocation" && inv && typeof inv === "object") {
      out.push(inv as ToolInvocation);
      continue;
    }
    const type = part.type;
    if (typeof type === "string" && type.startsWith("tool-") && typeof part.toolCallId === "string") {
      const state = part.state;
      if (state === "partial-call" || state === "call" || state === "result") {
        out.push({
          toolCallId: part.toolCallId,
          toolName: type.slice("tool-".length),
          args: (part.args as Record<string, unknown>) ?? {},
          state,
          result: part.result,
        });
      }
    }
  }
  return out;
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

function toolResultPayload(result: unknown): unknown {
  if (result === null || typeof result !== "object" || Array.isArray(result)) return result;
  const r = result as Record<string, unknown>;
  const data = r.data;
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  return result;
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
      <p className="whitespace-pre-wrap text-base leading-7">
        {displayText}
        {!isExpanded && "..."}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-sm font-medium text-primary hover:underline"
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
    <div className="w-full max-w-[95%] mr-auto py-2 px-1">
      <TextShimmer className="text-sm font-medium" duration={1.8} spread={4}>
        Thinking…
      </TextShimmer>
    </div>
  );
}


/**
 * Tool invocation row — shimmers while running, settles when done.
 */
function ToolInvocationDisplay({ invocation }: { invocation: ToolInvocation }) {
  const { toolName, state } = invocation;
  const displayName = formatToolName(toolName);
  const isDone = state === 'result';
  const viz = isDone ? extractAssistantVizFromToolResult(invocation.result) : null;

  return (
    <div className="mb-1.5 py-0.5">
      <div className="flex items-center gap-1.5">
        {/* Tiny status dot */}
        <span
          className={[
            "h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-700",
            isDone
              ? "bg-muted-foreground/30"
              : "bg-muted-foreground/50 animate-pulse",
          ].join(" ")}
        />

        {/* Tool name — shimmering while running, static when done */}
        {isDone ? (
          <span className="text-[11px] font-medium text-muted-foreground/50">
            {displayName}
          </span>
        ) : (
          <TextShimmer
            className="text-[11px] font-medium"
            duration={1.6}
            spread={3}
          >
            {displayName}
          </TextShimmer>
        )}
      </div>
      {viz ? (
        <Suspense
          fallback={
            <div className="mt-2 h-[120px] w-full animate-pulse rounded-md bg-muted/30 text-center text-[11px] leading-[120px] text-muted-foreground">
              Loading chart…
            </div>
          }
        >
          <AssistantToolVizChartLazy recipe={viz} />
        </Suspense>
      ) : null}
    </div>
  );
}

interface AiAssistantSidebarProps {
  /** API endpoint for the chat stream - determines access control */
  streamEndpoint?: string;
  /** Additional request body fields (e.g. context for scoped assistants) */
  requestBody?: Record<string, unknown>;
  /** Empty state title */
  welcomeTitle?: string;
  /** Empty state subtitle */
  welcomeSubtitle?: string;
  /** Suggested prompts shown in empty state */
  suggestedPrompts?: string[];
  /** Optional override for company AI entitlement in consultant contexts */
  canUseAiOverride?: boolean;
  /** Optional override for lock message when using consultant company context */
  lockDescriptionOverride?: string;
}

/**
 * Icon for a given entity type
 */
function EntityTypeIcon({ type }: { type: EntityReference['entityType'] }) {
  const icons: Record<string, React.ReactNode> = {
    job: <Briefcase className="h-3 w-3" />,
    candidate: <User className="h-3 w-3" />,
    company: <Building2 className="h-3 w-3" />,
    application: <FileText className="h-3 w-3" />,
    consultant: <Users className="h-3 w-3" />,
    custom: <Tag className="h-3 w-3" />,
  };
  return <>{icons[type] ?? icons.custom}</>;
}

/**
 * A single removable reference chip in the context row
 */
function ReferenceChip({
  reference,
  onRemove,
}: {
  reference: EntityReference;
  onRemove: () => void;
}) {
  const styles: Record<string, { pill: string; dot: string }> = {
    job: {
      pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
      dot: "bg-blue-400",
    },
    candidate: {
      pill: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60",
      dot: "bg-violet-400",
    },
    company: {
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
      dot: "bg-emerald-400",
    },
    application: {
      pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
      dot: "bg-amber-400",
    },
    consultant: {
      pill: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
      dot: "bg-sky-400",
    },
    custom: {
      pill: "bg-muted/60 text-muted-foreground border-border/50",
      dot: "bg-muted-foreground/50",
    },
  };
  const s = styles[reference.entityType] ?? styles.custom;

  return (
    <span
      className={`group inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-all hover:shadow-sm ${s.pill}`}
      title={`${reference.entityType}: ${reference.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
      <EntityTypeIcon type={reference.entityType} />
      <span className="max-w-[120px] truncate leading-none">{reference.label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 -mr-0.5 rounded p-0.5 opacity-50 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
        aria-label={`Remove ${reference.label}`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

/**
 * Read-only chip shown inside a sent user message bubble.
 * Same styles as ReferenceChip but without the remove button.
 */
function MsgReferenceChip({ reference }: { reference: EntityReference }) {
  const styles: Record<string, { pill: string; dot: string }> = {
    job: { pill: "bg-blue-500/10 text-blue-600 border-blue-300/40 dark:text-blue-300 dark:border-blue-700/40", dot: "bg-blue-400" },
    candidate: { pill: "bg-violet-500/10 text-violet-600 border-violet-300/40 dark:text-violet-300 dark:border-violet-700/40", dot: "bg-violet-400" },
    company: { pill: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40 dark:text-emerald-300 dark:border-emerald-700/40", dot: "bg-emerald-400" },
    application: { pill: "bg-amber-500/10 text-amber-600 border-amber-300/40 dark:text-amber-300 dark:border-amber-700/40", dot: "bg-amber-400" },
    consultant: { pill: "bg-sky-500/10 text-sky-600 border-sky-300/40 dark:text-sky-300 dark:border-sky-700/40", dot: "bg-sky-400" },
    custom: { pill: "bg-white/10 text-foreground/70 border-border/30", dot: "bg-muted-foreground/40" },
  };
  const s = styles[reference.entityType] ?? styles.custom;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium opacity-80 ${s.pill}`}
      title={`${reference.entityType}: ${reference.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
      <EntityTypeIcon type={reference.entityType} />
      <span className="max-w-[110px] truncate leading-none">{reference.label}</span>
    </span>
  );
}

export function AiAssistantSidebar({
  streamEndpoint = "/api/assistant/chat/stream",
  requestBody,
  welcomeTitle = "Hi there,",
  welcomeSubtitle = "How can I help?",
  suggestedPrompts = [
    "Show me this candidate's full profile summary",
    "Move this candidate to Technical Interview",
    "Add a note about fitment for this role",
    "Schedule a video interview for tomorrow at 11 AM",
  ],
  canUseAiOverride,
  lockDescriptionOverride,
}: AiAssistantSidebarProps) {
  const chatId = `ai-chat-${streamEndpoint.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const isCompanyCopilot = !streamEndpoint.includes('consultant') && !streamEndpoint.includes('hrm8');
  const { canUseAi } = useCanUseAiFeatures(isCompanyCopilot && canUseAiOverride === undefined);
  const effectiveCanUseAi = canUseAiOverride ?? canUseAi;
  const inputLocked = isCompanyCopilot && !effectiveCanUseAi;
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // AI reference context store — shared with any producer component
  const { references, removeReference, clearReferences, addReference } = useAiReferences();

  const { messages, input, handleInputChange, handleSubmit, status, stop, error, setInput, setMessages, append } = useChat({
    api: `${API_BASE_URL}${streamEndpoint}`,
    // Base body — references are injected per-send via handleSubmit second arg
    body: requestBody,
    fetch: (url: RequestInfo | URL, init?: RequestInit) =>
      fetch(url, { ...init, credentials: "include" }),
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

  // Persist to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatId, JSON.stringify(messages));
    } else {
      localStorage.removeItem(chatId);
    }
  }, [messages, chatId]);

  const chatMessages = useMemo(() => messages as unknown as ChatMessage[], [messages]);
  const isStreaming = status === "submitted" || status === "streaming";
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<{ start(): void; stop(): void; setRestartFlag?(v: boolean): void } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Per-message attachments: chips + images stored after each send
  const [messageAttachments, setMessageAttachments] = useState<
    Map<string, { refs: EntityReference[]; images: UploadedFile[] }>
  >(new Map());
  // Snapshot captured at submit time, matched to message id once AI SDK assigns it
  const pendingAttachmentsRef = useRef<{ refs: EntityReference[]; images: UploadedFile[] } | null>(null);

  // Drag state — separate flags for file drag vs entity reference drag
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragEntityOver, setIsDragEntityOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);

  const lastUserMessageId = useMemo(() => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].role === 'user') return chatMessages[i].id;
    }
    return null;
  }, [chatMessages]);

  useEffect(() => {
    if (lastUserMessageId && lastUserMessageRef.current) {
      // Small delay to ensure render is complete
      setTimeout(() => {
        lastUserMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [lastUserMessageId]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      type SpeechRecognitionCtor = new () => { start(): void; stop(): void; continuous: boolean; interimResults: boolean; lang: string; setRestartFlag?: (v: boolean) => void; onstart: (() => void) | null; onresult: ((e: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
      const win = window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
      const SpeechRecognition = win.SpeechRecognition ?? win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        let shouldRestart = false;

        recognitionInstance.onstart = () => {
          console.log("Speech recognition started");
        };

        recognitionInstance.onresult = (event) => {
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

        recognitionInstance.onerror = (event) => {
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
        recognitionInstance.setRestartFlag = (value: boolean) => {
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
  }, [setInput, recognition]);

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

  const handleNewChat = () => {
    stop();
    setMessages([]);
    setInput('');
    setUploadedFiles(prev => {
      prev.forEach(f => URL.revokeObjectURL(f.url));
      return [];
    });
    clearReferences();
    setMessageAttachments(new Map());
    pendingAttachmentsRef.current = null;
    localStorage.removeItem(chatId);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputLocked) {
      setShowUpgradeDialog(true);
      return;
    }
    if (!input.trim() || isStreaming) return;

    // Snapshot attachments BEFORE touching the store
    const snapshotRefs = [...references];
    const snapshotImages = [...uploadedFiles];

    if (snapshotRefs.length > 0 || snapshotImages.length > 0) {
      pendingAttachmentsRef.current = {
        refs: snapshotRefs,
        images: snapshotImages,
      };
    }

    // Build the exact body this message should carry — include refs explicitly
    // so the backend gets them regardless of Zustand/React timing
    const submitBody: Record<string, unknown> = { ...(requestBody ?? {}) };
    if (snapshotRefs.length > 0) {
      submitBody.context = {
        ...((requestBody?.context as Record<string, unknown>) ?? {}),
        references: snapshotRefs,
      };
    }

    // Clear composer — visual attachments now live in pendingAttachmentsRef
    clearReferences();
    setUploadedFiles([]);

    // Pass the explicit body snapshot so the network request always has refs
    handleSubmit(event, { body: submitBody });
  };

  // When a new user message appears, bind the pending attachments to its ID
  useEffect(() => {
    if (!pendingAttachmentsRef.current) return;
    const latestUser = [...messages].reverse().find(m => m.role === 'user');
    if (latestUser) {
      const snapshot = pendingAttachmentsRef.current;
      pendingAttachmentsRef.current = null;
      setMessageAttachments(prev => {
        const next = new Map(prev);
        next.set(latestUser.id, snapshot);
        return next;
      });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        formRef.current?.requestSubmit();
      }
    }
  };

  const handleResend = (messageId: string, text: string) => {
    if (isStreaming) return;

    // Find the index of the message to resend
    const messageIndex = chatMessages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Retrieve original attachments (if any) before slicing history
    const originalAttachments = messageAttachments.get(messageId);

    // Slice the message history to remove this message and everything after it
    // @ts-ignore - setMessages accepts an array of UIMessage or history objects
    setMessages(chatMessages.slice(0, messageIndex));

    // Clear composer & capture original context to be sent with the new message
    clearReferences();
    setUploadedFiles([]);

    const submitBody: Record<string, unknown> = { ...(requestBody ?? {}) };

    // We only need entity references for the backend context; images are handled internally by AI SDK
    if (originalAttachments?.refs && originalAttachments.refs.length > 0) {
      submitBody.context = {
        ...((requestBody?.context as Record<string, unknown>) ?? {}),
        references: originalAttachments.refs,
      };

      // Also restore references visibly so the user knows they were resent
      originalAttachments.refs.forEach(ref => addReference(ref));
    }

    if (originalAttachments?.images && originalAttachments.images.length > 0) {
      setUploadedFiles([...originalAttachments.images]);
    }

    // Capture attachments as pending, so the new user message id gets mapped to them
    if ((originalAttachments?.refs && originalAttachments.refs.length > 0) ||
      (originalAttachments?.images && originalAttachments.images.length > 0)) {
      pendingAttachmentsRef.current = {
        refs: originalAttachments.refs ? [...originalAttachments.refs] : [],
        images: originalAttachments.images ? [...originalAttachments.images] : [],
      };
    }

    // Resend using append with the reconstructed body
    (append as any)({
      role: 'user',
      content: text,
    }, {
      data: {
        body: submitBody
      }
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    setIsDragEntityOver(false);

    // ── Entity reference drop (dragged from Jobs table etc.) ──────────────
    const refPayload = event.dataTransfer.getData('application/x-ai-reference');
    if (refPayload) {
      try {
        const ref = JSON.parse(refPayload);
        if (ref.entityType && ref.entityId && ref.label) {
          addReference(ref);
          return; // Don't process as a file
        }
      } catch {
        // fall through to file handling
      }
    }

    // ── File / image drop ─────────────────────────────────────────────────
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
    // Distinguish entity drags from file drags for different visual feedback
    const isEntity = event.dataTransfer.types.includes('application/x-ai-reference');
    if (isEntity) {
      setIsDragEntityOver(true);
      setIsDragOver(false);
    } else {
      setIsDragOver(true);
      setIsDragEntityOver(false);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    setIsDragEntityOver(false);
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
    <aside className="flex h-full min-h-0 flex-col bg-background overflow-hidden border-l border-border/30">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="min-h-0 flex-1 px-4 py-4">
          {chatMessages.length === 0 ? (
            <div className="pt-20">
              <h2 className="text-4xl font-semibold tracking-tight">{welcomeTitle}</h2>
              <p className="mt-2 text-xl text-muted-foreground">{welcomeSubtitle}</p>
              <div className="mt-8 space-y-3">
                <p className="text-sm font-medium">Try asking:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {suggestedPrompts.map((prompt) => (
                    <li key={prompt}>• {prompt}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className={`space-y-3 transition-all ${isStreaming ? 'pb-[80vh]' : 'pb-6'}`}>
              {chatMessages.map((message) => {
                const text = renderText(message);
                const isUser = message.role === "user";
                const toolInvocations = getMessageToolInvocations(message);
                const hasToolInvocations = toolInvocations.length > 0;

                // Skip rendering if no text and no tool invocations
                if (!text && !hasToolInvocations) return null;

                const isLastUserMessage = isUser && message.id === lastUserMessageId;

                const attachments = isUser ? messageAttachments.get(message.id) : undefined;

                return (
                  <div
                    key={message.id}
                    ref={isLastUserMessage ? lastUserMessageRef : null}
                    className={`w-full scroll-mt-4 ${isUser
                      ? "ml-auto max-w-[85%]"
                      : "mr-auto max-w-[95%] text-foreground py-2"
                      }`}
                  >
                    {/* Tool Invocations */}
                    {hasToolInvocations && !isUser && (
                      <div className="mb-2">
                        {toolInvocations.map((invocation) => {
                          const payload = toolResultPayload(invocation.result) as Record<string, unknown> | undefined;
                          const requiredConfirm =
                            invocation.state === "result" && payload?.confirmationRequired === true;

                          return (
                            <div key={invocation.toolCallId}>
                              <ToolInvocationDisplay invocation={invocation} />
                              {requiredConfirm && (
                                <ConfirmationCard
                                  toolName={invocation.toolName}
                                  message={(typeof payload?.message === "string" ? payload.message : null) || "Please confirm this action."}
                                  onConfirm={() => {
                                    // Call the tool again with __confirmed: true
                                    const confirmBody = {
                                      ...requestBody,
                                      message: `I confirm the ${invocation.toolName} action.`,
                                      // Include context references if any
                                      context: {
                                        ...((requestBody?.context as any) || {}),
                                        references: references
                                      }
                                    };
                                    // @ts-ignore - The ai sdk provides this but it's hard to type
                                    append({
                                      role: 'user',
                                      content: `I confirm the ${invocation.toolName} action. Proceed with execution.`,
                                    }, {
                                      data: {
                                        body: {
                                          ...confirmBody,
                                          confirmedToolCallId: invocation.toolCallId
                                        }
                                      }
                                    });
                                  }}
                                  onReject={() => {
                                    // @ts-ignore
                                    append({
                                      role: 'user',
                                      content: `I cancel the ${invocation.toolName} action. Do not proceed.`,
                                    });
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* User bubble — attachments + text together */}
                    {isUser ? (
                      <div className="group relative bg-muted/50 text-foreground rounded-2xl px-4 py-3 space-y-2">
                        {/* Resend button (hidden until hover) */}
                        {!isStreaming && (
                          <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Resend this message (removes subsequent messages)"
                              onClick={() => handleResend(message.id, text)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {/* Attached images */}
                        {attachments?.images && attachments.images.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {attachments.images.map((img) => (
                              <div
                                key={img.id}
                                className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/40 shrink-0"
                                title={img.name}
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Attached entity reference chips — read-only */}
                        {attachments?.refs && attachments.refs.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {attachments.refs.map((ref) => (
                              <MsgReferenceChip key={`${ref.entityType}:${ref.entityId}`} reference={ref} />
                            ))}
                          </div>
                        )}
                        {/* Message text */}
                        {text && <UserMessage text={text} />}
                      </div>
                    ) : (
                      /* AI bubble */
                      text && <MarkdownRenderer content={text} className='text-base leading-7 [font-family:Inter,"SF_Pro_Text",system-ui,sans-serif] [font-feature-settings:"kern"_1,"liga"_1,"calt"_1] antialiased' />
                    )}
                  </div>
                );
              })}

              {/* Thinking loader — only during silent wait, hides once first token arrives */}
              {isStreaming && (() => {
                const lastMsg = chatMessages[chatMessages.length - 1];
                const lastHasText = lastMsg && lastMsg.role === 'assistant' && renderText(lastMsg);
                return !lastHasText ? <ThinkingLoader /> : null;
              })()}
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
        <div className="p-4 pt-1 pb-3 bg-background">
          {inputLocked && (
            <div
              className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/80 px-3 py-2.5 dark:border-amber-800/40 dark:bg-amber-950/30"
              role="alert"
            >
              <Lock className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  AI Copilot locked
                </p>
                <p className="text-xs text-amber-700/90 dark:text-amber-300/90 mt-0.5">
                  {lockDescriptionOverride || "AI features require a paid plan (Small or higher). Upgrade to unlock AI-powered assistance."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs border-amber-300 dark:border-amber-700"
                  onClick={() => setShowUpgradeDialog(true)}
                >
                  Upgrade to unlock
                </Button>
              </div>
            </div>
          )}
          <form ref={formRef} onSubmit={onSubmit}>
            <div
              className={[
                "relative rounded-2xl bg-muted/30 border border-border/20 transition-all",
                "focus-within:border-border/60 focus-within:bg-muted/50 focus-within:shadow-sm",
                isDragEntityOver ? "border-dashed border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 shadow-[inset_0_0_0_2px_rgba(96,165,250,0.25)]" : "",
                isDragOver && !isDragEntityOver ? "border-dashed border-primary/50 bg-primary/5" : "",
              ].filter(Boolean).join(" ")}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Drop hint overlay — shown when dragging an entity reference over the composer */}
              {isDragEntityOver && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 backdrop-blur-[1px] pointer-events-none">
                  <BotMessageSquare className="h-6 w-6 text-blue-500 mb-1.5 animate-bounce" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Drop to add to context</span>
                </div>
              )}

              {/* Reference chips — float directly inside composer, no decoration */}
              {references.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2.5">
                  {references.map((ref) => (
                    <ReferenceChip
                      key={`${ref.entityType}:${ref.entityId}`}
                      reference={ref}
                      onRemove={() => removeReference(ref.entityType, ref.entityId)}
                    />
                  ))}
                  {references.length > 1 && (
                    <button
                      type="button"
                      onClick={clearReferences}
                      className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      title="Clear all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Uploaded Files Preview - Horizontal Gallery */}
              {uploadedFiles.length > 0 && (
                <div className="px-4 pt-3">
                  <div className="flex gap-2 mb-1 overflow-x-auto pb-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="group relative flex-shrink-0">
                        <div className="relative h-12 w-12 rounded-lg border border-border bg-muted overflow-hidden">
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
                        className="h-12 w-12 border-dashed border-border/50 hover:border-primary/50 flex flex-col gap-0.5 p-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
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

              {/* Textarea */}
              <div className="relative">
                {inputLocked && (
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                )}
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={inputLocked ? () => setShowUpgradeDialog(true) : undefined}
                  placeholder={inputLocked ? "Upgrade to unlock AI Copilot" : "Message AI assistant..."}
                  disabled={isStreaming || inputLocked}
                  readOnly={inputLocked}
                  className={`w-full resize-none bg-transparent pt-4 pb-2 text-sm font-light outline-none placeholder:text-muted-foreground/60 disabled:opacity-50 ${inputLocked ? "pl-10 pr-4" : "px-4"}`}
                  rows={2}
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={isRecording ? "default" : "ghost"}
                    size="icon"
                    onClick={toggleRecording}
                    className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
                    disabled={isStreaming || inputLocked}
                    title="Voice input"
                  >
                    <Mic className={`h-4 w-4 ${isRecording ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleNewChat}
                    className="h-8 w-8"
                    disabled={isStreaming}
                    title="New Chat"
                  >
                    <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8"
                    disabled={isStreaming || inputLocked}
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

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
                      className="h-8 w-8 rounded-full border-border/50 bg-background/50 hover:bg-background"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || inputLocked}
                      className="h-8 w-8 rounded-full shadow-none transition-all disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div >
      <UpgradePlanDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title="Upgrade to unlock AI Copilot"
        description="AI Copilot requires a paid plan (Small or higher). Upgrade to unlock AI-powered assistance."
      />
    </aside >
  );
}
