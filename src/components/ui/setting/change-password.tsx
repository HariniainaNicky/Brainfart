"use client";
import { useState, useMemo } from "react";
import { Input } from "../shadcn-component/input";
import { Label } from "../shadcn-component/label";
import { Button } from "../shadcn-component/button";
import { ShowPassButton } from "../button/show-paas-button";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import Link from "next/link";

const getPasswordScore = (pw: string) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, Math.max(0, score - 1));
};

const scoreLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const scoreColors = ["bg-muted", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => getPasswordScore(newPassword), [newPassword]);

  const handleChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (score < 2) {
      toast.error("New password is not strong enough");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Updating password...");
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (res.error) {
        toast.error(res.error.message || "Failed to change password", { id: tid });
      } else {
        toast.success("Password changed successfully", { id: tid });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (e) {
      toast.error("Failed to change password", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      <div>
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="text-sm text-muted-foreground">Update your password. You will be logged out from other devices.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="pr-9"
            />
            <ShowPassButton showPass={showCurrent} setShowPass={setShowCurrent} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="pr-9"
            />
            <ShowPassButton showPass={showNew} setShowPass={setShowNew} />
          </div>
          {newPassword && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? scoreColors[score] : "bg-muted"}`} />
                ))}
              </div>
              <p className={`text-xs ${score < 2 ? "text-red-500" : score < 3 ? "text-orange-500" : "text-green-600"}`}>{scoreLabels[score]}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmNewPassword">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="pr-9"
            />
            <ShowPassButton showPass={showConfirm} setShowPass={setShowConfirm} />
          </div>
        </div>

        <Button onClick={handleChange} disabled={loading} className="w-full">
          {loading ? "Updating..." : "Update password"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Forgot your password? <Link href="/auth/forgot-password" className="underline hover:text-foreground">Reset via email</Link>
        </p>
      </div>
    </div>
  );
};
