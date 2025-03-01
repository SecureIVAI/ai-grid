const questions = [
    {
      section: "Policies Related to AI",
      objective: "Ensure AI policies align with organizational goals.",
      questions: [
        {
          text: "Does your organization have a documented AI policy?",
          type: "yesno",
          weight: 10,
        },
        {
          text: "To what extent does your AI policy align with existing organizational policies?",
          type: "likert",
          weight: 8,
        },
        {
          text: "Has your AI policy been reviewed within the last 12 months?",
          type: "yesno",
          weight: 7,
        },
      ],
    },
    {
      section: "Internal Organization",
      objective: "Define clear AI management roles and responsibilities.",
      questions: [
        {
          text: "Have roles and responsibilities for AI management been clearly defined?",
          type: "yesno",
          weight: 9,
        },
        {
          text: "Do employees receive training on AI-related policies and risks?",
          type: "yesno",
          weight: 8,
        },
        {
          text: "Rate your organization's level of AI governance maturity.",
          type: "likert",
          weight: 10,
        },
      ],
    },
    {
      section: "Risk Management",
      objective: "Ensure AI-related risks are identified and mitigated.",
      questions: [
        {
          text: "Does your organization conduct AI risk assessments?",
          type: "yesno",
          weight: 10,
        },
        {
          text: "How frequently are AI risk assessments conducted?",
          type: "dropdown",
          weight: 8,
        },
        {
          text: "Are AI-related risks included in enterprise-wide risk management?",
          type: "yesno",
          weight: 9,
        },
      ],
    },
    {
      section: "Data Governance",
      objective: "Ensure data used in AI systems is high-quality and secure.",
      questions: [
        {
          text: "Is there a formal data governance policy for AI models?",
          type: "yesno",
          weight: 10,
        },
        {
          text: "How would you rate the transparency of your AI data sources?",
          type: "likert",
          weight: 7,
        },
        {
          text: "Are bias mitigation techniques applied to AI training data?",
          type: "yesno",
          weight: 9,
        },
      ],
    },
  ];
  
  export default questions;
  