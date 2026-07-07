"use client";
import { MessageSquare, Plus, Trophy, X } from "lucide-react";
import { Button } from "../shadcn-component/button";
import { getRoleLabel } from "@/lib/ai-utils";

export type SessionItem = {
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
  sessions: SessionItem[];
  activeSessionId: string | null;
  onSelect: (session: SessionItem) => void;
  onNew: () => void;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar = ({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  loading,
  error,
  isOpen,
  onClose,
}: Props) => {
  const sidebar = (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-3 border-b shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm font-medium"
          onClick={() => {
            onNew();
            onClose();
          }}
        >
          <Plus className="size-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="size-5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-xs text-destructive text-center py-4 px-2">
            Failed to load sessions
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-8 px-2">
            No sessions yet.
            <br />
            Start a new chat!
          </div>
        )}

        {!loading &&
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelect(s);
                onClose();
              }}
              className={`w-full text-left rounded-lg p-2.5 transition-colors duration-150 ${
                s.id === activeSessionId
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Trophy className="size-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getRoleLabel(s.role)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Score: {s.score} &middot; {s.answered} answered &middot;{" "}
                    {s.lang}
                  </p>
                </div>
              </div>
              {s.lastMessage && (
                <p className="text-xs text-muted-foreground/60 mt-1.5 line-clamp-1 pl-10">
                  {s.lastMessage.replace(/[#*`>\[\]]/g, "").trim()}
                </p>
              )}
            </button>
          ))}
      </div>

      <div className="p-2 border-t shrink-0">
        <p className="text-[10px] text-muted-foreground/40 text-center">
          Brainfart AI
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex w-[280px] shrink-0 overflow-hidden">
        {sidebar}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-xl">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-10 size-7 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
};
