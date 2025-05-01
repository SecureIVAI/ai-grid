"use client";

import { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import * as HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsSolidGauge from "highcharts/modules/solid-gauge";

import questionsData from "../../../data/questions";


export default function ResultsPage() {
  const [chartOptions, setChartOptions] = useState(null);
  const [totalScoreChartOptions, setTotalScoreChartOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nonCompliantSections, setNonCompliantSections] = useState([]); // New state
  const [complianceMessage, setComplianceMessage] = useState(""); // New state
  const chartComponentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const loadedResponses = JSON.parse(localStorage.getItem("responses")) || {};
    const sectionScores = {};
    const sectionMaxScores = {};

    const wasDependencyMet = (q, responses) => {
      if (!q.dependency || q.dependency.length === 0) return true;
      return q.dependency.every((depQuestionID) => responses[depQuestionID] === "yes");
    };

    questionsData.questions.forEach((sectionData) => {
      const sectionKey = sectionData.section;
      sectionScores[sectionKey] = 0;
      sectionMaxScores[sectionKey] = 0;

      sectionData.questions.forEach((q) => {
        const questionKey = q.questionID;
        const basePoints = q.dependency && q.dependency.length > 0 ? 1 : 2;
        let questionMaxPoints = 0;

        switch (q.type) {
          case "yesno":
          case "multipleChoice":
          case "likert":
          case "dropdown":
            questionMaxPoints = basePoints;
            break;
        }

        if (questionMaxPoints > 0) {
          sectionMaxScores[sectionKey] += questionMaxPoints;
        }

        const response = loadedResponses[questionKey];
        const dependencyMet = wasDependencyMet(q, loadedResponses);

        if (dependencyMet && response !== undefined && response !== null && response !== "") {
          let questionActualScore = 0;
          switch (q.type) {
            case "yesno":
              if (response === "yes") questionActualScore = basePoints;
              break;
            case "multipleChoice":
              if (Array.isArray(response) && q.options?.length) {
                questionActualScore = (response.length / q.options.length) * basePoints;
              }
              break;
            case "likert":
              const likertValue = parseInt(response);
              if (!isNaN(likertValue) && likertValue >= 1 && likertValue <= 5) {
                questionActualScore = ((likertValue - 1) / 4) * basePoints;
              }
              break;
            case "dropdown":
              questionActualScore = basePoints;
              break;
          }
          sectionScores[sectionKey] += questionActualScore;
        }
      });
    });

    const categories = questionsData.questions.map((sectionData) => sectionData.title);
    const seriesData = questionsData.questions.map((sectionData) => {
      const sectionKey = sectionData.section;
      const actual = sectionScores[sectionKey] || 0;
      const max = sectionMaxScores[sectionKey] || 1;
      return (actual / max) * 100;
    });

    // Identify non-compliant sections (< 70%)
    const nonCompliant = questionsData.questions
      .map((sectionData) => {
        const sectionKey = sectionData.section;
        const actual = sectionScores[sectionKey] || 0;
        const max = sectionMaxScores[sectionKey] || 1;
        const percentage = (actual / max) * 100;
        return { title: sectionData.title, percentage };
      })
      .filter((s) => s.percentage < 70)
      .map((s) => s.title);

    setNonCompliantSections(nonCompliant);

    const totalActualScore = Object.values(sectionScores).reduce((a, b) => a + b, 0);
    const totalMaxScore = Object.values(sectionMaxScores).reduce((a, b) => a + b, 0);
    const totalPercentage = (totalActualScore / totalMaxScore) * 100;

    if (totalPercentage < 31) {
      setComplianceMessage("Not Compliant: Your overall score is below 31%.");
    } else if (totalPercentage < 70) {
      setComplianceMessage("Partially Compliant: Your score is between 31% and 69%.");
    } else {
      setComplianceMessage("Compliant: Your overall compliance score is 70% or above.");
    }

    setChartOptions({
      chart: { polar: true, type: "line" },
      title: { text: "Compliance Score by Section", x: 0, y: 20 },
      pane: { size: "80%" },
      xAxis: {
        categories,
        tickmarkPlacement: "on",
        lineWidth: 0,
      },
      yAxis: {
        gridLineInterpolation: "polygon",
        lineWidth: 0,
        min: 0,
        max: 100,
        tickInterval: 20,
        labels: { format: "{value}%" },
      },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.1f}%</b><br/>',
      },
      legend: { enabled: false },
      series: [
        {
          name: "Your Compliance Percentage",
          data: seriesData,
          pointPlacement: "on",
        },
      ],
      credits: { enabled: false },
    });

    setTotalScoreChartOptions({
      chart: {
        type: "gauge",
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: "80%",
      },
      title: { text: "Total Compliance Score" },
      pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ["50%", "75%"],
        size: "110%",
      },
      yAxis: {
        min: 0,
        max: 100,
        tickPixelInterval: 72,
        tickPosition: "inside",
        tickLength: 20,
        tickWidth: 2,
        minorTickInterval: null,
        labels: { distance: 20, style: { fontSize: "14px" } },
        lineWidth: 0,
        plotBands: [
          { from: 0, to: 30, color: "#DF5353", thickness: 20 },
          { from: 31, to: 69, color: "#DDDF0D", thickness: 20 },
          { from: 70, to: 100, color: "#55BF3B", thickness: 20 },
        ],
      },
      series: [
        {
          name: "Compliance Score",
          data: [parseFloat(totalPercentage.toFixed(2))],
          tooltip: { valueSuffix: "%" },
          dataLabels: {
            format: "{y}%",
            borderWidth: 0,
            color: "#333333",
            style: { fontSize: "16px" },
          },
          dial: {
            radius: "80%",
            backgroundColor: "gray",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
          pivot: { backgroundColor: "gray", radius: 6 },
        },
      ],
      credits: { enabled: false },
    });

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading results...</div>;
  }

  if (!chartOptions || !totalScoreChartOptions) {
    return <div className="p-8 text-center text-red-600">Could not load chart data.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start pt-24 min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-8">Survey Results</h1>

      <div className="flex justify-center w-full max-w-7xl space-x-32">
        <div className="w-3/7">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartComponentRef} />
          {nonCompliantSections.length > 0 && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded text-red-700">
              <h2 className="text-lg font-semibold mb-2">Non-Compliant Sections (Below 70%)</h2>
              <ul className="list-disc ml-6">
                {nonCompliantSections.map((section, idx) => (
                  <li key={idx}>{section}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="w-3/7">
          <HighchartsReact highcharts={Highcharts} options={totalScoreChartOptions} />
          <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-700">
            <p>{complianceMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
