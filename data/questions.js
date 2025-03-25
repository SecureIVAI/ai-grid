const questions = [
    {
      section: "Policies Related to AI",
      objective: "Ensure AI policies align with organizational goals.",
      tooltipText: "This section is about policies related to AI",
      questions: [
        {
          text: "Does your organization have a documented AI policy?",
          type: "yesno",
          weight: 10,
          followUp: {
            type: "file",
            text: "Please Provide the document."
          }
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
      tooltipText: "This section is about internal organization",
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
      tooltipText: "This section is about risk management",
      questions: [
        {
          text: "Does your organization conduct AI risk assessments?",
          type: "yesno",
          weight: 10,
        },
        {
          text: "How frequently are AI risk assessments conducted?",
          type: "dropdown",
          options: [
            { value: "1", label: "Yearly" },
            { value: "2", label: "Bi-Yearly" },
            { value: "3", label: "Quarterly" },
            { value: "4", label: "Monthly" }
          ],
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
      tooltipText: "This section is about data governance",
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
    {
      section: "AI System Security",
      objective: "Ensure AI systems are secure and resilient against threats.",
      tooltipText: "This section is about AI system security",
      questions: [
        {
          text: "Are AI models tested for vulnerabilities before deployment?",
          type: "yesno",
          weight: 10,
        },
        {
          text: "How often are AI security assessments conducted?",
          type: "dropdown",
          options: [
            { value: "1", label: "Annually" },
            { value: "2", label: "Bi-Annually" },
            { value: "3", label: "Quarterly" },
            { value: "4", label: "Monthly" }
          ],
          weight: 8,
        },
        {
          text: "Does your organization have a response plan for AI-related security breaches?",
          type: "yesno",
          weight: 10,
        },
      ],
    },
    {
      section: "Ethical AI Compliance",
      objective: "Ensure AI systems adhere to ethical guidelines and compliance requirements.",
      tooltipText: "This section is about ethical ai compliance",
      questions: [
        {
          text: "Does your organization have an AI ethics framework?",
          type: "yesno",
          weight: 10,
        },
        {
          text: "Are AI decisions explainable and interpretable?",
          type: "yesno",
          weight: 9,
        },
        {
          text: "Is there an external audit process for AI compliance?",
          type: "yesno",
          weight: 8,
        },
      ],
    },
  ];
  
  export default questions;
  