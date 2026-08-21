import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn-component/select";
import { Type } from "@/types/db";

type FilterSelectorProps = {
  setTypeId: (value: string) => void;
  typeId: string;
};

export const FilterSelector = ({ setTypeId, typeId }: FilterSelectorProps) => {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch("/api/types");
        const data = await res.json();
        setTypes(
          Array.isArray(data.data)
            ? data.data.filter((type: Type) => type.apiCategoryId == null)
            : [],
        );
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-[250px] rounded-md border border-border bg-muted animate-pulse" />
    );
  }

  return (
    <Select value={typeId} onValueChange={setTypeId}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="null">All</SelectItem>
        {types.map((type) => (
          <SelectItem key={type.id} value={type.id}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
