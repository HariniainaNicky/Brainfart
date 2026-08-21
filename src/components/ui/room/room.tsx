'use client'
import { Button } from "../shadcn-component/button";
import { GameList } from "./game-list";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export const Room = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Explore games
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Join a room or create your own</p>
        </div>
        <Button
          onClick={() => router.push('/room/create')}
          className="gap-2 w-full sm:w-auto shrink-0"
          size="lg"
        >
          <Plus size={18} />
          Create room
        </Button>
      </div>
      <GameList />
    </div>
  );
};
