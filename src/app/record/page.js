"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SurveyHistoryPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch("/api/history/getSurveyHistory");
        if (!response.ok) throw new Error("Failed to fetch survey history.");

        const data = await response.json();
        //console.log("Survey data:", data); 
        setSurveys(data.surveys ?? []);
      } catch (error) {
        console.error("Error fetching survey history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/history/deleteSurveyHistory", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      

      if (!response.ok) throw new Error(`Failed to delete survey ${id}`);

      setSurveys((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting survey record:", error);
    }
  };
  const handleContinue = async (id) => {
    try {
      const response = await fetch(`/api/history/continueSurvey?id=${id}`);
      const data = await response.json();
  
      if (!response.ok) throw new Error("Failed to continue survey.");
  
      // Store the entire survey data in localStorage for later use
      localStorage.setItem("currentSurvey", JSON.stringify(data));
  
      // Directly use lastSection from the data
      const lastSection = data.lastSection || "context"; // Default section if lastSection is missing
  
      console.log("Section data:", lastSection); 
      router.push(`survey/${lastSection}`); // Navigate to lastSection
    } catch (error) {
      console.error("Error continuing survey:", error);
    }
  };
  
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Survey History</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : surveys.length === 0 ? (
        <p className="text-gray-500">No survey history found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3">ID</th>
              <th className="border p-3">Created</th>
              <th className="border p-3">Last Saved</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
              {surveys.map((survey, index) => (
                <tr key={survey.id} className="bg-white text-center">
                  <td className="border p-3">{index + 1}</td> 
                  <td className="border p-3">
                    {survey.createdAt
                      ? new Date(survey.createdAt).toLocaleString()
                      : "Unknown"}
                  </td>
                  <td className="border p-3">
                    {survey.timestamp
                      ? new Date(survey.timestamp).toLocaleString()
                      : "Unknown"}
                  </td>
                  <td
                    className={`border p-3 ${
                      survey.status === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {survey.status}
                  </td>
                  <td className="border p-3 flex justify-center gap-3">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      onClick={() => handleContinue(survey.id)}
                    >
                      Continue
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      onClick={() => handleDelete(survey.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

        </table>
      )}
    </div>
  );
}
