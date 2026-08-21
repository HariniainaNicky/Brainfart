"use client";
import { useEffect, useState } from "react";
import { topicIcon } from "@/lib/topics";
import { cn } from "@/lib/utils";

type TriviaCategory = {
  id: string;
  name: string;
  apiCategoryId: number;
};

type TriviaCategorySectionProps = {
  selectedTypeId: string | null;
  onSelect: (typeId: string) => void;
};

export const TriviaCategorySection = ({ selectedTypeId, onSelect }: TriviaCategorySectionProps) => {
  const [categories, setCategories] = useState<TriviaCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/trivia/categories");
        const data = await res.json();
        setCategories(Array.isArray(data.data) ? data.data : []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">Trivia categories</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((category) => {
          const Icon = topicIcon(category.id);
          const selected = selectedTypeId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-left cursor-pointer transition-colors duration-200",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/40 hover:bg-accent",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md",
                  selected ? "bg-primary-foreground/15" : "bg-muted",
                )}
              >
                <Icon className={cn("size-3.5", selected ? "text-primary-foreground" : "text-muted-foreground")} />
              </span>
              <span className="text-xs font-medium leading-tight line-clamp-2">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
