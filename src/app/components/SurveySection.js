"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SurveySection({ sectionData, nextPath, prevPath }) {
  
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // Or show nothing while redirecting
  }



  const [responses, setResponses] = useState({});
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [surveyData, setSurveyData] = useState(null);
  useEffect(() => {
    if (id) {
      const fetchSurvey = async () => {
        try {
          const response = await fetch(`/api/auth/history/continueSurvey?id=${id}`);
          if (!response.ok) throw new Error("Failed to fetch survey.");

          const data = await response.json();
          setSurveyData(data);
          if (data.responses) {
            setResponses(data.responses); // Set responses from the fetched survey data
          }
        } catch (error) {
          console.error("Error fetching survey data:", error);
        } 
      };

      fetchSurvey();
    }
  }, [id]);


  const [showFollowUp, setShowFollowUp] = useState({}); // initially empty

  useEffect(() => {
    const initialShowFollowUp = {};
    const allResponses = JSON.parse(localStorage.getItem("responses")) || {};
  
    sectionData.questions.forEach(q => {
      if (
        q.questionID &&
        q.followUp &&
        allResponses.hasOwnProperty(q.questionID) &&
        allResponses[q.questionID] === 'yes'
      ) {
        initialShowFollowUp[q.questionID] = true;
      }
    });
  
    setShowFollowUp(initialShowFollowUp);
  }, [sectionData.questions]);
  
  const [showTooltip, setShowTooltip] = useState(false);

  // isDependencyMet now checks the global 'responses' state directly using questionID
  const isDependencyMet = (q, currentResponses) => {
    // A question without a dependency or with an empty one is always met.
    if (!q.dependency || q.dependency.length === 0) return true;
    // A question without a questionID cannot have its dependencies checked properly if they are cross-section.
    if (!q.questionID) {
        console.warn("Cannot check dependency for question without questionID:", q.text);
        return false; // Or true, depending on desired behavior
    }

    // Check if *every* dependency question ID has the required answer ("yes") in the *global* responses state.
    return q.dependency.every((depQuestionID) => {
        // Directly access the response using the dependency question ID.
        // This assumes the dependency question's answer is stored with depQuestionID as the key.
        const dependencyResponse = currentResponses[depQuestionID];

        // If the dependency is specifically "answer must be yes"
        return dependencyResponse === "yes";

        // If the dependency is just "must be answered", you might check:
        // return dependencyResponse !== undefined && dependencyResponse !== null && dependencyResponse !== '';
    });
  };


  // Enabled state calculation now uses the potentially global 'responses' state

  const [enabledQuestions, setEnabledQuestions] = useState({});
  useEffect(() => {
    const updatedEnabled = {};
  
    sectionData.questions.forEach((q, index) => {
      const key = q.questionID || `noID-${sectionData.section}-${index}`;
      if (q.questionID) {
        updatedEnabled[key] = isDependencyMet(q, responses);
      } else {
        updatedEnabled[key] = !q.dependency || q.dependency.length === 0;
      }
    });
  
    setEnabledQuestions(updatedEnabled);
  }, [responses, sectionData]);
  
  


  // useEffect recalculates dependencies based on the updated global 'responses'
  useEffect(() => {
    const updatedEnabledQuestions = {};
    sectionData.questions.forEach((q, index) => { // Added index for fallback key
        const key = q.questionID || `noID-${sectionData.section}-${index}`; // Use index in fallback
        // Pass the current 'responses' state to the check function
        updatedEnabledQuestions[key] = isDependencyMet(q, responses);
    });
    // Only update if the enabled status actually changed to avoid infinite loops if possible
    // Using stringify is simple but potentially inefficient for large objects.
    // A more robust check would iterate and compare values.
    if (JSON.stringify(enabledQuestions) !== JSON.stringify(updatedEnabledQuestions)) {
       setEnabledQuestions(updatedEnabledQuestions);
    }
    // Dependency array includes 'responses' so this runs whenever an answer changes.
    // Also include sectionData.questions in case the questions themselves change dynamically.
  }, [responses, sectionData.questions, enabledQuestions]); // Added enabledQuestions to dependencies


  // Use questionID as the key in handleChange
  const handleChange = (question, value) => { // Pass the whole question object
    if (!question) {
        console.error("handleChange called on undefined question");
        return;
    }
    // Use questionID if available, otherwise construct a fallback key
    const questionKey = question.questionID || `noID-${sectionData.section}-${sectionData.questions.findIndex(q => q === question)}`;
    if (!questionKey) {
        console.error("Could not determine key for question:", question.text);
        return;
    }

    const type = question.type;
    const hasFollowUp = !!question.followUp;

    if (type === "multipleChoice") {
      setResponses((prev) => {
        const currentValues = prev[questionKey] || [];
        const isChecked = currentValues.includes(value);
        const updatedValues = isChecked
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [questionKey]: updatedValues };
      });
    } else {
      setResponses((prev) => ({
        ...prev,
        [questionKey]: value,
      }));
      if (hasFollowUp) {
        // Ensure follow-up state also uses the correct key
        setShowFollowUp((prev) => ({
          ...prev,
          [questionKey]: value === "yes", // Trigger follow-up visibility based on the main question's key
        }));
      }
    }
  };

  // Use questionID in file upload key generation
  const handleFileUpload = async (file, question) => { // Pass the whole question object
     if (!question || !question.followUp) {
        console.error("handleFileUpload called on invalid question", question);
        return;
     }
     // Use questionID if available, otherwise construct a fallback key
     const questionKey = question.questionID || `noID-${sectionData.section}-${sectionData.questions.findIndex(q => q === question)}`;
     if (!questionKey) {
        console.error("Could not determine key for file upload question:", question.text);
        return;
     }

     const followUpTitle = question.followUp.title || 'Uploaded File'; // Get title from followUp
     const fileResponseKey = `${questionKey}-file`; // Define a unique key for the file response

     const formData = new FormData();
     formData.append("file", file);

     try {
       const res = await axios.post("http://localhost:3000/upload", formData, {
         headers: { "Content-Type": "multipart/form-data" },
       });

       const link = res.data.link;

       // Always read the latest from localStorage before updating
       const storedResponses = JSON.parse(localStorage.getItem("responses")) || {};

       const fileResponse = {
         [fileResponseKey]: { // Use the specific file response key
           name: followUpTitle,
           data: link,
         },
       };

       // Merge the new file response with existing stored responses
       const updatedResponses = { ...storedResponses, ...fileResponse };
       localStorage.setItem("responses", JSON.stringify(updatedResponses));

       // Update the component's state by merging the new file response
       setResponses((prevResponses) => ({ ...prevResponses, ...fileResponse }));

     } catch (err) {
       console.error("File upload failed", err);
       alert("Upload failed. Please try again.");
     }
  };


  const saveProgress = () => {
    if (!responses || Object.keys(responses).length === 0) {
      alert("No progress to save!");
      return;
    }
    localStorage.setItem("responses", JSON.stringify(responses));
  };
  
  const saveToServer = async (responses, id, status = 'In Progress') => {
    const currentTime = new Date().toISOString();
    try {
      const response = await fetch("/api/auth/history/saveProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          responses,
          lastSection: sectionData.section,
          timestamp: currentTime,
          status,
        }),
      });
     
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving progress to server:", errorData.error);
        return { success: false, message: "Failed to save progress to the server." };
      }
  
      return { success: true, message: "Progress saved successfully." };
    } catch (error) {
      console.error("Error saving progress to server:", error);
      return { success: false, message: "Failed to save progress to the server." };
    }
  };
  
  
  const handlePause = async () => {
    saveProgress(); // Save locally
    const result = await saveToServer(responses, id); // Save to server
  
    if (result.success) {
      alert(`Survey paused and progress saved at: ${new Date().toLocaleString()}`);
    } else {
      alert(result.message);
    }
  };
  

  const handleNext = async () => {
    saveProgress(); 
    console.log(nextPath); // Debugging log for nextPath
  
    if (nextPath === `../../results`) { // Match only `/results`, not `/results/id=${id}`
      await saveToServer(responses, id, 'Completed');
      console.log("Survey completed and saved to server.");
    } else {
      await saveToServer(responses, id);
    }
  
    router.push(`${nextPath}?id=${id}`); // Navigate to the next page with id as query parameter
  };
  


  const handleBack = async() => {
    saveProgress();
    await saveToServer(responses, id);
    router.push(`${prevPath}?id=${id}`); // Use the prevPath 
  };


  const tooltipText =
    sectionData.tooltipText ||
    "Hover over the title for more information about this section.";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <h1 className="text-2xl font-bold mb-2">{sectionData.title}</h1>
        {showTooltip && (
          <div className="absolute left-0 bottom-full mb-2 p-2 w-64 bg-gray-700 text-white text-sm rounded shadow-lg z-10">
            {tooltipText}
          </div>
        )}
      </div>
      <p className="text-gray-600 mb-4">{sectionData.objective}</p>

      {sectionData.questions.map((q, index) => {
         // Determine key and disabled status using questionID if available, else use fallback
         const questionKey = q.questionID || `noID-${sectionData.section}-${index}`;
         const disabled = !enabledQuestions[questionKey];

         // Generate dependency note for display
         const dependencyNote = (q.dependency && q.dependency.length > 0 && disabled)
           ? `Requires 'Yes' for question(s): ${q.dependency.join(', ')}`
           : null;

         // Find the corresponding file response key if it exists
         const fileResponseKey = q.followUp && q.followUp.type === "file" ? `${questionKey}-file` : null;

        return (
          <div key={questionKey} className={`mt-4 relative ${disabled ? "opacity-50" : ""}`}> {/* Removed pointer-events-none from outer div */}
            <label className="block font-medium">{q.questionID && `${q.questionID}: `}{q.text}</label>

            {/* Display dependency note if the question is disabled */}
            {dependencyNote && (
                <p className="text-xs text-red-600 italic mt-1">{dependencyNote}</p>
            )}

            {/* Add pointer-events-none specifically to the input elements container if disabled */}
            <div className={disabled ? "pointer-events-none" : ""}>
                {q.type === "yesno" ? (
                  <>
                    <input
                      type="radio"
                      id={`yesbox-${questionKey}`} // Use unique key for ID
                      name={`question-${questionKey}`} // Use unique key for name
                      value="yes"
                      checked={responses[questionKey] === "yes"}
                      // Pass the whole question object to handleChange
                      onChange={() => handleChange(q, "yes")}
                      // disabled={disabled} // HTML disabled attribute is sufficient with pointer-events on parent
                    />
                    <label htmlFor={`yesbox-${questionKey}`}> Yes &emsp;&emsp;</label>

                    <input
                      type="radio"
                      id={`nobox-${questionKey}`}
                      name={`question-${questionKey}`}
                      value="no"
                      checked={responses[questionKey] === "no"}
                      // Pass the whole question object to handleChange
                      onChange={() => handleChange(q, "no")}
                      // disabled={disabled}
                    />
                    <label htmlFor={`nobox-${questionKey}`}> No</label>

                    {/* Follow-up visibility check */}
                    {q.followUp && showFollowUp[questionKey] && ( // Removed !disabled check here, parent div handles pointer-events
                        <div className="mt-2 ml-4">
                         <label className="block font-medium">{q.followUp.text}</label>
                         {q.followUp.type === "file" ? (
                           <div>
                             <input
                               type="file"
                               // Pass the whole question object to file upload
                               onChange={(e) => e.target.files && e.target.files.length > 0 && handleFileUpload(e.target.files[0], q)}
                               className="w-full p-2 border rounded"
                               // disabled={disabled} // No need to disable here if parent has pointer-events: none
                             />
                             {/* Check for file response using the specific file key */}
                             {fileResponseKey && responses[fileResponseKey] && (
                               <p className="text-green-600 mt-1 text-sm">
                                 File uploaded:{" "}
                                 <a
                                   href={responses[fileResponseKey]?.data}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="underline"
                                 >
                                   {responses[fileResponseKey]?.name || 'View file'}
                                 </a>
                               </p>
                             )}
                           </div>
                         ) : (
                           <input
                             type="text"
                             // Follow-up text input - key should also be unique
                             value={responses[`${questionKey}-followUp`] || ""}
                             onChange={(e) =>
                               setResponses((prev) => ({
                                 ...prev,
                                 [`${questionKey}-followUp`]: e.target.value, // Ensure this key is unique if needed elsewhere
                               }))
                             }
                             className="w-full p-2 border rounded"
                             // disabled={disabled}
                           />
                         )}
                       </div>
                    )}
                  </>
                ) : q.type === "likert" ? (
                  <div className="flex flex-col items-center">
                    <input
                      type="range"
                      list={`rangeslider-${questionKey}`} // Unique list ID
                      min="1"
                      max="5"
                      value={responses[questionKey] || "3"} // Default to '3' if undefined
                       // Pass the whole question object to handleChange
                      onChange={(e) => handleChange(q, e.target.value)}
                      className="w-[90%] mb-2 cursor-pointer" // Ensure cursor changes even if disabled via parent
                      // disabled={disabled}
                    />
                    <datalist id={`rangeslider-${questionKey}`} className="text-xs w-[90%] flex justify-between px-[5%]">
                       {/* Adjust styling as needed for better label placement */}
                      <option value="1" label="Non-compliant"></option>
                      <option value="2" label="Minimally"></option>
                      <option value="3" label="Partially"></option>
                      <option value="4" label="Substantially"></option>
                      <option value="5" label="Fully Compliant"></option>
                    </datalist>
                     {/* Display current value text below */}
                     <div className="text-sm text-gray-600 w-[90%] text-center mt-1">
                       { {1: 'Non-compliant', 2: 'Minimally Compliant', 3: 'Partially Compliant', 4: 'Substantially Compliant', 5: 'Fully Compliant'}[responses[questionKey] || "3"] }
                     </div>
                  </div>
                ) : q.type === "dropdown" ? (
                  <select
                    value={responses[questionKey] || ""} // Use empty string for default "Select" option
                    // Pass the whole question object to handleChange
                    onChange={(e) => handleChange(q, e.target.value)}
                    className="w-full p-2 border rounded"
                    // disabled={disabled}
                  >
                    <option value="" disabled>Select</option> {/* Default disabled option */}
                    {q.options.map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : q.type === "multipleChoice" ? (
                   <div className="flex flex-col">
                     {q.options.map((option, idx) => (
                       <div key={idx} className="flex items-center">
                         <input
                           type="checkbox"
                           id={`checkbox-${questionKey}-${idx}`} // Unique ID
                           value={option} // The value is the option text itself
                           checked={responses[questionKey]?.includes(option)} // Check if option is in the array
                           // Pass the whole question object and the specific option value
                           onChange={() => handleChange(q, option)}
                           className="mr-2"
                           // disabled={disabled}
                         />
                         <label htmlFor={`checkbox-${questionKey}-${idx}`}>
                           {option}
                         </label>
                       </div>
                     ))}
                   </div>
                ) : ( // Default case (e.g., text input)
                  <input
                    type="text"
                    value={responses[questionKey] || ""}
                     // Pass the whole question object to handleChange
                    onChange={(e) => handleChange(q, e.target.value)}
                    className="w-full p-2 border rounded"
                    // disabled={disabled}
                  />
                )}
            </div> {/* End of pointer-events-none wrapper */}
          </div>
        );
      })}

      <div className="flex justify-end mt-4 gap-5">
        {pathname !== "/survey/context" && ( // Assuming context is the first page
          <button
            onClick={handleBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
        )}

        <button
          onClick={handlePause}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
        >
          Pause & Save
        </button>

        <button
          onClick={handleNext}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}