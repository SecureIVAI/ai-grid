import { NextRequest, NextResponse } from "next/server";
import { moveDriveFile } from "@/lib/googleDrive";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;

    await moveDriveFile(fileId);

    // optional audit‑log
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: `${session.user.name} approved file ${fileId}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Drive move error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
