// src/lib/googleDrive.ts
import { google, drive_v3 } from "googleapis";
import { Readable } from "stream";

const folderId = process.env.GDRIVE_FOLDER_ID!;
if (!folderId) throw new Error("Missing GDRIVE_FOLDER_ID env var");

const approvedFolderId = process.env.GDRIVE_APPROVED_FOLDER_ID!;
if (!approvedFolderId)
  throw new Error("Missing GDRIVE_APPROVED_FOLDER_ID env var");

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
if (!serviceAccountJson) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(serviceAccountJson),
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

/** Return a typed Drive client (with a light cast to satisfy the typings) */
async function getDrive(): Promise<drive_v3.Drive> {
  const authClient = await auth.getClient();
  // Cast because googleapis' DriveOptions `auth` union is narrower than `getClient()` return type
  return google.drive({ version: "v3", auth: authClient as any });
}

/** Upload a file buffer to the shared Drive folder and return its web link */
export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const drive = await getDrive();

  const { data } = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id, webViewLink",
  });

  if (!data.webViewLink)
    throw new Error("Upload succeeded but webViewLink is missing");

  return data.webViewLink;
}

/** List all files in the shared folder */
export async function listDriveFiles(): Promise<drive_v3.Schema$File[]> {
  const drive = await getDrive();

  const { data } = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,webViewLink)",
  });

  return (data.files ?? []) as drive_v3.Schema$File[];
}

/** Permanently delete a file from Drive */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const drive = await getDrive();
  await drive.files.delete({ fileId });
}

export async function moveDriveFile(fileId: string): Promise<void> {
  const drive = await getDrive();

  await drive.files.update({
    fileId,
    addParents: approvedFolderId,
    removeParents: folderId, // original uploads folder
    fields: "id, parents",
  });
}

async function makePublic(drive: drive_v3.Drive, fileId: string) {
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: "anyone",
      role: "reader",
    },
  });
}
