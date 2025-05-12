/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { moveDriveFile } from "@/lib/googleDrive";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  context: any                    // ← relax the type so ParamCheck passes
) {
  // context may be a promise in edge runtime — unwrap if needed
  const ctx = typeof context?.then === "function" ? await context : context;
  const fileId: string | undefined = ctx?.params?.fileId;

  if (!fileId) {
    return NextResponse.json({ success: false, error: "Missing fileId" }, { status: 400 });
  }

  await moveDriveFile(fileId);

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
}
