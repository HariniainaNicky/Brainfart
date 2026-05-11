'use client'
import { Button } from "../shadcn-component/button";
import { GameList } from "./game-list";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export const Room = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto pb-8">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-center">
        Explore various games...
      </h2>
      <GameList />
      <Button
        onClick={() => router.push('/room/create')}
        className="gap-2 px-6"
      >
        <Plus size={18} />
        Create a room
      </Button>
    </div>
  );
};
