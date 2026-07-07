"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { InterviewLanding } from "@/components/ui/interview/interview-landing";
import { RoleSelect } from "@/components/ui/interview/role-select";
import { StackSelect } from "@/components/ui/interview/stack-select";
import { InterviewSession } from "@/components/ui/interview/interview-session";
import { HistorySidebar, type SessionItem } from "@/components/ui/interview/history-sidebar";
import { Header } from "@/components/ui/header";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/stores/useUser";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/shadcn-component/button";
import { Skeleton } from "@/components/ui/shadcn-component/skeleton";

type MainView = "welcome" | "role-select" | "stack-select" | "session";

type Mastery = {
  score: number;
  answered: number;
  correct: number;
};

type PendingSession = {
  id: string;
  mastery: Mastery;
  message: string;
};

const Page = () => {
  const [logged, setLogged] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [mainView, setMainView] = useState<MainView>("welcome");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState("English");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingNewSession, setPendingNewSession] = useState<PendingSession | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const { setUserData } = useUser();

  useEffect(() => {
    if (session) {
      setLogged(true);
      setUserData(session.user);
    } else {
      setLogged(false);
    }
  }, [session, setUserData]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch("/api/ai/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setSessionsLoading(false);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    if (mainView === "welcome" && sessions.length > 0 && !activeSessionId) {
      const latest = sessions[0];
      setActiveSessionId(latest.id);
      setSelectedRole(latest.role);
      setSelectedStack(latest.stack);
      setSelectedLang(latest.lang);
      setMainView("session");
    }
  }, [sessions, mainView, activeSessionId]);

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setMainView("stack-select");
  };

  const handleStartSession = useCallback(async (lang: string, stack: string[]) => {
    setSelectedLang(lang);
    setSelectedStack(stack);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "start", role: selectedRole, stack, lang }),
      });

      if (res.ok) {
        const data = await res.json();
        const entry: SessionItem = {
          id: data.id,
          role: selectedRole,
          stack,
          lang,
          score: data.mastery.score,
          answered: data.mastery.answered,
          correct: data.mastery.correct,
          updatedAt: new Date().toISOString(),
          lastMessage: data.message ?? null,
        };
        setSessions((prev) => [entry, ...prev]);
        setActiveSessionId(data.id);
        setPendingNewSession({ id: data.id, mastery: data.mastery, message: data.message });
        setMainView("session");
      }
    } catch {
      // silently fail
    }
  }, [selectedRole]);

  const handleSelectSession = useCallback((s: SessionItem) => {
    setPendingNewSession(null);
    setActiveSessionId(s.id);
    setSelectedRole(s.role);
    setSelectedStack(s.stack);
    setSelectedLang(s.lang);
    setMainView("session");
  }, []);

  const handleSessionUpdate = useCallback((updates: { score: number; answered: number; correct: number }) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, ...updates } : s,
      ),
    );
  }, [activeSessionId]);

  if (isPending) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Header logged={false} session={null} />
        <div className="flex flex-1 p-4 gap-4">
          <Skeleton className="hidden md:block w-[280px]" />
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="flex-1 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const initData = pendingNewSession?.id === activeSessionId ? pendingNewSession : null;

  return (
    <div className="flex flex-col min-h-dvh">
      <Header logged={logged} session={session} />

      <div className="flex flex-1 overflow-hidden">
        <HistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={handleSelectSession}
          onNew={() => {
            setPendingNewSession(null);
            setActiveSessionId(null);
            setMainView("role-select");
          }}
          loading={sessionsLoading}
          error={null}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 relative">
          {mainView !== "session" && (
            <div className="md:hidden absolute top-2 left-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
            </div>
          )}

          {mainView === "welcome" && (
            <InterviewLanding onStart={() => setMainView("role-select")} />
          )}

          {mainView === "role-select" && (
            <div className="flex-1 overflow-y-auto">
              <RoleSelect
                onSelectRole={handleSelectRole}
                onBack={() => setMainView("welcome")}
              />
            </div>
          )}

          {mainView === "stack-select" && (
            <div className="flex-1 overflow-y-auto">
              <StackSelect
                role={selectedRole}
                onStart={handleStartSession}
                onBack={() => setMainView("role-select")}
              />
            </div>
          )}

          {mainView === "session" && activeSessionId && (
            <InterviewSession
              key={activeSessionId}
              role={selectedRole}
              stack={selectedStack}
              lang={selectedLang}
              initialMessages={
                initData ? [{ role: "assistant" as const, content: initData.message }] : undefined
              }
              initialMastery={initData?.mastery}
              onUpdate={handleSessionUpdate}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
