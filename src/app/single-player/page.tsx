import { RoomHeader } from "@/components/ui/room/room-header";
import { SinglePlayerMode } from "@/components/ui/room/single-player-mode";

const Page = () => {
  return <div className="min-h-screen">
    <RoomHeader targetedRedirect="/" />
    <SinglePlayerMode />
  </div>
}

export default Page;
