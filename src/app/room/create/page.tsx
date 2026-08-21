"use client";
import { RoomCreationBody } from "@/components/ui/room/room-creation-body";
import { RoomHeader } from "@/components/ui/room/room-header";
import { YouNeedAnAccount } from "@/components/ui/chore-component/you-need-an-account";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/shadcn-component/skeleton";

const Page = () => {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return (
      <div className="min-h-screen">
        <RoomHeader targetedRedirect="/room" />
        <div className="flex justify-center p-8"><Skeleton className="h-64 w-full max-w-lg" /></div>
      </div>
    );
  }
  if (!session) return <YouNeedAnAccount />;
  return <div className="min-h-screen">
    <RoomHeader targetedRedirect="/room" />
    <RoomCreationBody />
  </div>;
}

export default Page;
