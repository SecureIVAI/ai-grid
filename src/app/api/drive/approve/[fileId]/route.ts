// app/api/drive/approve/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { moveDriveFile } from "@/lib/googleDrive";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  context: Promise<{ params: { fileId: string } }>,
) {
  try {
    const { params } = await context;      // await it
    await moveDriveFile(params.fileId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Drive move error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
