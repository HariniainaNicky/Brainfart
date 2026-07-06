"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../shadcn-component/button";
import { Textarea } from "../shadcn-component/textarea";
import { getRoleLabel } from "@/lib/ai-utils";
import { Send, Loader2, ChevronLeft, Trophy } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type Evaluation = {
  isCorrect: boolean;
  score: number;
  feedback: string;
};

type Mastery = {
  score: number;
  answered: number;
  correct: number;
};

interface Props {
  role: string;
  onBack: () => void;
}

export const InterviewSession = ({ role, onBack }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mastery, setMastery] = useState<Mastery>({
    score: 0,
    answered: 0,
    correct: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const startInterview = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "start", role }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message ?? "Failed to start interview");
        }

        const data = await res.json();
        setMastery(data.mastery);
        setMessages([{ role: "assistant", content: data.message }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start");
      } finally {
        setIsProcessing(false);
      }
    };

    startInterview();
  }, [role]);

  const handleSubmit = useCallback(async () => {
    const answer = input.trim();
    if (!answer || isProcessing) return;

    setIsProcessing(true);
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
            question: questionMessage.content,
            answer,
          }),
        });

        if (evalRes.ok) {
          const evaluation: Evaluation = await evalRes.json();
          setLastEvaluation(evaluation);
        }
      }

      const updatedMessages = [...messages, { role: "user" as const, content: answer }];
      const chatRes = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", role, messages: updatedMessages }),
      });

      if (!chatRes.ok) {
        const data = await chatRes.json();
        throw new Error(data.message ?? "Failed to get response");
      }

      const data = await chatRes.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setMastery(data.mastery ?? mastery);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, messages, role, mastery]);

  const isFinished = messages.some(
    (m) =>
      m.role === "assistant" &&
      (m.content.toLowerCase().includes("final summary") ||
        m.content.toLowerCase().includes("strengths and weaknesses")),
  );

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-[calc(100dvh-10rem)]">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{getRoleLabel(role)}</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Score: {mastery.score}</span>
            <span>Answered: {mastery.answered}</span>
            <span>
              Accuracy:{" "}
              {mastery.answered > 0
                ? `${Math.round((mastery.correct / mastery.answered) * 100)}%`
                : "N/A"}
            </span>
            <Trophy className="size-3" />
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
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}
            >
              {msg.content}
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
                  {lastEvaluation.isCorrect ? "Correct" : "Incorrect"}
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

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
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

      <div className="border-t p-4">
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
          <Button
            size="icon"
            disabled={isProcessing || isFinished || !input.trim()}
            onClick={handleSubmit}
            className="self-end"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
