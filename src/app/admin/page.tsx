import AdminPageClient from "../components/AdminPageClient";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface SafeAuditLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    select: {
      id: true,
      action: true,
      timestamp: true,
      user: {
        select: { name: true },
      },
    },
  });

  const safeUsers: SafeUser[] = users.map((u: any) => ({
    ...u,
    createdAt: new Date(u.createdAt).toLocaleString(),
  }));
  const safeLogs: SafeAuditLog[] = logs.map((log: any): SafeAuditLog => ({
    id: log.id,
    action: log.action,
    timestamp: new Date(log.timestamp).toLocaleString(),
    user: log.user?.name || "Unknown",
  }));

  return <AdminPageClient users={safeUsers} logs={safeLogs} currentUserId={session?.user?.id ?? ""} />;
}
