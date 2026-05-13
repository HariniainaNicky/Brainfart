import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "../shadcn-component/input";
import { useUser } from "@/stores/useUser";
import { Button } from "../shadcn-component/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shadcn-component/dialog";

type FormValues = {
  username: string;
  email: string;
};

export const ProfilSettings = () => {
  const [loading, setLoading] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<FormValues>();
  const { userData } = useUser();

  const handleChangeEmail = async (data: FormValues) => {
    if (!data.email) {
      toast.error("Email is required", { id: "email-required" });
      return;
    }

    const loadId = toast.loading("Wait please...");
    setLoading(true);

    const { error } = await authClient.changeEmail({
      newEmail: data.email,
    });

    if (error) {
      toast.error(
        error.message || "Something went wrong while changing the email",
        { id: loadId },
      );
      setLoading(false);
      return;
    }

    toast.success("Email verification sent successfully", {
      id: loadId,
    });
    setLoading(false);
  };

  const handleChangeUsername = (data: FormValues) => {
    if (!data.username) {
      toast.error("Username is required", { id: "username-required" });
      return;
    }
    setConfirmUsername(data.username.replace(" ", "_"));
  };

  const confirmUsernameChange = async () => {
    if (!confirmUsername) return;

    const loadId = toast.loading("Updating username...");
    setLoading(true);

    const { error } = await authClient.updateUser({
      username: confirmUsername,
    });

    if (error) {
      toast.error(
        error.message || "Something went wrong while updating the username",
        { id: loadId },
      );
      setLoading(false);
      setConfirmUsername(null);
      return;
    }

    toast.success("Username updated successfully", { id: loadId });
    setLoading(false);
    setConfirmUsername(null);
  };

  return (
    <>
      <form className="my-5 flex flex-col gap-10 items-center">
        <div className="flex flex-col gap-6 justify-around items-center">
          <div className="flex flex-row gap-2 items-end">
            <div className="flex flex-col gap-2">
              <label htmlFor="username">Username</label>
              <Input
                type="text"
                {...register("username")}
                placeholder={userData?.username || "Your username here"}
              />
            </div>
            <Button
              onClick={handleSubmit(handleChangeUsername)}
              disabled={loading}
            >
              Change
            </Button>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <Input
                type="email"
                placeholder={userData?.email}
                {...register("email")}
              />
            </div>
            <Button
              onClick={handleSubmit(handleChangeEmail)}
              disabled={loading}
            >
              Change
            </Button>
          </div>
        </div>
      </form>

      <Dialog
        open={!!confirmUsername}
        onOpenChange={(open) => {
          if (!open) setConfirmUsername(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your username to{" "}
              <strong>{confirmUsername}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmUsername(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={confirmUsernameChange} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
