"use client";
import { Header } from "@/components/ui/header";
import { PlaygroundBody } from "@/components/ui/code/playground-body";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

const Page = () => {
  const { data: session, isPending } = authClient.useSession();
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (session) setLogged(true);
  }, [session]);

  return (
    <div className="flex flex-col m-2 gap-3">
      <Header logged={logged} session={session} isPending={isPending} />
      <PlaygroundBody />
    </div>
  );
};

export default Page;
