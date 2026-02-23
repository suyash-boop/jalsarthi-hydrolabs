"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/use-users";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  EDITOR: "bg-blue-100 text-blue-800",
  VIEWER: "bg-gray-100 text-gray-800",
};

export function UserManagementTable() {
  const { data: session } = useSession();
  const { users, loading, refetch } = useUsers();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentUserId = session?.user?.id;

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        refetch();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading users...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          User Management ({users.length} users)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="h-7 w-7 rounded-full"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-sm">
                        {user.name || "Unknown"}
                        {isSelf && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email || "—"}
                  </TableCell>
                  <TableCell>
                    {isSelf ? (
                      <Badge
                        variant="secondary"
                        className={ROLE_COLORS[user.role]}
                      >
                        {user.role}
                      </Badge>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v)}
                        disabled={updatingId === user.id}
                      >
                        <SelectTrigger className="h-7 w-[110px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="EDITOR">EDITOR</SelectItem>
                          <SelectItem value="VIEWER">VIEWER</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
