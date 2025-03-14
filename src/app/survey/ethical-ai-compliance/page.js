"use client";

import SurveySection from "../../components/SurveySection";
import questions from "../../../../data/questions";

export default function DataGovernance() {
  const dataGovernanceQuestions = questions.find(
    (section) => section.section === "Ethical AI Compliance"
  );

  return <div className="flex flex-col items-center justify-start pt-24 min-h-screen bg-gray-50 p-4">
    <SurveySection sectionData={dataGovernanceQuestions} nextPath="/results" />;
    </div>
}
