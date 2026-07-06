"use client";
import { InterviewLanding } from "@/components/ui/interview/interview-landing";
import { InterviewSession } from "@/components/ui/interview/interview-session";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/stores/useUser";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/shadcn-component/skeleton";

const Page = () => {
  const [logged, setLogged] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const { setUserData } = useUser();

  useEffect(() => {
    if (!session) {
      setLogged(false);
    } else {
      setLogged(true);
      setUserData(session?.user);
    }
  }, [session, setUserData]);

  if (isPending) {
    return (
      <div className="flex flex-col m-2 gap-3">
        <Skeleton className="h-16 w-full" />
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col m-2 gap-3">
      <Header logged={logged} session={session} />
      {selectedRole ? (
        <InterviewSession
          role={selectedRole}
          onBack={() => setSelectedRole(null)}
        />
      ) : (
        <InterviewLanding onSelectRole={setSelectedRole} />
      )}
      <Footer />
    </div>
  );
};

export default Page;
