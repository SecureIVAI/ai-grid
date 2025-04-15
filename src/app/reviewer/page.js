"use client";

import { useState, useEffect } from "react";

export default function ReviewerPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        console.log("Fetching files...");
        const response = await fetch("http://localhost:3000/files");
        console.log("Response:", response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Data:", data);
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}