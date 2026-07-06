"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../shadcn-component/button";
import { Textarea } from "../shadcn-component/textarea";
import { getRoleLabel } from "@/lib/ai-utils";
import { Send, Square, ChevronLeft, Trophy } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type Evaluation = {
  isCorrect: boolean;
  score: number;
  feedback: string;
  mastery?: Mastery;
};

type Mastery = {
  score: number;
  answered: number;
  correct: number;
};

interface Props {
  role: string;
  stack: string[];
  lang: string;
  onBack: () => void;
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <span
        className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
      <span className="text-xs text-muted-foreground ml-1.5">Thinking</span>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-muted/80 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <pre className="bg-muted/80 p-3 rounded-lg overflow-x-auto text-sm my-2 border">
              <code className={className}>{children}</code>
            </pre>
          );
        },
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 my-1 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 my-1 space-y-0.5">{children}</ol>
        ),
        p: ({ children }) => <p className="my-1 last:mb-0">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export const InterviewSession = ({ role, stack, lang, onBack }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mastery, setMastery] = useState<Mastery>({
    score: 0,
    answered: 0,
    correct: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const startInterview = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "start", role, stack, lang }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message ?? "Failed to start interview");
        }

        const data = await res.json();
        setMastery(data.mastery);

        if (data.messages) {
          setMessages(data.messages);
        } else if (data.message) {
          setMessages([{ role: "assistant", content: data.message }]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start");
      } finally {
        setIsProcessing(false);
      }
    };

    startInterview();
  }, [role, stack, lang]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const handleSubmit = useCallback(async () => {
    const answer = input.trim();
    if (!answer || isProcessing) return;

    setIsProcessing(true);
    setIsStreaming(false);
    setError(null);
    setLastEvaluation(null);

    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setInput("");

    const questionMessage = messages
      .filter((m) => m.role === "assistant")
      .at(-1);

    try {
      if (questionMessage) {
        const evalRes = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "evaluate",
            role,
            stack,
            lang,
            question: questionMessage.content,
            answer,
          }),
        });

        if (evalRes.ok) {
          const evaluation: Evaluation = await evalRes.json();
          setLastEvaluation(evaluation);
          if (evaluation.mastery) setMastery(evaluation.mastery);
        }
      }

      const updatedMessages = [
        ...messages,
        { role: "user" as const, content: answer },
      ];

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const abortController = new AbortController();
      abortRef.current = abortController;
      setIsStreaming(true);

      const chatRes = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          role,
          stack,
          lang,
          messages: updatedMessages,
        }),
        signal: abortController.signal,
      });

      if (!chatRes.ok) {
        const text = await chatRes.text();
        throw new Error(text || "Failed to get response");
      }

      const reader = chatRes.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: fullContent,
          };
          return next;
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsStreaming(false);
      setIsProcessing(false);
      abortRef.current = null;
    }
  }, [input, isProcessing, messages, role, mastery, stack, lang]);

  const isFinished = messages.some(
    (m) =>
      m.role === "assistant" &&
      (m.content.toLowerCase().includes("final summary") ||
        m.content.toLowerCase().includes("strengths and weaknesses")),
  );

  return (
    <div className="flex flex-col w-full min-h-dvh max-w-3xl mx-auto">
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg truncate">{getRoleLabel(role)}</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>Score: {mastery.score}</span>
            <span>Answered: {mastery.answered}</span>
            <span>
              Accuracy:{" "}
              {mastery.answered > 0
                ? `${Math.round((mastery.correct / mastery.answered) * 100)}%`
                : "N/A"}
            </span>
            <Trophy className="size-3 shrink-0" />
            <span>
              {mastery.score >= 1000
                ? "Expert"
                : mastery.score >= 600
                  ? "Senior"
                  : mastery.score >= 300
                    ? "Mid"
                    : mastery.score >= 100
                      ? "Junior"
                      : "Beginner"}
            </span>
            <span className="text-xs uppercase text-muted-foreground/60">
              {lang}
            </span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed max-h-[60vh] overflow-y-auto ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md prose prose-sm dark:prose-invert max-w-none"
              }`}
            >
              {msg.role === "user" ? (
                msg.content
              ) : msg.content ? (
                <MarkdownContent content={msg.content} />
              ) : (
                <ThinkingDots />
              )}
            </div>
          </div>
        ))}

        {lastEvaluation && (
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-card border rounded-xl p-3 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${lastEvaluation.isCorrect ? "text-green-500" : "text-red-500"}`}
                >
                  {lastEvaluation.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </span>
                <span className="text-muted-foreground">
                  Score: {lastEvaluation.score}/10
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                {lastEvaluation.feedback}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">
              {error}
            </p>
          </div>
        )}
      </div>

      <div className="border-t p-4 shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isFinished
                ? "Interview complete. Start a new one to practice more."
                : isProcessing
                  ? "Waiting for AI..."
                  : "Type your answer..."
            }
            disabled={isProcessing || isFinished}
            className="min-h-[2.5rem] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {isStreaming ? (
            <Button
              size="icon"
              variant="destructive"
              onClick={handleStop}
              className="self-end"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              disabled={isProcessing || isFinished || !input.trim()}
              onClick={handleSubmit}
              className="self-end"
            >
              <Send className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
