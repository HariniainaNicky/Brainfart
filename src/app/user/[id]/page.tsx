"use client"

import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Header } from "@/components/ui/header";
import { Skeleton } from "@/components/ui/shadcn-component/skeleton";
import { UserProfile } from "@/components/ui/user/user-profile";

const Page = () => {
  const params = useParams();
  const userId = params.id as string;
  const [logged, setLogged] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session?.user) setLogged(true);
    else setLogged(false);
  }, [session]);

  if (isPending) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-16 w-full" />
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Header logged={logged} session={session} />
      <UserProfile userId={userId} />
    </div>
  );
}

export default Page
