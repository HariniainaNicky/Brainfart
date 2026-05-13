import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Button } from "../shadcn-component/button";
import { Skeleton } from "../shadcn-component/skeleton";
import { Github, Globe, Mail, Trash2, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shadcn-component/dialog";

type Account = {
  accountId: string;
  createdAt: Date;
  id: string;
  providerId: string;
  scope: string;
  updatedAt: Date;
};

const providerConfig: Record<string, { label: string; icon: typeof Globe }> = {
  github: { label: "GitHub", icon: Github },
  google: { label: "Google", icon: Globe },
  credentials: { label: "Email", icon: Mail },
};

export const AccountSetting = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);

  const fetchAccounts = async () => {
    try {
      const result = await authClient.listAccounts();
      if (result.error) {
        toast.error(result.error.message || "Failed to load accounts");
      }
      const normalized = (result.data ?? []).map((a: Account) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      }));
      setAccounts(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleUnlink = async () => {
    if (!unlinkTarget) return;

    if (accounts.length === 1) {
      toast.error("Cannot unlink your last sign-in method");
      setUnlinkTarget(null);
      return;
    }

    setUnlinking(true);
    try {
      await authClient.unlinkAccount({ providerId: unlinkTarget });
      toast.success("Account unlinked successfully");
      setUnlinkTarget(null);
      await fetchAccounts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to unlink account");
    } finally {
      setUnlinking(false);
    }
  };

  const linkedProviderIds = accounts.map((a) => a.providerId);
  const availableProviders = [
    { id: "google", label: "Google", callbackURL: "/setting" },
    { id: "github", label: "GitHub", callbackURL: "/setting" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <h2 className="text-xl font-bold">Linked Accounts</h2>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-row items-center justify-between bg-card border border-border rounded-lg p-4"
          >
            <div className="flex flex-row items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <h2 className="text-xl font-bold">Linked Accounts</h2>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No accounts linked yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((account) => {
            const config = providerConfig[account.providerId] || {
              label: account.providerId,
              icon: Link2,
            };
            const Icon = config.icon;
            const isCredentials = account.providerId === "credentials";

            return (
              <div
                key={account.id}
                className="flex flex-row items-center justify-between bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors duration-200"
              >
                <div className="flex flex-row items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {isCredentials
                        ? "Password-based login"
                        : `Connected since ${account.createdAt.toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setUnlinkTarget(account.providerId)}
                  disabled={isCredentials}
                  title={
                    isCredentials
                      ? "Cannot unlink credentials"
                      : "Unlink account"
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {accounts.length > 0 && (
        <div className="border-t border-border pt-4 mt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Add Connection
          </h3>
          <div className="flex flex-row flex-wrap gap-2">
            {availableProviders.map((provider) => {
              const isLinked = linkedProviderIds.includes(provider.id);
              return (
                <Button
                  key={provider.id}
                  variant="outline"
                  size="sm"
                  disabled={isLinked}
                  onClick={async () => {
                    await authClient.linkSocial({
                      provider: provider.id as "google" | "github",
                      callbackURL: provider.callbackURL,
                    });
                  }}
                  className="gap-2"
                >
                  {isLinked ? "Linked" : `Link ${provider.label}`}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <Dialog
        open={!!unlinkTarget}
        onOpenChange={(open) => {
          if (!open && !unlinking) setUnlinkTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink your{" "}
              <strong>
                {unlinkTarget
                  ? providerConfig[unlinkTarget]?.label || unlinkTarget
                  : ""}
              </strong>{" "}
              account? You will no longer be able to sign in using this method.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnlinkTarget(null)}
              disabled={unlinking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnlink}
              disabled={unlinking}
            >
              {unlinking ? "Unlinking..." : "Unlink"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
