"use client";
import { InterviewLanding } from "@/components/ui/interview/interview-landing";
import { RoleSelect } from "@/components/ui/interview/role-select";
import { StackSelect } from "@/components/ui/interview/stack-select";
import { InterviewSession } from "@/components/ui/interview/interview-session";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/stores/useUser";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/shadcn-component/skeleton";

type Step = "landing" | "role-select" | "stack-select" | "session";

const Page = () => {
  const [logged, setLogged] = useState<boolean>(false);
  const [step, setStep] = useState<Step>("landing");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>("English");
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

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setStep("stack-select");
  };

  const handleStartSession = (lang: string, stack: string[]) => {
    setSelectedLang(lang);
    setSelectedStack(stack);
    setStep("session");
  };

  const handleResume = (role: string, stack: string[], lang: string) => {
    setSelectedRole(role);
    setSelectedStack(stack);
    setSelectedLang(lang);
    setStep("session");
  };

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

  const isSession = step === "session";

  return (
    <div className={isSession ? "flex flex-col" : "flex flex-col m-2 gap-3"}>
      {!isSession && <Header logged={logged} session={session} />}
      {step === "landing" && (
        <InterviewLanding
          onStart={() => setStep("role-select")}
          onResume={handleResume}
        />
      )}
      {step === "role-select" && (
        <RoleSelect
          onSelectRole={handleSelectRole}
          onBack={() => setStep("landing")}
        />
      )}
      {step === "stack-select" && (
        <StackSelect
          role={selectedRole}
          onStart={handleStartSession}
          onBack={() => setStep("role-select")}
        />
      )}
      {step === "session" && (
        <InterviewSession
          role={selectedRole}
          stack={selectedStack}
          lang={selectedLang}
          onBack={() => setStep("landing")}
        />
      )}
      {!isSession && <Footer />}
    </div>
  );
};

export default Page;
