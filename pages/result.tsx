import { useEffect, useState } from "react";
import { Answer } from "../types";
import Link from "next/link";
import { motion } from "framer-motion";
import { start } from "repl";

export default function Result() {
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  //   const [score, setScore] = useState(0);
  const hitNum = answerLog.filter((answer) => answer.is_correct).length;
  useEffect(() => {
    // LocalStorageからスコアと回答履歴を取得
    const savedScore = localStorage.getItem("score");
    const savedLog = JSON.parse(localStorage.getItem("answerLog") || "[]");

    // if (savedScore) setScore(parseInt(savedScore, 10));
    if (savedLog.length) setAnswerLog(savedLog);
  }, []);

  function startGame() {
    // ゲーム開始時にanswerLogをリセット
    localStorage.removeItem("answerLog");
    window.location.href = "/game";
  }
  if (answerLog.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2 px-2 break-words">
        <h1 className="text-3xl font-bold mb-4">No result found 🧐</h1>
        <h2 className="text-4xl font-extrabold leading-none tracking-tight text-gray-600 mt-6 mb-4">
          GitHub-Guessr
        </h2>
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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-2 break-words">
      <h1 className="text-3xl font-bold mb-4">
        <span className="text-indigo-500 font-extrabold text-4xl">
          Score: {" " + Math.round((100 * hitNum) / answerLog.length)}%🎉
        </span>
      </h1>
      <p className="text-gray-700 mb-4 text-lg">
        You guessed {hitNum} repositories correctly!
      </p>
      <table className="table-auto border-collapse border border-indigo-500 my-6 break-words">
        <thead className="text-gray-500">
          <tr>
            <th className="border border-indigo-500 px-4 py-2"></th>
            <th className="border border-indigo-500 px-4 py-2">Your Answer</th>
            <th className="border border-indigo-500 px-4 py-2">Answer</th>
            <th className="border border-indigo-500 px-4 py-2">Result</th>
          </tr>
        </thead>
        <tbody>
          {answerLog.map((answer, index) => (
            <tr key={index}>
              <td className="border border-indigo-500 px-4 py-2">
                {index + 1}
              </td>
              <td className="border border-indigo-500 px-4 py-2">
                {answer.user_answer.replace("/", "/ ")}
              </td>
              <td className="border border-indigo-500 px-4 py-2">
                <a href={answer.repo_url} target="_blank">
                  {answer.correct_answer.replace("/", "/ ")}
                </a>
              </td>
              <td
                className={
                  "border border-indigo-500 px-4 py-2" +
                  (answer.is_correct ? " text-green-500" : " text-red-500")
                }
              >
                {answer.is_correct ? "Correct" : "Wrong"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-4xl font-extrabold leading-none tracking-tight text-gray-600 mt-6 mb-4">
        GitHub-Guessr
      </h2>
      <motion.button
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mt-4"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onClick={startGame}
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
