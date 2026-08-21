"use client";
import { useEffect, useState } from "react";
import { topicIcon } from "@/lib/topics";
import { cn } from "@/lib/utils";
import { useTriviaCategories } from "@/stores/useTriviaCategories";
import { Button } from "../shadcn-component/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  const cachedCategories = useTriviaCategories((s) => s.categories);
  const setCachedCategories = useTriviaCategories((s) => s.setCategories);
  const [categories, setCategories] = useState<TriviaCategory[]>(() => cachedCategories ?? []);
  const [loading, setLoading] = useState(() => cachedCategories == null);

  useEffect(() => {
    if (cachedCategories) return;
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/trivia/categories");
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : [];
        setCategories(list);
        if (list.length) setCachedCategories(list);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [cachedCategories, setCachedCategories]);

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

  const pageSize = 6;
  const allItems: (TriviaCategory & { isAll?: boolean })[] = [
    { id: "null", name: "All", apiCategoryId: 0, isAll: true },
    ...categories,
  ];
  const [page, setPage] = useState(1);
  const maxPage = Math.max(1, Math.ceil(allItems.length / pageSize));
  const safePage = Math.min(page, maxPage);
  const paginated = allItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    if (selectedTypeId == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (safePage !== 1) setPage(1);
      return;
    }
    const idx = allItems.findIndex((c) => c.id === selectedTypeId);
    if (idx >= 0) {
      const targetPage = Math.floor(idx / pageSize) + 1;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (targetPage !== safePage) setPage(targetPage);
    }
  }, [selectedTypeId]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm text-muted-foreground">Trivia categories</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {paginated.map((category) => {
          if ((category as { isAll?: boolean }).isAll) {
            return (
              <button
                key="all"
                type="button"
                onClick={() => onSelect("null")}
                className={cn(
                  "flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-left cursor-pointer transition-colors duration-200",
                  selectedTypeId == null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/40 hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    selectedTypeId == null ? "bg-primary-foreground/15" : "bg-muted",
                  )}
                >
                  <span className={cn("text-xs font-bold", selectedTypeId == null ? "text-primary-foreground" : "text-muted-foreground")}>All</span>
                </span>
                <span className="text-xs font-medium leading-tight">All</span>
              </button>
            );
          }
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
      {maxPage > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {safePage}/{maxPage}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
              <ArrowLeft className="size-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={safePage === maxPage}>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
