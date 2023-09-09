import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Answer } from "../types";
import Layout from "../components/Layout";
import { v4 as uuidv4 } from "uuid";

const Home: NextPage = () => {
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);

  useEffect(() => {
    const answerLog = JSON.parse(localStorage.getItem("answerLog") || "[]");
    if (answerLog.length) {
      setAnswerLog(answerLog);
    }
  }, []);

  function startGame() {
    // ゲーム開始時にanswerLogをリセット
    localStorage.removeItem("answerLog");
    const randomId = uuidv4();
    localStorage.setItem("game_id", randomId);
    window.location.href = "/game";
  }

  return (
    <Layout>
      <main className={"flex flex-col items-center justify-center flex-1"}>
        <h1
          className={
            "text-4xl font-extrabold leading-none tracking-tight text-gray-600 mb-4"
          }
        >
          GitHub-Guessr
        </h1>
        <p className={"text-gray-400 mb-6 px-5"}>
          Can you guess the GitHub repository from the code?
        </p>
        <motion.button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={() => startGame()}
        >
          Start Game
        </motion.button>
        {answerLog.length > 0 /* 履歴があれば表示 */ && (
          <div>
            <h2 className="text-black font-bold text-lg mt-12 mb-3 mx-3">Your previous score</h2>
            {answerLog.map((answer, index) => (
              <div key={index} className="mb-2 text-left">
                {index + 1}:
                <span
                  className={
                    answer.is_correct ? "text-green-500" : "text-red-500"
                  }
                >
                  {answer.is_correct ? " Correct! " : " Wrong. "}
                </span>
                <img
                  src={answer.repo_image_url}
                  className="w-6 h-6"
                  style={{ display: "inline-block" }}
                />
                [{answer.correct_answer}]
                  </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default Home;
