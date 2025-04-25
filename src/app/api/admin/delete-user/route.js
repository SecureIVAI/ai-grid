import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const { id } = await req.json();

  if (!session?.user?.id || !session.user.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedUser = await prisma.user.findUnique({ where: { id } });

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `${session.user.name} deleted user ${deletedUser.name ?? "unknown"}`,
      },
    });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
