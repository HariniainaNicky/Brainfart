'use client'
import { Button } from "../shadcn-component/button";
import { GameList } from "./game-list";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export const Room = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto px-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Explore games
        </h2>
        <Button
          onClick={() => router.push('/room/create')}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          Create room
        </Button>
      </div>
      <GameList />
    </div>
  );
};
