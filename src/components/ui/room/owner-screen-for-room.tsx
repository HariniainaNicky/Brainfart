import { Question, Room } from "@/types/db";
import { CircleX, RefreshCw, Copy, Trash2, User, HelpCircle, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../shadcn-component/carousel";
import { PlayerList } from "./player-list";
import { Button } from "../shadcn-component/button";
import { deleteRoomById } from "@/utils/func";
import toast from "react-hot-toast";
import { PartUnderConstruction } from "../chore-component/part-under-construction";

type OwnerScreenForRoomProps = {
  room: Room | undefined;
};

export const OwnerScreenForRoom = ({ room }: OwnerScreenForRoomProps) => {
  const router = useRouter();

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
      const data = await deleteRoomById(room?.id || "");
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
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
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
                    {room?.questions.map((question: Question, index: number) => (
                      <div key={index} className="text-sm py-1.5 border-b border-border last:border-0">
                        <span className="text-muted-foreground mr-2">#{index + 1}</span>
                        {question.question}
                      </div>
                    ))}
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
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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
        >
          <Trash2 size={16} />
          Close room
        </Button>
      </div>
    </div>
  );
};
