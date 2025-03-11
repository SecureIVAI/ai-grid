"use client";

import SurveySection from "../../components/SurveySection";
import questions from "../../../../data/questions";

export default function InternalOrganization() {
  const internalOrgQuestions = questions.find(
    (section) => section.section === "Internal Organization"
  );

  return <div className="flex flex-col items-center justify-start pt-24 min-h-screen bg-gray-50 p-4">
    <SurveySection sectionData={internalOrgQuestions} nextPath="/survey/risk-management" />;
    </div>
}
