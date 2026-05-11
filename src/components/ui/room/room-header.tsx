"use client";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "../button/dark-mode-toggle";
import { Button } from "../shadcn-component/button";
import { useRouter } from "next/navigation";
import { Separator } from "../shadcn-component/separator";


type RoomHeaderProps = {
  targetedRedirect: string;
};

export const RoomHeader = (props: RoomHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.push(props.targetedRedirect)}>
          <ArrowLeft size={20} />
        </Button>
        <ModeToggle />
      </div>
      <Separator />
    </div>
  );
};
