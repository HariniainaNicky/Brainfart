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
import { ChangePassword } from "./change-password";
import { User, Link2, Monitor, Shield, Lock } from "lucide-react";

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
  const [active, setActive] = useState<"profil" | "account" | "security" | "session" | "admin">("profil");

  const isAdmin = session.user.role === "admin";

  const nav = [
    { id: "profil" as const, label: "Profile", icon: User, desc: "Avatar and personal info" },
    { id: "account" as const, label: "Account", icon: Link2, desc: "Linked providers" },
    { id: "security" as const, label: "Security", icon: Lock, desc: "Password and email" },
    { id: "session" as const, label: "Sessions", icon: Monitor, desc: "Active devices" },
    ...(isAdmin ? [{ id: "admin" as const, label: "Admin", icon: Shield, desc: "Manage users" }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-6">
      <aside className="md:w-64 shrink-0">
        <div className="rounded-xl border border-border bg-card p-2 flex flex-col gap-1 md:sticky md:top-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left cursor-pointer transition-colors ${
                  isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`size-8 rounded-md flex items-center justify-center shrink-0 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold capitalize">{active === "admin" ? "Admin Dashboard" : active}</h2>
            <p className="text-sm text-muted-foreground">
              {active === "profil" && "Manage your profile and display name"}
              {active === "account" && "Manage linked accounts"}
              {active === "security" && "Password, email and security settings"}
              {active === "session" && "Devices where you are logged in"}
              {active === "admin" && "Moderation tools"}
            </p>
          </div>
          <div className="p-6">
            {active === "profil" && (
              <div className="flex flex-col gap-6">
                <ProfilBody session={session} />
                <Separator />
                <ProfilSettings />
              </div>
            )}
            {active === "account" && <AccountSetting />}
            {active === "security" && <ChangePassword />}
            {active === "session" && <SessionSetting />}
            {active === "admin" && isAdmin && <AdminDashBoard />}
          </div>
        </div>
      </div>
    </div>
  );
};
