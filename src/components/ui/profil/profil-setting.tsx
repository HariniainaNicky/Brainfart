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

type EditableField = "name" | "username" | "displayUsername" | "email";

type ConfirmState = {
  field: EditableField;
  value: string;
  currentLabel: string;
};

type FormValues = {
  name: string;
  username: string;
  displayUsername: string;
  email: string;
};

const fieldLabels: Record<EditableField, string> = {
  name: "Display Name",
  username: "Username",
  displayUsername: "Display Username",
  email: "Email",
};

export const ProfilSettings = () => {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const { register, handleSubmit } = useForm<FormValues>();
  const { userData } = useUser();

  const handleFieldChange = (field: EditableField, data: FormValues) => {
    const value = data[field];
    if (!value) {
      toast.error(`${fieldLabels[field]} is required`, {
        id: `${field}-required`,
      });
      return;
    }

    let currentLabel = "";
    switch (field) {
      case "name":
        currentLabel = userData?.name || "";
        break;
      case "username":
        currentLabel = userData?.username || "";
        break;
      case "displayUsername":
        currentLabel = userData?.displayUsername || "";
        break;
      case "email":
        currentLabel = userData?.email || "";
        break;
    }

    const finalValue = field === "username" ? value.replace(" ", "_") : value;
    setConfirm({ field, value: finalValue, currentLabel });
  };

  const confirmFieldChange = async () => {
    if (!confirm) return;

    const loadId = toast.loading("Updating...");
    setLoading(true);

    let error: { message?: string } | undefined;

    if (confirm.field === "email") {
      ({ error } = await authClient.changeEmail({
        newEmail: confirm.value,
      }));
    } else {
      ({ error } = await authClient.updateUser({
        [confirm.field]: confirm.value,
      }));
    }

    if (error) {
      toast.error(error.message || "Something went wrong", { id: loadId });
      setLoading(false);
      setConfirm(null);
      return;
    }

    const label = fieldLabels[confirm.field];
    const isEmail = confirm.field === "email";
    toast.success(
      isEmail
        ? "Email verification sent successfully"
        : `${label} updated successfully`,
      { id: loadId },
    );
    setLoading(false);
    setConfirm(null);
  };

  const fields: EditableField[] = ["name", "displayUsername", "username", "email"];

  return (
    <>
      <form className="my-5 flex flex-col gap-6 items-center w-full max-w-md mx-auto">
        {fields.map((field) => (
          <div
            key={field}
            className="flex flex-col gap-2 w-full bg-card border border-border rounded-lg p-4"
          >
            <label htmlFor={field} className="text-sm font-medium text-foreground">
              {fieldLabels[field]}
            </label>
            {field === "email" && (
              <p className="text-xs text-muted-foreground -mt-1">
                Changing email will send a verification message
              </p>
            )}
            <div className="flex flex-row gap-2 items-end">
              <Input
                type={field === "email" ? "email" : "text"}
                {...register(field)}
                placeholder={
                  field === "name"
                    ? userData?.name || "Your display name"
                    : field === "username"
                      ? userData?.username || "Your username"
                      : field === "displayUsername"
                        ? userData?.displayUsername || "Your display username"
                        : userData?.email || "Your email"
                }
                className="flex-1"
              />
              <Button
                onClick={handleSubmit((data) => handleFieldChange(field, data))}
                disabled={loading}
                className="shrink-0"
              >
                Change
              </Button>
            </div>
          </div>
        ))}
      </form>

      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change {confirm ? fieldLabels[confirm.field] : ""}</DialogTitle>
            <DialogDescription>
              {confirm?.field === "email" ? (
                <>
                  Are you sure you want to change your email from{" "}
                  <strong>{confirm?.currentLabel}</strong> to{" "}
                  <strong>{confirm?.value}</strong>? A verification email will be
                  sent.
                </>
              ) : (
                <>
                  Are you sure you want to change your{" "}
                  {confirm ? fieldLabels[confirm.field].toLowerCase() : ""} from{" "}
                  <strong>{confirm?.currentLabel}</strong> to{" "}
                  <strong>{confirm?.value}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirm(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={confirmFieldChange} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
