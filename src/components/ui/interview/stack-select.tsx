"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../shadcn-component/button";
import { Input } from "../shadcn-component/input";
import { Badge } from "../shadcn-component/badge";
import { ChevronLeft, Loader2, Plus, Sparkles, X, Languages } from "lucide-react";

interface Props {
  role: string;
  onStart: (lang: string, stack: string[]) => void;
  onBack: () => void;
}

export const StackSelect = ({ role, onStart, onBack }: Props) => {
  const [lang, setLang] = useState("English");
  const [suggested, setSuggested] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStack = async () => {
      try {
        const res = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "suggest-stack", role }),
        });
        if (res.ok) {
          const data = await res.json();
          setSuggested(data.stack ?? []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchStack();
  }, [role]);

  const toggle = useCallback((item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((s) => s !== item)
        : [...prev, item],
    );
  }, []);

  const addCustom = useCallback(() => {
    const tag = customTag.trim();
    if (tag && !selected.includes(tag) && !suggested.includes(tag)) {
      setSelected((prev) => [...prev, tag]);
      setSuggested((prev) => [...prev, tag]);
    }
    setCustomTag("");
  }, [customTag, selected, suggested]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 py-8 px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Your tech stack</h2>
          <p className="text-sm text-muted-foreground">
            What technologies do you use as a{" "}
            <span className="font-medium text-foreground">{role}</span>?
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Generating suggestions for {role}...
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {suggested.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Badge
                  variant={
                    selected.includes(item) ? "default" : "outline"
                  }
                  className="cursor-pointer text-sm px-3 py-1.5 transition-all"
                  onClick={() => toggle(item)}
                >
                  {item}
                  {selected.includes(item) && (
                    <X className="size-3 ml-1" />
                  )}
                </Badge>
              </motion.div>
            ))}
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-2">
              Add something not listed:
            </p>
            <div className="flex gap-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="e.g. Rust, GraphQL, Kubernetes..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustom();
                }}
              />
              <Button
                variant="outline"
                size="icon"
                disabled={!customTag.trim()}
                onClick={addCustom}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t pt-6"
            >
              <p className="text-sm text-muted-foreground mb-2">
                Selected ({selected.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="text-sm cursor-pointer"
                    onClick={() => toggle(item)}
                  >
                    {item}
                    <X className="size-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Interview language:
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={lang === "English" ? "default" : "outline"}
                size="sm"
                onClick={() => setLang("English")}
              >
                English
              </Button>
              <Button
                variant={lang === "French" ? "default" : "outline"}
                size="sm"
                onClick={() => setLang("French")}
              >
                Français
              </Button>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="default"
              size="lg"
              className="gap-2"
              onClick={() => onStart(lang, selected)}
            >
              <Sparkles className="size-5" />
              {selected.length === 0
                ? "Skip — Start Interview"
                : "Start Interview"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
