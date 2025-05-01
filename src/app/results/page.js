"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, registerables } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ReactSpeedometer from "react-d3-speedometer";


ChartJS.register(...registerables, ChartDataLabels);

import questionsData from "../../../data/questions";

export default function ResultsPage() {
  const [radarChartData, setRadarChartData] = useState(null);
  const [radarChartOptions, setRadarChartOptions] = useState(null);
  const [gaugeChartData, setGaugeChartData] = useState(null);
  const [gaugeChartOptions, setGaugeChartOptions] = useState(null);

  const [loading, setLoading] = useState(true);
  const [nonCompliantSections, setNonCompliantSections] = useState([]);
  const [complianceMessage, setComplianceMessage] = useState("");
   const [totalPercentage, setTotalPercentage] = useState(0);


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
            if (wasDependencyMet(q, loadedResponses)) {
                 sectionMaxScores[sectionKey] += questionMaxPoints;
            } else if (!q.dependency || q.dependency.length === 0) {
                 sectionMaxScores[sectionKey] += questionMaxPoints;
            }
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
                 if (q.correctAnswer && Array.isArray(q.correctAnswer)) {
                    const correctSelected = response.filter(r => q.correctAnswer.includes(r));
                    if (q.correctAnswer.length > 0) {
                        questionActualScore = (correctSelected.length / q.correctAnswer.length) * basePoints;
                    } else {
                        questionActualScore = 0;
                    }
                 } else {
                    if (response.length > 0) {
                        questionActualScore = basePoints;
                    }
                 }
               }
              break;
            case "likert":
              const likertValue = parseInt(response);
              if (!isNaN(likertValue) && likertValue >= 1 && likertValue <= 5) {
                questionActualScore = ((likertValue - 1) / 4) * basePoints;
              }
              break;
            case "dropdown":
               if (response !== null && response !== "") {
                    questionActualScore = basePoints;
               }
              break;
          }
           sectionScores[sectionKey] += Math.min(questionActualScore, basePoints);
        }
      });
    });

    const radarLabels = questionsData.questions.map((sectionData) => sectionData.title);
    const radarDataValues = questionsData.questions.map((sectionData) => {
      const sectionKey = sectionData.section;
      const actual = sectionScores[sectionKey] || 0;
      const max = sectionMaxScores[sectionKey] || 1;
      return Math.max(0, Math.min(100, (actual / max) * 100));
    });

    const nonCompliant = radarDataValues
        .map((score, index) => ({ score, label: radarLabels[index] }))
        .filter(item => item.score < 70)
        .map(item => item.label);

    setNonCompliantSections(nonCompliant);

    setRadarChartData({
      labels: radarLabels,
      datasets: [
        {
          label: 'Your Compliance Percentage',
          data: radarDataValues,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    });

    setRadarChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Compliance Score by Section",
          font: { size: 18 },
        },
        legend: {
          display: false,
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.r !== null) {
                        label += context.parsed.r.toFixed(2) + '%';
                    }
                    return label;
                }
            }
        },
        datalabels: {
             display: function(context) {
                 const chart = context.chart;
                 const element = context.element;

                 const activeElements = chart.getActiveElements();

                 const isActive = activeElements.some(activeElement =>
                     activeElement.datasetIndex === element.datasetIndex &&
                     activeElement.index === element.index
                 );

                 return isActive;
             },
             formatter: function(value, context) {
                 return typeof value === 'number' ? value.toFixed(2) + '%' : '';
             },
             color: '#444',
             font: {
                 size: 10,
             },
         }
      },
      scales: {
        r: {
          angleLines: { display: true },
          grid: { circular: true },
          suggestedMin: 0,
          suggestedMax: 100,
          stepSize: 20,
          pointLabels: { font: { size: 12 } },
          ticks: {
              beginAtZero: true,
              callback: function(value) { return value + '%'; }
          }
        },
      },
    });

    const totalActualScore = Object.values(sectionScores).reduce((a, b) => a + b, 0);
    const totalMaxScore = Object.values(sectionMaxScores).reduce((a, b) => a + b, 0);
    const calculatedTotalPercentage = (totalMaxScore === 0) ? 0 : Math.max(0, Math.min(100, (totalActualScore / totalMaxScore) * 100));

    setTotalPercentage(calculatedTotalPercentage);

     if (calculatedTotalPercentage < 31) {
       setComplianceMessage("Not Compliant: Your overall score is below 31%.");
     } else if (calculatedTotalPercentage < 70) {
       setComplianceMessage("Partially Compliant: Your score is between 31% and 69%.");
     } else {
       setComplianceMessage("Compliant: Your overall compliance score is 70% or above.");
     }

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading results...</div>;
  }

  if (!radarChartData) {
      return <div className="p-8 text-center text-red-600">Could not load chart data. Please ensure responses are saved.</div>;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto pt-24 min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-8 w-full text-center">Survey Results</h1>

      <div className="flex flex-col md:flex-row w-full md:space-x-8 space-y-8 md:space-y-0">

        <div className="w-full md:w-1/2 flex flex-col items-center" style={{ minHeight: '400px' }}>
           <div style={{ position: 'relative', height: '400px', width: '100%' }}>
             <Radar data={radarChartData} options={radarChartOptions} />
           </div>
           {nonCompliantSections.length > 0 && (
             <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded text-red-700 w-full">
               <h2 className="text-lg font-semibold mb-2">Non-Compliant Sections (Below 70%)</h2>
               <ul className="list-disc ml-6">
                 {nonCompliantSections.map((section, idx) => (
                   <li key={idx}>{section}</li>
                 ))}
               </ul>
             </div>
           )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center" style={{ minHeight: '400px' }}>
           {/* Wrapper div to control the size of the speedometer */}
           <div style={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ReactSpeedometer
                value={totalPercentage}
                minValue={0}
                maxValue={100}
                segments={3}
                segmentColors={["#DF5353", "#DDDF0D", "#55BF3B"]}
                currentValueText={`${totalPercentage.toFixed(1)}%`}
                needleColor="#444"
                textColor="#444"
                width={500}
                height={300}
                ringWidth={30}
                needleTransitionDuration={3333}
                needleTransition="easeElastic"
              />
          </div>
          <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-700 w-full">
            <p>{complianceMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}