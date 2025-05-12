// app/api/drive/approve/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { moveDriveFile } from "@/lib/googleDrive";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  // ← context is directly the object, not a Promise
  { params }: { params: { fileId: string } },
) {
  try {
    // no await here — params is already available
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
