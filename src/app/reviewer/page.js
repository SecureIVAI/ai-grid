"use client";

import { useState, useEffect } from "react";

export default function ReviewerPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:3000/files");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleValidate = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:3000/delete/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file.");
      }

      // Remove the deleted file from state
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error validating file:", error);
    }
  };

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
