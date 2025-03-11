"use client";

import SurveySection from "../../components/SurveySection";
import questions from "../../../../data/questions";

export default function RiskManagement() {
  const riskManagementQuestions = questions.find(
    (section) => section.section === "Risk Management"
  );

  return <div className="flex flex-col items-center justify-start pt-24 min-h-screen bg-gray-50 p-4">
    <SurveySection sectionData={riskManagementQuestions} nextPath="/survey/data-governance"/>
    </div>
}
