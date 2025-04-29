import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const { id, role } = await req.json();

  if (!session?.user?.id || !session.user.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `${session.user.name} changed role of ${targetUser.name ?? "user"} to ${role}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
