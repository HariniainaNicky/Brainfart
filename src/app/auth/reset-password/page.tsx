"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/shadcn-component/button";
import { Input } from "@/components/ui/shadcn-component/input";
import { Label } from "@/components/ui/shadcn-component/label";
import { ShowPassButton } from "@/components/ui/button/show-paas-button";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") || "";
    setToken(t);
  }, []);

  const handleReset = async () => {
    if (!password) {
      toast.error("Enter new password");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Resetting...");
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) toast.error(res.error.message || "Failed", { id: tid });
      else {
        toast.success("Password reset. You can now sign in.", { id: tid });
        router.push("/auth/sign-in");
      }
    } catch {
      toast.error("Failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password.</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input id="password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="pr-9" />
            <ShowPassButton showPass={showPass} setShowPass={setShowPass} />
          </div>
        </div>
        <Button onClick={handleReset} disabled={loading || !token} className="w-full">{loading ? "Resetting..." : "Reset password"}</Button>
        {!token && <p className="text-xs text-red-500 text-center">Missing token. Use the link from your email.</p>}
      </div>
    </div>
  );
};
export default Page;
