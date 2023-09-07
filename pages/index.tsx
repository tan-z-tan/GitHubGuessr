import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Answer } from "../types";

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
    window.location.href = "/game";
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen py-2"
      initial="initial"
      animate="in"
      variants={{
        initial: {
          opacity: 0,
        },
        in: {
          opacity: 1,
        },
      }}
      transition={{
        type: "tween",
        duration: 0.8,
      }}
    >
      <Head>
        <title>GitHub-Guessr</title>
        <meta name="description" content="Guess GitHub repositories by codes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className={
          "flex flex-col items-center justify-center w-full flex-1 px-10 text-center"
        }
      >
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
                "{answer.correct_answer}"
                  </div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default Home;
