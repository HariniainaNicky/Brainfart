"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../shadcn-component/button";
import { Sparkles, Trophy, ChevronRight } from "lucide-react";
import { getRoleLabel } from "@/lib/ai-utils";

type Session = {
  id: string;
  role: string;
  score: number;
  answered: number;
  correct: number;
  stack: string[];
  lang: string;
  updatedAt: string;
  lastMessage: string | null;
};

interface Props {
  onStart: () => void;
  onResume: (role: string, stack: string[], lang: string) => void;
}

export const InterviewLanding = ({ onStart, onResume }: Props) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/ai/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="w-full flex flex-col gap-12 justify-center items-center px-4 relative overflow-hidden flex-1">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 justify-center items-center mt-24 md:mt-32 relative z-10"
      >
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl select-none"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          Brainfart AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-base md:text-lg max-w-lg text-muted-foreground"
        >
          Practice technical interviews with AI-powered HR personas. Get
          real-time feedback and level up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Button
            variant="default"
            size="lg"
            className="text-base gap-2"
            onClick={onStart}
          >
            <Sparkles className="size-5" />
            Start Interview
          </Button>
        </motion.div>
      </motion.div>

      {!loading && sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full max-w-lg relative z-10"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Continue where you left off
          </h3>
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onResume(s.role, s.stack, s.lang)}
                className="flex items-center gap-3 w-full text-left bg-card border rounded-xl p-3 hover:bg-accent transition-colors"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Trophy className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getRoleLabel(s.role)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Score: {s.score} &middot; Answered: {s.answered} &middot;{" "}
                    {s.lang}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
