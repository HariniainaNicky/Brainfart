import { Room, User } from "@/types/db";
import { useRouter } from "next/navigation";
import { Button } from "../shadcn-component/button";
import { PlayerList } from "./player-list";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { insertRoomPlayer } from "@/utils/func";
import { authClient } from "@/lib/auth-client";
import { CircleX, RefreshCw, LogIn, LogOut, Play, User as UserIcon } from "lucide-react";
import { quitRoom } from "@/utils/func";
import { GameSection } from "./game-section";
import { Session } from "@/types/better-auth";

type PlayerScreenForRoomProps = {
  room: Room | undefined;
  session: Session
};

export const PlayerScreenForRoom = ({ room, session }: PlayerScreenForRoomProps) => {
  const [userInRoom, setGameStarted] = useState<boolean>(false);
  const router = useRouter();
  const [isUserInRoom, setIsUserInRoom] = useState<boolean>(false);

  const verifyUserInRoom = async () => {
    const inRoom = room?.players.some(
      (player: User) => player.id === session?.user.id
    );
    setIsUserInRoom(inRoom || false);
  };

  useEffect(() => {
    verifyUserInRoom();
  }, [room, session?.user.id]);

  const handleReplay = async () => {
    setGameStarted(true);
  }

  const handleJoinRoom = async () => {
    try {
      if (isUserInRoom) {
        toast.error("You are already in this room.", { id: "errorId" });
        return;
      }
      await insertRoomPlayer(room?.id || "", session?.user.id || "");
      toast.success("You joined the room successfully.", { id: "successId" });
      setGameStarted(true);
      verifyUserInRoom();
    } catch (error) {
      console.log(error);
      toast.error("Error while joining the room, try again later...", { id: "errorId" });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await quitRoom(room?.id || "", session?.user.id || "");
      toast.success("You left the room successfully.", { id: "successId" });
      verifyUserInRoom();
      router.push("/room");
    } catch (error) {
      console.log(error);
      toast.error("Error while leaving the room, try again later...", { id: "errorId" });
    }
  };

  const infoItems = [
    { label: "Title", value: room?.title },
    { label: "Questions", value: room?.questions.length },
    {
      label: "Status",
      value: room?.winner ? "Finished" : "Open",
      icon: room?.winner ? <CircleX size={16} className="text-red-500" /> : <RefreshCw size={16} className="text-green-500 animate-spin" />,
    },
    { label: "Winner", value: room?.winner?.email || "No winner yet" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm" hidden={userInRoom}>
        <h2 className="text-lg sm:text-xl font-bold mb-4">About this session</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {infoItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {item.icon}
                {item.value}
              </span>
            </div>
          ))}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Owner</span>
            <span
              className="text-sm font-medium underline underline-offset-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => router.push("/user/" + room?.openedBy.id)}
            >
              {room?.openedBy.username || room?.openedBy.email}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <span className="text-sm font-semibold flex items-center gap-1.5">
            <UserIcon size={14} />
            Players
          </span>
          <PlayerList players={room?.players} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 gap-2" onClick={handleJoinRoom} disabled={isUserInRoom}>
            <LogIn size={16} />
            {isUserInRoom ? "Joined" : "Join"}
          </Button>
          <Button className="flex-1 gap-2" disabled={!isUserInRoom} onClick={handleReplay}>
            <Play size={16} />
            Replay
          </Button>
          <Button className="flex-1 gap-2" variant="secondary" onClick={handleLeaveRoom} disabled={!isUserInRoom}>
            <LogOut size={16} />
            Leave
          </Button>
        </div>
      </div>

      <div id="game-section" hidden={!userInRoom}>
        <GameSection room={room} session={session}/>
      </div>
    </div>
  );
};
