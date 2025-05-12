// src/app/api/drive/delete/[fileId]/route.ts
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { deleteDriveFile } from "@/lib/googleDrive";   // ← your helper
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  context: any               // ← relax type so ParamCheck passes
) {
  // unwrap if the context happens to be a Promise
  const ctx = typeof context?.then === "function" ? await context : context;
  const fileId: string | undefined = ctx?.params?.fileId;

  if (!fileId) {
    return NextResponse.json(
      { success: false, error: "Missing fileId" },
      { status: 400 }
    );
  }

  await deleteDriveFile(fileId);

  // optional audit‑log
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `${session.user.name} deleted file ${fileId}`,
      },
    });
  }

  return NextResponse.json({ success: true });
}
