"use client";
import { Button } from "../shadcn-component/button";
import { ScrollArea } from "../shadcn-component/scroll-area";
import { useEffect, useState } from "react";
import { RoomSearchBar } from "../search-bar/room-search-ar";
import { Spinner } from "../shadcn-component/spinner";
import { Room } from "@/types/db";
import { filterSearchRoom } from "@/utils/func";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Users } from "lucide-react";

export const GameList = () => {
  const router = useRouter();

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchedRooms, setSearchedRooms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const response = await fetch("/api/rooms");
      const data = await response.json();
      setAllRooms(data.data);
      setRooms(data.data);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (searchedRooms === "") {
      setRooms(allRooms);
    } else {
      setRooms(filterSearchRoom(allRooms, searchedRooms));
    }
  }, [searchedRooms, allRooms]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
      <RoomSearchBar searchedRooms={searchedRooms} setSearchedRooms={setSearchedRooms} />
      <h3 className="text-lg md:text-xl font-semibold text-center sm:text-left">
        Available rooms
      </h3>

      <ScrollArea className="rounded-xl border border-border bg-card p-4 h-[60vh] md:h-[65vh]">
        {!loading ? (
          rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Users size={40} strokeWidth={1.5} />
              <p className="text-sm">No rooms yet... come back later</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => router.push(`/room/${room.id}`)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_12px_-4px_hsl(var(--primary))]"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-base md:text-lg font-semibold truncate">
                      {room.title}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {room.openedBy.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users size={14} />
                      {room.players?.length || 0}
                    </span>
                    <Button
                      size="sm"
                      className="transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/room/${room.id}`);
                      }}
                    >
                      Join
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
