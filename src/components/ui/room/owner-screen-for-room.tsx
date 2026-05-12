import { Question, Room } from "@/types/db";
import { CircleX, RefreshCw, Copy, Trash2, User, HelpCircle, MessageSquare, Trophy, Play, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../shadcn-component/carousel";
import { PlayerList } from "./player-list";
import { Button } from "../shadcn-component/button";
import { closeRoomById, fetchRoomScores } from "@/utils/func";
import toast from "react-hot-toast";
import { PartUnderConstruction } from "../chore-component/part-under-construction";
import { GameSection } from "./game-section";
import { Session } from "@/types/better-auth";

type RoomScore = {
  score: number;
  finished: boolean;
  user: { id: string; username: string | null; email: string; image: string | null };
};

type OwnerScreenForRoomProps = {
  room: Room | undefined;
  session: Session;
};

export const OwnerScreenForRoom = ({ room, session }: OwnerScreenForRoomProps) => {
  const router = useRouter();
  const [scores, setScores] = useState<RoomScore[]>([]);
  const [userInRoom, setUserInRoom] = useState(false);

  useEffect(() => {
    if (!room?.id) return;
    fetchRoomScores(room.id).then(setScores);
  }, [room?.id]);

  const handlePlay = () => {
    setUserInRoom(true);
  };

  const handleCopyLink = async () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied successfully", { id: "copy-link" });
    } catch (error) {
      toast.error("Something went wrong, link not copied successfully.", {
        id: "copy-link",
      });
      console.log(error);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      const data = await closeRoomById(room?.id || "");
      if (data.message) {
        toast.success(data.message, { id: "delete-room" });
        router.push("/room");
      }
    } catch (error) {
      toast.error("Something went wrong, room not deleted successfully.", {
        id: "delete-room",
      });
      console.log(error);
    }
  };

  const infoItems = [
    { label: "Title", value: room?.title },
    { label: "Questions", value: room?.questionCount || room?.questions.length },
    {
      label: "Status",
      value: room?.winner ? "Finished" : room?.closed ? "Closed" : "Open",
      icon: room?.winner ? <CircleX size={16} className="text-red-500" /> : room?.closed ? <Archive size={16} className="text-muted-foreground" /> : <RefreshCw size={16} className="text-green-500 animate-spin" />,
    },
    { label: "Winner", value: room?.winner?.email || "No winner yet" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm" hidden={userInRoom}>
        <h2 className="text-lg sm:text-xl font-bold mb-4">About your session</h2>

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

        <div className="w-full overflow-hidden">
          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <User size={14} />
                    Players
                  </span>
                  <PlayerList players={room?.players} />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <HelpCircle size={14} />
                    Questions
                  </span>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto rounded-lg border border-border p-3">
                    {room?.questions && room.questions.length > 0 ? (
                      room.questions.map((question: Question, index: number) => (
                        <div key={index} className="text-sm py-1.5 border-b border-border last:border-0">
                          <span className="text-muted-foreground mr-2">#{index + 1}</span>
                          {question.question}
                        </div>
                      ))
                    ) : room?.questionTypeId ? (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        Generated each time you play<br />
                        <span className="font-medium text-foreground">{room.questionCount} questions</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        No questions configured
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    Chat
                  </span>
                  <PartUnderConstruction />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <span className="text-sm font-semibold flex items-center gap-1.5">
            <Trophy size={14} />
            Scores
          </span>
          <div className="flex flex-col gap-1 rounded-lg border border-border p-3 max-h-40 overflow-y-auto">
            {scores.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No scores yet</p>
            ) : (
              scores.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">#{i + 1}</span>
                    {entry.user.username || entry.user.email}
                  </span>
                  <span className="font-semibold">{entry.score}pts</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 gap-2"
            onClick={handlePlay}
            disabled={room?.closed}
          >
            <Play size={16} />
            Play
          </Button>
          <Button
            className="flex-1 gap-2"
            variant="secondary"
            onClick={handleCopyLink}
          >
            <Copy size={16} />
            Copy link
          </Button>
          <Button
            className="flex-1 gap-2"
            variant="destructive"
            onClick={handleDeleteRoom}
            disabled={room?.closed}
          >
            <Trash2 size={16} />
            Close room
          </Button>
        </div>
      </div>

      <div id="game-section" hidden={!userInRoom}>
        <GameSection room={room} session={session} onBack={() => setUserInRoom(false)} />
      </div>
    </div>
  );
};
