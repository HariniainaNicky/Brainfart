"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/shadcn-component/button";
import { Input } from "@/components/ui/shadcn-component/input";
import { Label } from "@/components/ui/shadcn-component/label";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const [emailParam, setEmailParam] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("email") || "";
    setEmailParam(v);
    setEmail(v);
  }, []);

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    setLoading(true);
    try {
      await authClient.sendVerificationEmail({ email, callbackURL: "/" });
      toast.success("Verification email sent. Check your inbox.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 text-center">
        <h1 className="text-xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to <span className="font-medium text-foreground">{emailParam || "your email"}</span>. Click the link to verify your account. The link expires in 30 minutes.
        </p>
        <p className="text-xs text-muted-foreground">If you did not receive it, resend below.</p>
        <div className="flex flex-col gap-2 text-left">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" />
        </div>
        <Button onClick={handleResend} disabled={loading} className="w-full">
          {loading ? "Sending..." : "Resend verification email"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/auth/sign-in")} className="w-full">
          Back to sign in
        </Button>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default Page;
