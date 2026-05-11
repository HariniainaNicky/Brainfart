import { RoomCreationBodyCard } from "./room-creation-body-card";
export const RoomCreationBody = () => {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 pb-8">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-center">
        Create a room
      </h2>
      <div className="w-full rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <RoomCreationBodyCard />
      </div>
    </div>
  );
};
