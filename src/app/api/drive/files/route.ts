import { listDriveFiles } from "@/lib/googleDrive";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const files = await listDriveFiles();
    return NextResponse.json(files);
  } catch (err: any) {
    console.error("Drive list error:", err);
    return NextResponse.json(
      { error: "Failed to fetch files from Google Drive." },
      { status: 500 },
    );
  }
}
