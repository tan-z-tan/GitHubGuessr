import { useEffect, useState } from "react";
import { Answer } from "../types";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { v4 as uuidv4 } from "uuid";
import React from "react";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";
import { round } from "lodash";

export default function Result() {
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const hitNum = answerLog.filter((answer) => answer.is_correct).length;
  const score = answerLog.reduce(
    (sum, answer) =>
      sum + (answer.is_correct ? 100 + (answer.time_remaining || 0) : 0),
    0
  );

  useEffect(() => {
    // LocalStorageからスコアと回答履歴を取得
    const savedScore = localStorage.getItem("score");
    const savedLog = JSON.parse(localStorage.getItem("answerLog") || "[]");

    if (savedLog.length) setAnswerLog(savedLog);
  }, []);

  function startGame() {
    // ゲーム開始時にanswerLogをリセット
    localStorage.removeItem("answerLog");
    const randomId = uuidv4();
    localStorage.setItem("game_id", randomId);
    window.location.href = "/game";
  }

  const scoreBin = Math.ceil(score / 100) / 10;
  console.log(scoreBin);
  const data = [
    {
      name: "0",
      ratio: 0.01131221719,
      color: "gray",
    },
    {
      name: "0.1",
      ratio: 0.03846153846,
      color: "gray",
    },
    {
      name: "0.2",
      ratio: 0.04740406321,
      color: "gray",
    },
    {
      name: "0.3",
      ratio: 0.06334841629,
      color: "gray",
    },
    {
      name: "0.4",
      ratio: 0.1199095023,
      color: "gray",
    },
    {
      name: "0.5",
      ratio: 0.1719457014,
      color: "gray",
    },
    {
      name: "0.6",
      ratio: 0.149321267,
      color: "gray",
    },
    {
      name: "0.7",
      ratio: 0.1606334842,
      color: "gray",
    },
    {
      name: "0.8",
      ratio: 0.1199095023,
      color: "gray",
    },
    {
      name: "0.9",
      ratio: 0.07239819005,
      color: "gray",
    },
    {
      name: "1.0",
      ratio: 0.04524886878,
      color: "gray",
    },
  ];

  if (answerLog.length === 0) {
    return (
      <Layout>
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
      </Layout>
    );
  }
  return (
    <Layout>
      <main className={"flex flex-col items-center justify-center flex-1 px-2"}>
        <h1 className="text-3xl font-bold mb-4 text-center">
          <span className="text-indigo-500 text-2xl">
            Your GitHub-Guessr score is{" "}
            <span className="font-extrabold text-4xl">
              {" " + score}
              {score > 1000
                ? "🎉🎉🎉"
                : score >= 700
                ? "🎉"
                : score >= 400
                ? "🙂"
                : "😢"}
            </span>
          </span>
        </h1>
        <div className="text-gray-500 w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart width={150} height={40} data={data}>
              <Bar dataKey="ratio">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      parseFloat(entry.name) <= scoreBin ? "#8884d8" : "gray"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-gray-700 mt-2 text-lg">
          You guessed {hitNum} repositories correctly!
        </p>
        <table className="table-auto border-collapse border border-indigo-500 my-6 break-words">
          <thead className="text-gray-500">
            <tr>
              <th className="border border-indigo-500 px-2 py-1"></th>
              <th className="border border-indigo-500 px-2 py-1">
                Your Answer
              </th>
              <th className="border border-indigo-500 px-2 py-1">Answer</th>
              <th className="border border-indigo-500 px-2 py-1">Result</th>
            </tr>
          </thead>
          <tbody>
            {answerLog.map((answer, index) => (
              <tr key={index}>
                <td className="border border-indigo-500 px-2 py-1">
                  {index + 1}
                </td>
                <td className="border border-indigo-500 px-2 py-1">
                  {answer.user_answer.replace("/", "/ ")}
                </td>
                <td className="border border-indigo-500 px-2 py-1">
                  <a href={answer.repo_url} target="_blank">
                    {answer.correct_answer.replace("/", "/ ")}
                  </a>
                </td>
                <td
                  className={
                    "border border-indigo-500 px-2 py-1" +
                    (answer.is_correct ? " text-green-500" : " text-red-500")
                  }
                >
                  {answer.is_correct ? "Correct" : "Wrong"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </main>
    </Layout>
  );
}
