"use client";
import { useState } from "react";
import { RoomHeader } from "@/components/ui/room/room-header";
import { YouNeedAnAccount } from "@/components/ui/chore-component/you-need-an-account";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/shadcn-component/button";
import { Textarea } from "@/components/ui/shadcn-component/textarea";
import { Input } from "@/components/ui/shadcn-component/input";
import { Label } from "@/components/ui/shadcn-component/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn-component/select";
import { Skeleton } from "@/components/ui/shadcn-component/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/shadcn-component/dialog";
import toast from "react-hot-toast";

type GeneratedQ = {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

const Page = () => {
  const { data: session, isPending } = authClient.useSession();
  const [description, setDescription] = useState("");
  const [validating, setValidating] = useState(false);
  const [matchedTopic, setMatchedTopic] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQ[]>([]);
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen">
        <RoomHeader targetedRedirect="/" />
        <div className="flex justify-center p-8"><Skeleton className="h-64 w-full max-w-lg" /></div>
      </div>
    );
  }
  if (!session) return <YouNeedAnAccount />;

  const handleValidate = async () => {
    if (!description.trim() || description.trim().length < 5) {
      toast.error("Describe your topic with at least 5 characters");
      return;
    }
    setValidating(true);
    try {
      const res = await fetch("/api/creation/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Validation failed");
        return;
      }
      if (!json.data.matched) {
        toast.error("No topic matches your interest. Try a clearer description.");
        return;
      }
      setMatchedTopic(json.data.topic);
      setShowConfirm(true);
    } catch {
      toast.error("Failed to validate");
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmTopic = async () => {
    if (!matchedTopic) return;
    setShowConfirm(false);
    setTopic(matchedTopic);
    setGenerating(true);
    setQuestions([]);
    try {
      const res = await fetch("/api/creation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: matchedTopic }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to generate");
        return;
      }
      setQuestions(json.data.questions);
      toast.success("Generated 10 questions. You can edit the question text.");
    } catch {
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!topic || questions.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/creation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, visibility, questions }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to save");
        return;
      }
      toast.success(`Saved ${json.data.count} questions as ${visibility}. Topic: ${topic}`);
      setSaved(true);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <RoomHeader targetedRedirect="/" />
      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Creation Mode</h1>
          <p className="text-sm text-muted-foreground">Describe the topic you want to practice. AI will propose a topic and generate 10 questions.</p>
        </div>

        {!questions.length && !generating && !saved && (
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
            <Label htmlFor="description">Describe the topic you want to practice</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., I want to practice basic French verbs for beginners, focusing on present tense..."
              rows={4}
            />
            <Button onClick={handleValidate} disabled={validating} className="w-full sm:w-auto self-start">
              {validating ? "Checking..." : "Check topic"}
            </Button>
          </div>
        )}

        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Is this the topic you want to study?</DialogTitle>
              <DialogDescription>
                AI guessed: <span className="font-semibold text-foreground">{matchedTopic}</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>No, edit description</Button>
              <Button onClick={handleConfirmTopic}>Yes, generate trivia</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {generating && (
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3">
            <p className="text-sm font-medium">Generating 10 questions for {topic}...</p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        )}

        {questions.length > 0 && !saved && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm font-medium">Topic: {topic}</p>
                <p className="text-xs text-muted-foreground">You can edit the question text. Answers are locked.</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as "private" | "public")}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <Label>Question {idx + 1}</Label>
                <Textarea
                  value={q.question}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[idx] = { ...copy[idx], question: e.target.value };
                    setQuestions(copy);
                  }}
                  rows={2}
                />
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Correct answer (locked)</Label>
                  <Input value={q.correct_answer} disabled className="bg-muted" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {q.incorrect_answers.map((a, ai) => (
                    <div key={ai} className="flex flex-col gap-1">
                      <Label className="text-xs">Wrong {ai + 1} (locked)</Label>
                      <Input value={a} disabled className="bg-muted text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : `Save ${questions.length} questions as ${visibility}`}
            </Button>
          </div>
        )}

        {saved && (
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3 text-center">
            <h3 className="font-semibold">Trivia saved!</h3>
            <p className="text-sm text-muted-foreground">Topic {topic} with {questions.length} questions is now {visibility}. You can share it or create a room.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => { setQuestions([]); setDescription(""); setTopic(""); setMatchedTopic(null); setSaved(false); }}>Create another</Button>
              <Button onClick={() => window.location.href = "/room/create"}>Create room</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
