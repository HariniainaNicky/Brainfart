"use client"
import { getUsersWithCriteria, refreshRanks, getMaxPage, paginate } from "@/utils/func";
import { User } from "@/types/db";
import { useState, useEffect } from "react";
import { Button } from "../shadcn-component/button";
import { UserTable } from "../tables/user-table";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "../shadcn-component/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const LeaderboardBody = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { data: session, isPending } = authClient.useSession();

  const pageSize = 10;

  useEffect(() => {
    const fetchUsersRanked = async () => {
      setLoading(true);
      try {
        const res = await getUsersWithCriteria("rank");
        const list: User[] = Array.isArray(res?.data) ? res.data : [];
        setUsers(list);
        setMaxPage(getMaxPage(list, pageSize) || 1);
        setPage(1);
      } catch {
        setUsers([]);
        setMaxPage(1);
      } finally {
        setLoading(false);
      }
    };
    fetchUsersRanked();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshRanks(session?.user?.id || "");
      const res = await getUsersWithCriteria("rank");
      const list: User[] = Array.isArray(res?.data) ? res.data : [];
      setUsers(list);
      setMaxPage(getMaxPage(list, pageSize) || 1);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  const paginatedUsers = paginate(users, page, pageSize);

  if (isPending || loading) {
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

  return <div className="flex flex-col gap-5 items-center justify-center m-4 w-full">
    <Button variant="secondary" onClick={handleRefresh} disabled={loading}>Refresh leaderboard</Button>
    {users.length === 0 ? (
      <p className="text-sm text-muted-foreground py-8">No users yet.</p>
    ) : (
      <>
        <UserTable users={paginatedUsers} handleRefresh={handleRefresh}/>
        <div className="flex flex-row justify-end gap-2 items-center w-full max-w-2xl">
          <span className="text-sm text-muted-foreground">{page}/{maxPage}</span>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ArrowLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page === maxPage}>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </>
    )}
  </div>;
};
