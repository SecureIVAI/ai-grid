"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import questions from "../../../data/questions";

export default function Survey() {
  const router = useRouter();
  const [responses, setResponses] = useState({});

  const handleChange = (section, index, value) => {
    setResponses((prev) => ({
      ...prev,
      [`${section.section}-${index}`]: value, // Update the response for this question
    }));
  };

  const handleSubmit = () => {
    // Custom replacer function to handle circular references
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return; // Exclude circular reference
          }
          seen.add(value);
        }
        return value;
      };
    };

    // Stringify responses with the custom replacer
    const responsesData = JSON.stringify(responses, getCircularReplacer());

    // Construct the URL with query parameters
    const url = `/results?data=${encodeURIComponent(responsesData)}`;

    // Use router.push with the URL string
    router.push(url);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">ISO 42001 Compliance Survey</h1>
      {questions.map((section) => (
        <div key={section.section} className="mb-6">
          <h2 className="text-lg font-semibold">{section.section}</h2>
          <p className="text-gray-600">{section.objective}</p>
          {section.questions.map((q, index) => (
            <div key={index} className="mt-4">
              <label className="block font-medium">{q.text}</label>
              {q.type === "yesno" ? (
                <>
                  <input type="radio" id={"yesbox"+q.text} name={q.text} value="yes" />
                  <label for={"yesbox"+q.text}> Yes &emsp;&emsp;</label>
                  <input type="radio" id={"nobox"+q.text} name={q.text} value="no" />
                  <label for={"nobox"+q.text}> No</label>
                </>
              ) : q.type === "likert" ? (
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    list="rangeslider"
                    min="1"
                    max="5"
                    value={responses[`${section.section}-${index}`] || "3"} // Set the value from responses
                    onChange={(e) => handleChange(section, index, e.target.value)}
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
                  onChange={(e) => handleChange(section, index, e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Bi-Yearly">Bi-Yearly</option>
                </select>
              ) : (
                <input
                  type="text"
                  onChange={(e) => handleChange(section, index, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded mt-4">
        Submit
      </button>
    </div>
  );
}