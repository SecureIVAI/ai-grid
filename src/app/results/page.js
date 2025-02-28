"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import questions from "../../../data/questions";

export default function Results() {
  const searchParams = useSearchParams(); // Use useSearchParams to get searchParams
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [chartOptions, setChartOptions] = useState({});

  // Effect to run when query data is available
  useEffect(() => {
    const data = searchParams.get("data"); // Use .get() to access query parameters
    if (data) {
      // Parse the responses from query string
      const parsedResponses = JSON.parse(decodeURIComponent(data));
      setResponses(parsedResponses);

      // Now, let's calculate the total weighted score and prepare chart data
      let totalScore = 0;
      let totalWeight = 0;
      const chartData = [];

      // Iterate through each section and question to calculate total score and prepare chart data
      questions.forEach((section) => {
        const sectionScore = section.questions.reduce((sectionTotal, q, index) => {
          const responseKey = `${section.section}-${index}`;
          const responseValue = parsedResponses[responseKey];
          const weight = q.weight;

          if (responseValue) {
            let score = 0;
            if (q.type === "yesno") {
              score = responseValue === "yes" ? weight : 0;
            } else if (q.type === "likert") {
              // Assume that a Likert scale response is between 1-5, we scale it to the weight
              score = (parseInt(responseValue) / 5) * weight;
            }
            sectionTotal += score;
            totalScore += score;
            totalWeight += weight;
          }

          return sectionTotal;
        }, 0);

        chartData.push({
          name: section.section,
          y: sectionScore, // Each section's total score
        });
      });

      // Prepare the chart options
      setChartOptions({
        chart: {
          type: "pie",
        },
        title: {
          text: "Survey Results by Section",
        },
        series: [
          {
            name: "Compliance Score",
            data: chartData,
          },
        ],
      });

      // Set the final score
      if (totalWeight > 0) {
        setScore(((totalScore / totalWeight) * 100).toFixed(2)); // Final score as percentage
      }
    }
  }, [searchParams]); // Add searchParams as a dependency

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Survey Results</h1>
      <p className="text-lg mb-6">Your compliance score: {score}%</p>

      {/* Display different messages based on score */}
      <p className="text-lg">
        {score < 50
          ? "Consider reviewing and strengthening your AI policies."
          : score < 75
          ? "Your AI policies are on the right track, but there's room for improvement."
          : "Great job! Your AI policies are in strong alignment with organizational goals."}
      </p>

      {/* Render pie chart */}
      <div className="mt-6">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

      {/* Optional: Display each section's detailed score */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Section Scores:</h2>
        {questions.map((section) => {
          const sectionScore = section.questions.reduce((sectionTotal, q, index) => {
            const responseKey = `${section.section}-${index}`;
            const responseValue = responses[responseKey];
            const weight = q.weight;

            if (responseValue) {
              let score = 0;
              if (q.type === "yesno") {
                score = responseValue === "yes" ? weight : 0;
              } else if (q.type === "likert") {
                score = (parseInt(responseValue) / 5) * weight;
              }
              sectionTotal += score;
            }

            return sectionTotal;
          }, 0);

          return (
            <div key={section.section} className="mb-4">
              <h3 className="font-medium">{section.section}</h3>
              <p className="text-gray-600">Score: {((sectionScore / section.questions.reduce((sum, q) => sum + q.weight, 0)) * 100).toFixed(2)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}