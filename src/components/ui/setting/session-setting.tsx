"use client";
import { authClient } from "@/lib/auth-client";
import { Session } from "@/types/better-auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../shadcn-component/button";

export function SessionSetting() {
  const [sessions, setSessions] = useState<Session["session"][] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const sessions = await authClient.listSessions();
      setSessions(sessions.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {
      await authClient.revokeSession({
        token: sessionId,
      });
      toast.success("Session ended successfully");
      fetchSessions();
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Failed to end session");
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Sessions</h2>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Sessions</h2>
      {sessions?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No active sessions.</p>
      )}
      <ul className="flex flex-col gap-3">
        {sessions
          ? sessions.map((session: Session["session"]) => (
              <li
                key={session.id}
                className="flex flex-col gap-3 p-4 border rounded-md"
              >
                <div>
                  Connected on{" "}
                  <span className="italic">{session.userAgent}</span> <br />
                  <br /> Created at:{" "}
                  <span className="italic">
                    {session.createdAt.toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => revokeSession(session.token)}
                  className="self-end"
                >
                  End session
                </Button>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
