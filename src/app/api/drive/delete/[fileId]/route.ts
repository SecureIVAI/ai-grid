import { deleteDriveFile } from "@/lib/googleDrive";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { fileId: string } },
) {
  try {
    await deleteDriveFile(params.fileId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Drive delete error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
