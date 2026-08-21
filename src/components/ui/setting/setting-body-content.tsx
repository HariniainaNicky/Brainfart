"use client";
import { useState } from "react";
import { Button } from "../shadcn-component/button";
import { ProfilBody } from "../profil/profil-body";
import { Separator } from "../shadcn-component/separator";
import { ProfilSettings } from "../profil/profil-setting";
import { Session } from "@/types/better-auth";
import { AccountSetting } from "./account-setting";
import { SessionSetting } from "./session-setting";
import { AdminDashBoard } from "./admin-dashboard";

interface UserSession {
  id: string;
  name: string;
  username?: string | null;
  displayUsername?: string | null;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type SettingBodyContentProps = {
  user: UserSession | undefined;
  session: Session;
};

export const SettingBodyContent = ({
  user,
  session,
}: SettingBodyContentProps) => {
  const [profilShowed, setProfilShowed] = useState(true);
  const [accountShowed, setAccountShowed] = useState(false);
  const [sessionShowed, setSessionShowed] = useState(false);
  const [adminDashboardShowed, setAdminDashboardShowed] = useState(false);

  const handleShow = (section: string) => {
    setProfilShowed(section === "profil");
    setAccountShowed(section === "account");
    setSessionShowed(section === "session");
    setAdminDashboardShowed(section === "Admin setting");
  };

  const isAdmin = session.user.role === "admin";

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 p-4">
      <aside className="md:w-56 shrink-0">
        <div className="rounded-xl border border-border bg-card p-2 flex flex-col gap-1 md:sticky md:top-4">
          <Button
            variant={profilShowed ? "secondary" : "ghost"}
            onClick={() => handleShow("profil")}
            className="justify-start cursor-pointer"
          >
            Profil
          </Button>
          <Button
            variant={accountShowed ? "secondary" : "ghost"}
            onClick={() => handleShow("account")}
            className="justify-start cursor-pointer"
          >
            Account
          </Button>
          <Button
            variant={sessionShowed ? "secondary" : "ghost"}
            onClick={() => handleShow("session")}
            className="justify-start cursor-pointer"
          >
            Sessions
          </Button>
          {isAdmin && (
            <Button
              variant={adminDashboardShowed ? "secondary" : "ghost"}
              onClick={() => handleShow("Admin setting")}
              className="justify-start cursor-pointer"
            >
              Admin
            </Button>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-border bg-card p-6">
          {profilShowed && (
            <div className="flex flex-col gap-6">
              <ProfilBody session={session} />
              <Separator />
              <ProfilSettings />
            </div>
          )}

          {accountShowed && <AccountSetting />}

          {sessionShowed && <SessionSetting />}

          {isAdmin && adminDashboardShowed && <AdminDashBoard />}
          {isAdmin && adminDashboardShowed === false && !profilShowed && !accountShowed && !sessionShowed && (
            <p className="text-sm text-muted-foreground text-center py-8">Select a section from the sidebar.</p>
          )}
        </div>
      </div>
    </div>
  );
};
