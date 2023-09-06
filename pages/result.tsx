import { useEffect, useState } from "react";
import { Answer } from "../types";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Result() {
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  useEffect(() => {
    // LocalStorageからスコアと回答履歴を取得
    const savedScore = localStorage.getItem("score");
    const savedLog = JSON.parse(localStorage.getItem("answerLog") || "[]");

    if (savedScore) setScore(parseInt(savedScore, 10));
    if (savedLog.length) setAnswerLog(savedLog);
  }, []);

  function calculateScore(log: Answer[]) {
    const correctAnswers = log.filter((item) => item.is_correct).length;
    setScore(correctAnswers);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-2">
      <h1 className="text-4xl font-bold mb-4">
        Your Score: {score}/{answerLog.length}
      </h1>
      <table className="table-auto border-collapse border border-indigo-500 my-6">
        <thead>
          <tr>
            <th className="border border-indigo-500 px-4 py-2 text-gray-600">
              Round
            </th>
            <th className="border border-indigo-500 px-4 py-2 text-gray-600">
              Your Answer
            </th>
            <th className="border border-indigo-500 px-4 py-2 text-gray-600">
              Correct Answer
            </th>
            <th className="border border-indigo-500 px-4 py-2 text-gray-600">
              Result
            </th>
          </tr>
        </thead>
        <tbody>
          {answerLog.map((answer, index) => (
            <tr key={index}>
              <td className="border border-indigo-500 px-4 py-2">
                {index + 1}
              </td>
              <td className="border border-indigo-500 px-4 py-2">
                {answer.user_answer}
              </td>
              <td className="border border-indigo-500 px-4 py-2">
                <a href={answer.repo_url} target="_blank">
                  {answer.correct_answer}
                </a>
              </td>
              <td
                className={
                  "border border-indigo-500 px-4 py-2" +
                  (answer.is_correct ? " text-green-500" : " text-red-500")
                }
              >
                {answer.is_correct ? "Correct!" : "Wrong"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <motion.button
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mt-4"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onClick={() => (window.location.href = "/game")}
      >
        Play Again
      </motion.button>
      <motion.button
        className="bg-white border border-indigo-500
        hover:text-indigo-400 text-indigo-500 font-bold py-2 px-4 rounded-full mt-4"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onClick={() => (window.location.href = "/")}
      >
        Go to Top
      </motion.button>
    </div>
  );
}
