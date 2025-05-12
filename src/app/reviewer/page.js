"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function ReviewerPage() {
  const [files, setFiles] = useState([]);
  const { data: session } = useSession();        // ← client‑side session

  /* ---------- fetch list ---------- */
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, status } = await axios.get("/api/drive/files");
        if (status !== 200) throw new Error(`HTTP error! status: ${status}`);
        setFiles(data);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };
    fetchFiles();
  }, []);

  /* ---------- approve (move) file ---------- */
  const handleValidate = async (fileId) => {
    try {
      const { status } = await axios.post(`/api/drive/approve/${fileId}`);
      if (status !== 200) throw new Error(`HTTP error! status: ${status}`);

      // remove the moved file from local state
      setFiles((prev) => prev.filter((file) => file.id !== fileId));

      await axios.post("/api/audit", {
        userId: session?.user?.id,
        action: `${session?.user?.name} approved file ${fileId}`,
      });
    } catch (err) {
      console.error("Error validating file:", err);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col min-h-screen bg-white p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Review Uploaded Documents</h1>

      {files.map((file) => (
        <div key={file.id} className="mb-4 border p-4 rounded">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{file.name}</h2>
            <div className="flex items-center space-x-4">
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View in Google Drive
              </a>
              <button
                onClick={() => handleValidate(file.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Validate
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
