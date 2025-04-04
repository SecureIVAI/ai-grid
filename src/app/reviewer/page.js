"use client";

import { useState, useEffect } from "react";

export default function ReviewerPage() {
  const [responses, setResponses] = useState({});
  const [validatedFiles, setValidatedFiles] = useState({});

  useEffect(() => {
    const storedResponses = JSON.parse(localStorage.getItem("responses")) || {};
    const storedValidatedFiles = JSON.parse(localStorage.getItem("validatedFiles")) || {};
    setResponses(storedResponses);
    setValidatedFiles(storedValidatedFiles);
  }, []);

  const handleValidate = (fileKey) => {
    const updatedResponses = { ...responses };
    delete updatedResponses[fileKey]; // Remove the validated document from responses
  
    localStorage.setItem("responses", JSON.stringify(updatedResponses)); // Save the updated responses
    setResponses(updatedResponses); // Update the state
  };
  

  return (
    <div className="flex flex-col min-h-screen bg-white p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Review Uploaded Documents</h1>
      {Object.keys(responses).map((key) => {
        if (key.endsWith("-file") && !validatedFiles[key]) {
          const fileData = responses[key];
          return (
            <div key={key} className="mb-4 border p-4 rounded">
              {/* Flex container for the file name, download link, and validate button */}
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{fileData.name}</h2>
                <div className="flex items-center space-x-4">
                  {fileData.data.startsWith("data:image") ? (
                    <img
                      src={fileData.data}
                      alt={fileData.name}
                      className="mt-2 w-[100px] rounded shadow"
                    />
                  ) : (
                    <a
                      href={fileData.data}
                      download={fileData.name}
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => handleValidate(key)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Validate
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
