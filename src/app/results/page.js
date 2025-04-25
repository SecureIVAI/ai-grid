"use client";

import { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";

import questionsData from "../../../data/questions"; // Adjust path as needed

// Highcharts modules are not needed for basic column chart

export default function ResultsPage() {
  const [chartOptions, setChartOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartComponentRef = useRef(null);

  useEffect(() => {
    // This effect runs only on the client side after the component mounts
    setLoading(true);
    const loadedResponses = JSON.parse(localStorage.getItem("responses")) || {};

    // --- Scoring Logic ---

    const sectionScores = {}; // Actual scores obtained by the user per section
    const sectionMaxScores = {}; // Maximum possible scores per section (assuming all questions answered optimally and dependencies met)

    // Helper to check if a question's dependency was met based on loaded responses
    // This logic mirrors the dependency check in SurveySection.js
    const wasDependencyMet = (q, responses) => {
      if (!q.dependency || q.dependency.length === 0) return true;
      // Check if *every* dependency question ID had the required answer ("yes")
      return q.dependency.every((depQuestionID) => {
        return responses[depQuestionID] === "yes";
      });
    };

    // Iterate through each main section defined in questionsData
    questionsData.questions.forEach(sectionData => {
      const sectionKey = sectionData.section; // Use the short key like "context"
      sectionScores[sectionKey] = 0;
      sectionMaxScores[sectionKey] = 0;

      // Iterate through each question within the section
      sectionData.questions.forEach(q => {
        const questionKey = q.questionID; // Use questionID as the primary key for responses

        // Determine the base points for this question
        // 1 point if dependent, 2 points if not dependent
        const basePoints = (q.dependency && q.dependency.length > 0) ? 1 : 2;

        // Add the maximum possible points for this question to the section's max score
        // The max possible score calculation should consider the scoring type's potential max.
        let questionMaxPoints = 0;
        switch (q.type) {
          case "yesno":
            questionMaxPoints = basePoints; // Max points for 'yes'
            break;
          case "multipleChoice":
            questionMaxPoints = basePoints; // Max points if all options selected
            break;
          case "likert":
            // Likert 1-5, max score comes from 5.
            questionMaxPoints = basePoints;
            break;
          case "dropdown":
            // Assuming selecting *any* option gets the base points
             questionMaxPoints = basePoints;
            break;
           case "text": // Default or text input - typically not auto-scored based on content
           default:
             questionMaxPoints = 0; // Text/default questions don't contribute to this score type
             break;
        }
         // Only add max points if the question has a scorable type
         if (questionMaxPoints > 0) {
             sectionMaxScores[sectionKey] += questionMaxPoints;
         }


        // Check if the question was enabled and answered
        const response = loadedResponses[questionKey];
        const dependencyMet = wasDependencyMet(q, loadedResponses);

        if (dependencyMet && response !== undefined && response !== null && response !== '') {
             // Calculate the actual score for the answered question
             let questionActualScore = 0;
             switch (q.type) {
               case "yesno":
                 if (response === "yes") {
                   questionActualScore = basePoints;
                 }
                 break;
               case "multipleChoice":
                 // Response is expected to be an array of selected options
                 if (Array.isArray(response) && q.options && q.options.length > 0) {
                   // Score is fraction of options selected, scaled by basePoints
                    questionActualScore = (response.length / q.options.length) * basePoints;
                 } else if (Array.isArray(response) && (!q.options || q.options.length === 0)) {
                     // Handle case with multipleChoice but no options defined (shouldn't happen with valid JSON)
                     questionActualScore = 0; // Cannot score
                 }
                 break;
               case "likert":
                 // Assuming response is a string number "1" through "5"
                 const likertValue = parseInt(response);
                 if (!isNaN(likertValue) && likertValue >= 1 && likertValue <= 5) {
                   // Scale 1-5 to 0-1, then multiply by basePoints
                   questionActualScore = ((likertValue - 1) / 4) * basePoints;
                 }
                 break;
               case "dropdown":
                 // Assuming selecting *any* option gets the base points
                 // We already checked if response is not empty/null/undefined
                 questionActualScore = basePoints; // Score if an option was selected
                 break;
                case "text": // Default or text input - typically not auto-scored based on content
                default:
                  questionActualScore = 0; // Text/default questions don't contribute to this score type
                  break;
             }
             sectionScores[sectionKey] += questionActualScore;
        }
      });
    });

    // --- Prepare Data for Highcharts ---

    const categories = questionsData.questions.map(sectionData => sectionData.title); // Use full titles for labels
    const seriesData = questionsData.questions.map(sectionData => {
        const sectionKey = sectionData.section;
        const actual = sectionScores[sectionKey] || 0;
        const max = sectionMaxScores[sectionKey] || 1; // Avoid division by zero
        // Calculate percentage score
        return (actual / max) * 100;
    });

    // --- Highcharts Options (Column Chart) ---

    const options = {
      chart: {
        polar: true,
        type: 'line'
      },
      title: {
        text: 'Compliance Score by Section (Radar View)',
        x: -80
      },
      pane: {
        size: '80%'
      },
      xAxis: {
        categories: categories, // Use section titles
        tickmarkPlacement: 'on',
        lineWidth: 0
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 100,
        tickInterval: 20,
        labels: {
          format: '{value}%'
        }
      },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.1f}%</b><br/>'
      },
      legend: {
        enabled: false
      },
      series: [{
        name: 'Your Compliance Percentage',
        data: seriesData,
        pointPlacement: 'on'
      }],
      credits: {
        enabled: false
      }
    };
    

    setChartOptions(options);
    setLoading(false);

  }, []); // Empty dependency array means this effect runs only once after initial render

    // Handle case where chartOptions is not yet set or loading
    if (loading) {
      return (
        <div className="p-8 text-center">Loading results...</div>
      );
    }

     if (!chartOptions) {
         return (
             <div className="p-8 text-center text-red-600">Could not load chart data.</div>
         );
     }


  return (
    <div className="flex flex-col items-center justify-start pt-24 min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-8">Survey Results</h1>
       {/* Optional: Display overall score or other summaries here */}
       {/* <p>Overall Compliance: X%</p> */}

      <div className="w-full max-w-4xl"> {/* Adjust max-width as needed */}
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartComponentRef}
        />
      </div>
    </div>
  );
}