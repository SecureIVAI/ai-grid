"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { Radar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ReactSpeedometer from "react-d3-speedometer";

import { downloadPDFReport } from '@/utils/downloadPDFReport';


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
  const [barChartData, setBarChartData] = useState(null);
  const [barChartOptions, setBarChartOptions] = useState(null);

  const riskAreas = { 
    highRisk: [
        { section: "4.1", description: "AI System Purpose & Intended Use" },
        { section: "4.3", description: "Risk Management & Impact Assessment" },
        { section: "6.1.1", description: "Data Acquisition & Usage" },
        { section: "7.3", description: "Supply Chain and Vendor AI Controls" }
    ],
    mediumRisk: [
        { section: "5.1", description: "Roles and Responsibilities in AI Systems" },
        { section: "6.2", description: "AI Model Transparency & Explainability" },
        { section: "8.1", description: "Model Lifecycle & Versioning" },
        { section: "9.1", description: "AI Monitoring & Evaluation" }
    ],
    lowRisk: [
        { section: "5.3", description: "Organizational Roles and Responsibilities" },
        { section: "7.5.2", description: "Supplier & Vendor Performance Tracking" },
        { section: "9.3.2", description: "Post-Incident Review" },
        { section: "A.4.2", description: "Risk Mitigation & Control Implementation" }
    ]
};

  const [questionCounts, setQuestionCounts] = useState({
    highRisk: [],
    mediumRisk: [],
    lowRisk: []
  });


  function countQuestionsBySpecificSection(questionsData) {
    const sectionCounts = {};
    
    questionsData.questions.forEach((sectionGroup) => {
      sectionGroup.questions.forEach((question) => {
        const specificSection = question.section;
        
        if (specificSection) {
          if (!sectionCounts[specificSection]) {
            sectionCounts[specificSection] = 0;
          }
          sectionCounts[specificSection]++;
        }
      });
    });
    
    return sectionCounts;
  }



  
  



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
        console.log("Section cover:", q.section);

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

      {/*Risk Area Calculation*/}
      const sectionCounts = countQuestionsBySpecificSection(questionsData);
      // Inside your useEffect, add this:
