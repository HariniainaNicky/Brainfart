"use client";
import { useRouter } from "next/navigation";
import { User } from "@/types/db";
import { Avatar } from "../profil/avatar";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "../shadcn-component/table";

type UserTablePropsType = {
  users: User[];
  handleRefresh: () => void;
};

export const UserTable = ({ users, handleRefresh }: UserTablePropsType) => {
  const router = useRouter();

  return (
    <div className="w-full overflow-x-auto border rounded-lg bg-card">
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5%] text-left">Rank</TableHead>
            <TableHead className="text-left w-[20%]">Username</TableHead>
            <TableHead className="text-left w-[10%]">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              onClick={() => router.push(`/user/${user.id}`)}
            >
              <TableCell>{user.rank}</TableCell>
              <TableCell className="flex flex-row gap-2 items-center max-w-[180px] sm:max-w-[260px]">
                <Avatar
                  src={user.image || ""}
                  alt={user.username || ""}
                  size={20}
                />
                <span className="text-sm truncate">{user.username || user.email}</span>
              </TableCell>
              <TableCell>{user.highestScore}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
