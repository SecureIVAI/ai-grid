"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import questionsData from "../../../data/questions";

const questions = questionsData.questions;
export default function Results() {
  const searchParams = useSearchParams();
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const storedResponses = JSON.parse(localStorage.getItem("responses")) || {};
    setResponses(storedResponses);
  
    // Score Calculation Logic
    let totalScore = 0;
    let totalWeight = 0;
    const chartData = [];
  
    questions.forEach((section) => {
      const sectionScore = section.questions.reduce((sectionTotal, q, index) => {
        const responseKey = `${section.section}-${index}`;
        const responseValue = storedResponses[responseKey];
        const weight = q.weight;
  
        if (responseValue) {
          let score = 0;
          if (q.type === "yesno") {
            score = responseValue === "yes" ? weight : 0;
          } else if (q.type === "likert") {
            score = (parseInt(responseValue) / 5) * weight;
          } else if (q.type === "dropdown") {
            score = parseInt(responseValue) * weight;
          }
          sectionTotal += score;
          totalScore += score;
          totalWeight += weight;
        }
  
        return sectionTotal;
      }, 0);
  
      chartData.push({
        name: section.section,
        y: sectionScore,
      });
    });
  
    setChartOptions({
      chart: { type: "pie" },
      title: { text: "Survey Results by Section" },
      series: [{ name: "Compliance Score", data: chartData }],
    });
  
    if (totalWeight > 0) {
      setScore(((totalScore / totalWeight) * 100).toFixed(2));
    }
  
  }, []);
  
  
  

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Survey Results</h1>
      <p className="text-lg mb-6">Your compliance score: {score}%</p>

      <p className="text-lg">
        {score < 50
          ? "Consider reviewing and strengthening your AI policies."
          : score < 75
          ? "Your AI policies are on the right track, but there's room for improvement."
          : "Great job! Your AI policies are in strong alignment with organizational goals."}
      </p>

      <div className="mt-6">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

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
              } else if (q.type === "dropdown") {
                score = parseInt(responseValue) * weight;
              }
              sectionTotal += score;
            }

            return sectionTotal;
          }, 0);

          return (
            <div key={section.section} className="mb-4">
              <h3 className="font-medium">{section.section}</h3>
              <p className="text-gray-600">
                Score: {(
                  (sectionScore /
                    section.questions.reduce((sum, q) => sum + q.weight, 0)) *
                  100
                ).toFixed(2)}
                %
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