const groupSectionsByRiskArea = (sectionCounts, riskAreas, responses) => {
  // Create a map of section to questions for efficient lookup
  const sectionQuestionsMap = {};
  questionsData.questions.forEach(sectionGroup => {
    sectionGroup.questions.forEach(q => {
      if (!sectionQuestionsMap[q.section]) {
        sectionQuestionsMap[q.section] = [];
      }
      sectionQuestionsMap[q.section].push(q);
    });
  });

  return {
    highRisk: riskAreas.highRisk.map(area => {
      const questions = sectionQuestionsMap[area.section] || [];
      return {
        ...area,
        questionCount: sectionCounts[area.section] || 0,
        answerCount: questions.filter(q => 
          responses[q.questionID] === "yes" && 
          wasDependencyMet(q, responses)
        ).length
      };
    }),
    mediumRisk: riskAreas.mediumRisk.map(area => {
      const questions = sectionQuestionsMap[area.section] || [];
      return {
        ...area,
        questionCount: sectionCounts[area.section] || 0,
        answerCount: questions.filter(q => 
          responses[q.questionID] === "yes" && 
          wasDependencyMet(q, responses)
        ).length
      };
    }),
    lowRisk: riskAreas.lowRisk.map(area => {
      const questions = sectionQuestionsMap[area.section] || [];
      return {
        ...area,
        questionCount: sectionCounts[area.section] || 0,
        answerCount: questions.filter(q => 
          responses[q.questionID] === "yes" && 
          wasDependencyMet(q, responses)
        ).length
      };
    })
  };
};
  
      // Group sections by risk area and include question counts
      const sectionsByRiskArea = groupSectionsByRiskArea(sectionCounts, riskAreas, loadedResponses);
      setQuestionCounts(sectionsByRiskArea);
    
      

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
        
            if (!element || !element.datasetIndex) {
              return false; // Prevent error if datasetIndex is missing
            }
        
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

     let formattedValues = radarDataValues.map(value => parseFloat(value.toFixed(2)));

    setBarChartData({
      labels: radarLabels, // These are the section titles
      datasets: [
        {
          axis: 'y',  // Horizontal bar chart
          label: 'Compliance Percentage',
          data: formattedValues,  // Compliance percentages for each section
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)', 
            'rgba(255, 159, 64, 0.2)', 
            'rgba(255, 205, 86, 0.2)', 
            'rgba(75, 192, 192, 0.2)', 
            'rgba(54, 162, 235, 0.2)', 
            'rgba(153, 102, 255, 0.2)', 
            'rgba(101, 103, 247, 0.2)',
            'rgba(255,130,230, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)', 
            'rgb(255, 159, 64)', 
            'rgb(255, 205, 86)', 
            'rgb(75, 192, 192)', 
            'rgb(54, 162, 235)', 
            'rgb(153, 102, 255)', 
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        },
      ],
    });

    setBarChartOptions({
      indexAxis: 'y',  // Horizontal bar chart
      responsive: true,
      plugins: {
        datalabels: {
          display: false, // Completely disables data labels on bars
        },
        legend: { display: false },  // Disable legend if not needed
        title: {
          display: true,
          text: 'Section Compliance Overview',
          font: { size: 18 },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.x.toFixed(2)}%`,  // Format tooltip
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              if (value === 100) {
                return value + '%'; // Show "100%" only
              }
              return value; // Hide all other labels
            }
          },
        },
        y: {
          ticks: {
            font: { size: 12 },  // Font size for y-axis labels
          },
        },
      },
    });

    

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading results...</div>;
  }

  if (!radarChartData) {
      return <div className="p-8 text-center text-red-600">Could not load chart data. Please ensure responses are saved.</div>;
  }
  

  return (<>
    <div className="relative w-full bg-gray-50 p-4  "> 
      <button
        onClick={() => downloadPDFReport('results-container')}
        className="absolute left-3/4 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download Report (PDF)
      </button>
    </div>
    <div id="results-container" className="flex flex-col items-center w-full max-w-7xl mx-auto pt-15 pb-20 min-h-screen bg-gray-50 p-2">
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto pt-24 mb-10 bg-gray-50">
          <div className="flex w-full items-center justify-between pb-6 border-b-3 border-amber-700">
            <h1 className="text-6xl font-bold text-blue-700">
              Survey Results
            </h1>
            <img src="/logo.png" alt="Logo" className="h-16 w-16" />
          
          </div>
        </div>


        <div className="flex flex-col md:flex-row w-full md:space-x-8 space-y-8 md:space-y-0 divide-x-1  divide-gray-400">


          {/* Radar Chart Section */}
          <div className="w-full md:w-1/2 flex flex-col items-center" style={{ minHeight: '400px' }}>
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <Radar data={radarChartData} options={radarChartOptions} />
            </div>
            {nonCompliantSections.length > 0 && (
              <div className="mt-10 p-4 mr-10 bg-red-100 border border-red-300 rounded text-red-700 w-full">
                <h2 className="text-lg font-semibold mb-2">Non-Compliant Sections (Below 70%)</h2>
                <ul className="list-disc ml-6">
                  {nonCompliantSections.map((section, idx) => (
                    <li key={idx}>{section}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Bar Chart Section */}
            <div className="mt-8 w-full" style={{ position: 'relative', height: '400px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

            
          <div className="w-full md:w-1/2 flex flex-col items-center divide-x-3 divide-y-3 divide-gray-400" style={{ minHeight: '400px' }}>
               {/* Speedometer Section */}           
            <div style={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ReactSpeedometer
                value={totalPercentage}
                minValue={0}
                maxValue={100}
                segments={3}
                segmentColors={["#DF5353", "#DDDF0D", "#55BF3B"]}
                currentValueText={`${totalPercentage.toFixed(2)}%`}
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
             
              {/* RISK Priority */}
              <div className="w-full p-5 flex flex-col items-center">
                {/* High Risk List */}
                <div className="mt-4 p-4 bg-red-200 border border-gray-300 rounded text-gray-700 w-full">
                  <h2 className="text-lg font-semibold mb-2 text-center">High Risks</h2>
                  <ul className="list-disc ml-6">
                  {questionCounts.highRisk
                      .filter(area => (area.answerCount / area.questionCount) < 0.6)
                      .map((area) => (
                        <li key={area.section}>
                          {area.description} (Section {area.section}) 

                        </li>
                      ))
                    }
                  </ul>
                </div>

                {/* Medium Risk List */}
                <div className="mt-4 p-4 bg-yellow-100 border border-gray-300 rounded text-gray-700 w-full">
                  <h2 className="text-lg font-semibold mb-2 text-center">Medium Risks</h2>
                  <ul className="list-disc ml-6">
                  {questionCounts.mediumRisk
                      .filter(area => (area.answerCount / area.questionCount) < 0.6)
                      .map((area) => (
                        <li key={area.section}>
                          {area.description} (Section {area.section}) 

                        </li>
                      ))
                    }
                  </ul>
                </div>

                {/* Low Risk List */}
                <div className="mt-4 p-4 bg-green-100 border border-gray-300 rounded text-gray-700 w-full">
                  <h2 className="text-lg font-semibold mb-2 text-center">Low Risks</h2>
                  <ul className="list-disc ml-6">
                  {questionCounts.lowRisk
                      .filter(area => (area.answerCount / area.questionCount) < 0.6)
                      .map((area) => (
                        <li key={area.section}>
                          {area.description} (Section {area.section}) 

                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
             
          </div>
          

        </div>

        
    </div>
 

      {/* Copyright footer - add this at the bottom of your component */}
      <footer   className="mt-auto py-6 w-full text-center text-sm text-gray-500 border-t border-gray-200">
        <p>Product by Secure IVAI • IT Services and IT Consulting • © {new Date().getFullYear()}</p>
      </footer>

    </>


  );
}