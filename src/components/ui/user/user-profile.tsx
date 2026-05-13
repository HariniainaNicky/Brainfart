"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../profil/avatar";
import { Calendar, Trophy, Star, Award } from "lucide-react";
import { Skeleton } from "../shadcn-component/skeleton";
import { formatRank, generateImage } from "@/utils/func";

type PublicUser = {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  image: string | null;
  rank: number | null;
  highestScore: number | null;
  createdAt: string;
};

type UserProfileProps = {
  userId: string;
};

export const UserProfile = ({ userId }: UserProfileProps) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.status === 404) {
          setNotFound(true);
          setUser(null);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (!json.data) {
          setNotFound(true);
          return;
        }
        setUser(json.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-8 p-6 md:p-10 max-w-2xl mx-auto w-full">
        <div className="w-full bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 max-w-2xl mx-auto w-full min-h-[50vh]">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center">
          <span className="text-4xl text-muted-foreground">?</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">User not found</h2>
        <p className="text-sm text-muted-foreground">
          This user doesn&apos;t exist or may have been removed.
        </p>
      </div>
    );
  }

  const avatarSrc = user.image || "";
  const joinDate = new Date(user.createdAt);
  const formattedRank = formatRank(user.rank ?? 0);

  const statCards = [
    { label: "Rank", value: user.rank ? formattedRank : "—", icon: Trophy },
    { label: "Score", value: user.highestScore ? `${user.highestScore} pts` : "0 pts", icon: Star },
    { label: "Member since", value: `${joinDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`, icon: Calendar },
    { label: "Status", value: user.rank !== null && user.rank <= 5 ? "Top Player" : "Player", icon: Award },
  ];

  return (
    <div className="flex flex-col items-center gap-8 p-6 md:p-10 max-w-2xl mx-auto w-full">
      {/* Profile header card */}
      <div className="w-full bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col items-center gap-4 text-center hover:border-primary/30 transition-colors duration-200">
        <Avatar
          src={avatarSrc}
          alt={user.username || user.name}
          size={120}
        />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user.displayUsername || user.name}
          </h1>
          {user.username && (
            <p className="text-sm text-muted-foreground mt-1">@{user.username}</p>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 bg-card border border-border rounded-lg p-4"
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className="font-medium text-sm text-foreground">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
