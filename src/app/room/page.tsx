import { RoomHeader } from "@/components/ui/room/room-header";
import { Room } from "@/components/ui/room/room";

const Page = () => {
  return (
    <div className="min-h-screen">
      <RoomHeader targetedRedirect="/" />
      <Room />
    </div>
  );
};

export default Page;
