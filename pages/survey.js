import { useState } from "react";
import { useRouter } from "next/router";

const questions = [
  { id: 1, question: "Has your organization implemented any policies related to AI use and management", type: "yesno" },
  { id: 2, question: "Do you have an AI governance framework", type: "yesno" },
  { id: 3, question: "Does your organization have a documented risk management process specifically for AI systems, covering potential risks throughout their life cycle?", type: "yesno" },
];

export default function Survey() {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentIndex].id]: answer };
    setAnswers(newAnswers);

    if (answer === "yes" && currentIndex === 0) {
      setCurrentIndex(currentIndex + 1); // Skip a question if the answer is "yes"
    } else {
      setCurrentIndex(currentIndex + 2);
    }
  };

  if (currentIndex >= questions.length) {
    localStorage.setItem("surveyResults", JSON.stringify(answers));
    router.push("/results");
    return <p>Processing results...</p>;
  }

  return (
    <div className="p-4">
      <h2>{questions[currentIndex].question}</h2>
      {questions[currentIndex].type === "yesno" && (
        <div>
          <button onClick={() => handleAnswer("yes")}>Yes</button>
          <button onClick={() => handleAnswer("no")}>No</button>
        </div>
      )}
      {questions[currentIndex].type === "text" && (
        <input type="text" onBlur={(e) => handleAnswer(e.target.value)} />
      )}
      {questions[currentIndex].type === "number" && (
        <input type="number" onBlur={(e) => handleAnswer(e.target.value)} />
      )}
    </div>
  );
}
