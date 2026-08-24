"use client";
import { useEffect, useState } from "react";
import { Flame, Check } from "lucide-react";
import { Button } from "../shadcn-component/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../shadcn-component/dialog";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type DailyData = {
  question: {
    id: string;
    question: string;
    Answer: string;
    options: string[];
    typeId: string | null;
  };
  streak: number;
  longestStreak: number;
  completedToday: boolean;
};

export const DailyStreak = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [streak, setStreak] = useState<number | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDaily = async () => {
    try {
      const today = new Date().toLocaleDateString("en-CA");
      const res = await fetch(`/api/daily?today=${today}`);
      const json = await res.json();
      if (json.data) {
        setDailyData(json.data);
        setStreak(json.data.streak);
        setCompletedToday(json.data.completedToday);
        if (!json.data.completedToday && !localStorage.getItem(`daily-autoshown-${today}`)) {
          localStorage.setItem(`daily-autoshown-${today}`, "1");
          setSelected(null);
          setOpen(true);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (session) fetchDaily();
    else {
      setStreak(0);
      setCompletedToday(false);
    }
  }, [session]);

  const handleClick = async () => {
    if (!session) {
      router.push("/auth/sign-in");
      return;
    }
    if (!dailyData) await fetchDaily();
    setOpen(true);
    setSelected(null);
  };

  const handleSubmit = async () => {
    if (!selected || !dailyData) return;
    setSubmitting(true);
    try {
      const today = new Date().toLocaleDateString("en-CA");
      const res = await fetch("/api/daily/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selected, today }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed");
        return;
      }
      if (json.data.correct) {
        toast.success(`Correct! Streak: ${json.data.streak}`);
        setStreak(json.data.streak);
        setCompletedToday(true);
      } else {
        toast.error("Wrong answer. Try again tomorrow!");
        setCompletedToday(true);
      }
      setOpen(false);
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="gap-1.5 h-9 px-3 cursor-pointer"
        title={completedToday ? "Daily completed" : "Play daily trivia"}
      >
        <Flame className={`size-4 ${completedToday ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`} />
        <span className="text-sm font-semibold tabular-nums">{streak ?? "-"}</span>
        {completedToday && <Check className="size-3 text-green-600" />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="size-5 text-orange-500" /> Daily trivia
            </DialogTitle>
            <DialogDescription>
              {completedToday ? "You have completed todays daily. Come back tomorrow!" : "Answer todays question to keep your streak!"}
            </DialogDescription>
          </DialogHeader>

          {dailyData?.question ? (
            <div className="flex flex-col gap-4">
              <p className="font-medium">{dailyData.question.question}</p>
              <div className="flex flex-col gap-2">
                {dailyData.question.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={completedToday || submitting}
                    onClick={() => setSelected(opt)}
                    className={`text-left rounded-lg border p-3 text-sm transition-colors cursor-pointer ${
                      selected === opt ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40 bg-card"
                    } ${completedToday ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {!completedToday && (
                <Button onClick={handleSubmit} disabled={!selected || submitting} className="w-full">
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              )}
              {completedToday && <p className="text-sm text-center text-muted-foreground">Streak: {streak} • Best: {dailyData.longestStreak}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading daily question…</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
