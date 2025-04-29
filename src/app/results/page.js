"use client";

import { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsSolidGauge from "highcharts/modules/solid-gauge";

import questionsData from "../../../data/questions"; // Adjust path as needed

export default function ResultsPage() {
  const [chartOptions, setChartOptions] = useState(null);
  const [totalScoreChartOptions, setTotalScoreChartOptions] = useState(null); // NEW STATE
  const [loading, setLoading] = useState(true);
  const chartComponentRef = useRef(null);

  useEffect(() => {
    // This effect runs only on the client side after the component mounts
    setLoading(true);
    const loadedResponses = JSON.parse(localStorage.getItem("responses")) || {};

    // --- Scoring Logic ---
    const sectionScores = {};
    const sectionMaxScores = {};

    const wasDependencyMet = (q, responses) => {
      if (!q.dependency || q.dependency.length === 0) return true;
      return q.dependency.every((depQuestionID) => {
        return responses[depQuestionID] === "yes";
      });
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
          default:
            questionMaxPoints = 0;
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
              if (response === "yes") {
                questionActualScore = basePoints;
              }
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
            default:
              questionActualScore = 0;
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

    // --- Highcharts Options (Existing Chart) ---
    const options = {
      chart: {
        polar: true,
        type: "line",
      },
      title: {
        text: "Compliance Score by Section",
        x: 0,
        y: 20,
      },
      pane: {
        size: "80%",
      },
      xAxis: {
        categories: categories,
        tickmarkPlacement: "on",
        lineWidth: 0,
      },
      yAxis: {
        gridLineInterpolation: "polygon",
        lineWidth: 0,
        min: 0,
        max: 100,
        tickInterval: 20,
        labels: {
          format: "{value}%",
        },
      },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.1f}%</b><br/>',
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Your Compliance Percentage",
          data: seriesData,
          pointPlacement: "on",
        },
      ],
      credits: {
        enabled: false,
      },
    };

    // --- Calculate Total Score ---
    const totalActualScore = Object.values(sectionScores).reduce((a, b) => a + b, 0);
    const totalMaxScore = Object.values(sectionMaxScores).reduce((a, b) => a + b, 0);

    // --- Define Chart Options for the Total Score Chart ---
    setChartOptions(options);
    setTotalScoreChartOptions({
      chart: {
        type: "gauge",
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: "80%",
      },
      title: { text: "Total Compliance Score" },
      pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ["50%", "75%"], // Centered lower
        size: "110%",
      },
      yAxis: {
        min: 0,
        max: 100, // Updated to compliance percentage range
        tickPixelInterval: 72,
        tickPosition: "inside",
        tickLength: 20,
        tickWidth: 2,
        minorTickInterval: null,
        labels: {
          distance: 20,
          style: { fontSize: "14px" },
        },
        lineWidth: 0,
        plotBands: [
          { from: 0, to: 30, color: "#DF5353", thickness: 20 }, // Red (0-30%)
          { from: 31, to: 69, color: "#DDDF0D", thickness: 20 }, // Yellow (31-69%)
          { from: 70, to: 100, color: "#55BF3B", thickness: 20 }, // Green (70-100%)
        ],
      },
      series: [
        {
          name: "Compliance Score",
          data: [parseFloat(((totalActualScore / totalMaxScore) * 100).toFixed(2))], // Percentage-based scoring
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
        </div>
        <div className="w-3/7">
          <HighchartsReact highcharts={Highcharts} options={totalScoreChartOptions} />
        </div>
      </div>
    </div>
  );
}