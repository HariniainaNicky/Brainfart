"use client";
import { Button } from "../shadcn-component/button";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "@/stores/useUser";
import { useState } from "react";
import { Spinner } from "../shadcn-component/spinner";

export const OAuth = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const setLoading = useUser((state) => state.setLoading);
  const handleGoogleSign = async () => {
    setGoogleLoading(true)
    const data = await authClient.signIn.social({
      provider: "google",
    });
    if (data) {
      toast.success("Redirecting to Google...");
    }
    setGoogleLoading(false)
  };

  const handleGithubSign = async () => {
    setGithubLoading(true)
    const data = await authClient.signIn.social({
      provider: "github",
    });
    if (data) {
      toast.success("Redirecting to GitHub...");
    }
    setGithubLoading(false)
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full">
      <Button
        className="flex items-center justify-center gap-2 w-full md:w-1/2
                   bg-card text-foreground border border-border hover:bg-accent
                   dark:bg-card dark:text-foreground dark:hover:bg-accent"
        onClick={handleGoogleSign}
      >
        { googleLoading ? ( <Spinner /> ) : ( <FcGoogle /> )} Continue with Google
      </Button>
      <Button
        className="flex items-center justify-center gap-2 w-full md:w-1/2
                   bg-primary text-primary-foreground hover:bg-primary/90
                   dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        onClick={handleGithubSign}
      >
        { githubLoading ? ( <Spinner /> ) : ( <FaGithub /> )} Continue with GitHub
      </Button>
    </div>
  );
};
