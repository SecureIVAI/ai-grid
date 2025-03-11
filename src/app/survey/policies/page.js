"use client";

import SurveySection from "../../components/SurveySection";
import questions from "../../../../data/questions";

export default function Policies() {
  const policyQuestions = questions.find(
    (section) => section.section === "Policies Related to AI"
  );

  return <div className="flex flex-col items-center justify-start pt-24 min-h-screen bg-gray-50 p-4">
    <SurveySection sectionData={policyQuestions} nextPath="/survey/internal-organization" />;
    </div>
}
