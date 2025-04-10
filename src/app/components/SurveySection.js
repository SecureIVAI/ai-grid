"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SurveySection({ sectionData, nextPath }) {
  const router = useRouter();
  const [showFollowUp, setShowFollowUp] = useState({});
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

  const handleChange = (index, value, hasFollowUp) => {
    setResponses((prev) => ({
      ...prev,
      [`${sectionData.section}-${index}`]: value,
    }));
    
    if (hasFollowUp) {
      setShowFollowUp((prev) => ({
        ...prev,
        [`${sectionData.section}-${index}`]: value === "yes",
      }));
    }
  };

  const handleLinkChange = (index, value) => {
    const storedResponses = JSON.parse(localStorage.getItem("responses")) || {};
    const updatedResponses = {
      ...storedResponses,
      [`${sectionData.section}-${index}-file`]: {
        name: sectionData.questions[index]?.followUp?.title,
        data: value, // Just the link
      },
    };
  
    localStorage.setItem("responses", JSON.stringify(updatedResponses));
    setResponses(updatedResponses);
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
        <h1 className="text-2xl font-bold mb-2">{sectionData.title}</h1>

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
                onChange={(e) => handleChange(index, "yes", q.followUp)}
              />
              <label htmlFor={`yesbox-${index}`}> Yes &emsp;&emsp;</label>

              <input
                type="radio"
                id={`nobox-${index}`}
                name={`question-${index}`}
                value="no"
                onChange={(e) => handleChange(index, "no", q.followUp)}
              />
              <label htmlFor={`nobox-${index}`}> No</label>
              
              {/* Display Follow-Up Question if applicable */}
              {q.followUp && showFollowUp[`${sectionData.section}-${index}`] && (
                <div className="mt-2 ml-4">
                  <label className="block font-medium">{q.followUp.text}</label>

                  {q.followUp.type === "file" ? (
                    <input
                    type="text"
                      placeholder="Paste your Google Drive link here"
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      className="w-full p-2 border rounded"
                    />       
                  ) : (
                    <input
                      type="text"
                      onChange={(e) =>
                        setResponses((prev) => ({
                          ...prev,
                          [`${sectionData.section}-${index}-followUp`]: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded"
                    />
                  )}
                </div>
              )}
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
                className="w-[90%] mb-2"
              />
              <datalist id="rangeslider" className="text-xs">
                <option value="1">Non-compliant</option>
                <option value="2">Minimally Compliant</option>
                <option value="3">Partially Compliant</option>
                <option value="4">Substantially Compliant</option>
                <option value="5">Fully Compliant</option>
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
