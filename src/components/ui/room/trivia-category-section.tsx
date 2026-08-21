"use client";
import { useEffect, useState } from "react";
import { Button } from "../shadcn-component/button";
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
          <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">Trivia categories:</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelect(category.id)}
            className={cn(
              "justify-start truncate text-xs font-normal",
              selectedTypeId === category.id && "border-primary bg-primary/10 text-primary",
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
