"use client";
import { useState } from "react";
import { Button } from "@/components/ui/shadcn-component/button";
import { Input } from "@/components/ui/shadcn-component/input";
import { Label } from "@/components/ui/shadcn-component/label";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import Link from "next/link";

const Page = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Sending reset link...");
    try {
      const res = await authClient.requestPasswordReset({ email, redirectTo: "/auth/reset-password" });
      if (res.error) toast.error(res.error.message || "Failed", { id: tid });
      else toast.success("Reset link sent. Check your email.", { id: tid });
    } catch {
      toast.error("Failed to send", { id: tid });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" />
        </div>
        <Button onClick={handleSend} disabled={loading} className="w-full">{loading ? "Sending..." : "Send reset link"}</Button>
        <Link href="/auth/sign-in" className="text-sm text-center hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
};
export default Page;
