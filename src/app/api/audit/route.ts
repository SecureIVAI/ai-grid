import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json();

    await prisma.auditLog.create({
      data: { userId, action },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Audit‑log error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
