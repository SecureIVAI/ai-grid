import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function Results() {
  // Sample survey data (replace with real results from your backend)
  const surveyResults = {
    categories: ["Compliance", "Risk Management", "Data Security", "Governance"],
    scores: [85, 70, 90, 60], // Example scores out of 100
  };

  const options = {
    chart: {
      type: "column",
      backgroundColor: "#f9fafb", // Light gray background
    },
    title: {
      text: "Survey Results",
      style: { fontSize: "22px", fontWeight: "bold", color: "#333" },
    },
    xAxis: {
      categories: surveyResults.categories,
      title: { text: "Categories" },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: "Score (%)" },
    },
    series: [
      {
        name: "Your Score",
        data: surveyResults.scores,
        color: "#4F46E5", // Indigo color
      },
    ],
    tooltip: {
      valueSuffix: "%",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Survey Results</h1>
      <p className="text-gray-700 mb-6 max-w-lg text-center">
        Here’s a breakdown of your ISO 42001 compliance scores. Use these insights to
        improve your organization’s policies and practices.
      </p>
      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
}
