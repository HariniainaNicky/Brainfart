import { RoomDisplayer } from "@/components/ui/room/room-displayer";
import { RoomHeader } from "@/components/ui/room/room-header";

const Page = () => {
  return <div className="min-h-screen">
    <RoomHeader targetedRedirect="/room" />
    <RoomDisplayer />
  </div>
}

export default Page;
