"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SurveySection({ sectionData, nextPath }) {
  const router = useRouter();
  const [responses, setResponses] = useState(() => {
    const defaultValues = {};
    sectionData.questions.forEach((q, index) => {
      if (q.type === "likert") {
        defaultValues[`${sectionData.section}-${index}`] = "3";
      }
    });
    return defaultValues;
  });

  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (index, value) => {
    setResponses((prev) => ({
      ...prev,
      [`${sectionData.section}-${index}`]: value,
    }));
  };

  const handleNext = () => {
    const storedResponses = JSON.parse(localStorage.getItem("responses")) || {};
    const updatedResponses = { ...storedResponses, ...responses };

    localStorage.setItem("responses", JSON.stringify(updatedResponses));
    router.push(nextPath);
  };

  const tooltipText =
    sectionData.tooltipText ||
    "Hover over the title for more information about this section.";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Dynamic Title with Tooltip */}
      <div
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <h1 className="text-2xl font-bold mb-2">{sectionData.section}</h1>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute left-0 bottom-full mb-2 p-2 w-64 bg-gray-700 text-white text-sm rounded shadow-lg">
            {tooltipText}
          </div>
        )}
      </div>
      <p className="text-gray-600 mb-4">{sectionData.objective}</p>

      {sectionData.questions.map((q, index) => (
        <div key={index} className="mt-4">
          <label className="block font-medium">{q.text}</label>
          {q.type === "yesno" ? (
            <>
              <input
                type="radio"
                id={`yesbox-${index}`}
                name={`question-${index}`}
                value="yes"
                onChange={(e) => handleChange(index, "yes")}
              />
              <label htmlFor={`yesbox-${index}`}> Yes &emsp;&emsp;</label>

              <input
                type="radio"
                id={`nobox-${index}`}
                name={`question-${index}`}
                value="no"
                onChange={(e) => handleChange(index, "no")}
              />
              <label htmlFor={`nobox-${index}`}> No</label>
            </>
          ) : q.type === "likert" ? (
            <div className="flex flex-col items-center">
              <input
                type="range"
                list="rangeslider"
                min="1"
                max="5"
                value={responses[`${sectionData.section}-${index}`] || "3"}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full"
              />
              <datalist id="rangeslider">
                <option value="1">Very Bad</option>
                <option value="2">Bad</option>
                <option value="3">Okay</option>
                <option value="4">Good</option>
                <option value="5">Very Good</option>
              </datalist>
            </div>
          ) : q.type === "dropdown" ? (
            <select
              value={responses[`${sectionData.section}-${index}`] || "0"}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="0" disabled>Select</option>
              {q.options.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full p-2 border rounded"
            />
          )}
        </div>
      ))}

      <div className="flex justify-end mt-4">
        <button
          onClick={handleNext}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
