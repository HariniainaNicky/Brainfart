"use client"
import { getUsersWithCriteria } from "@/utils/func";
import { User } from "@/types/db";
import { useState, useEffect } from "react";
import { Spinner } from "../shadcn-component/spinner";
import { UserTable } from "../tables/user-table";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "../shadcn-component/skeleton";

export const LeaderboardBody = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { isPending } = authClient.useSession();

  useEffect(() => {
    const fetchUsersRanked = async () => {
      const users = await getUsersWithCriteria("rank");
      setUsers(users.data);
    };
    fetchUsersRanked();
  }, []);

  if (isPending) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center m-4">
        <Skeleton className="h-10 w-48" />
        <div className="w-full max-w-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return <div className="flex flex-col gap-5 items-center justify-center m-4">
    {users.length === 0 ? <Spinner /> : <UserTable users={users} />}
  </div>;
};
