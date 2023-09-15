import type { NextPage } from "next";
import { Modal, ModalContent } from "@nextui-org/react";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Answer } from "../types";
import Layout from "../components/Layout";

const Home: NextPage = () => {
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const [username, setUsername] = useState<string>("");
  const [theme, setTheme] = useState<string>("all");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const answerLog = JSON.parse(localStorage.getItem("answerLog") || "[]");
    if (answerLog.length) {
      setAnswerLog(answerLog);
    }
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  async function startGame(username?: string) {
    // ゲーム開始時にanswerLogをリセット
    if (username === undefined || username === "") {
      setNameModalOpen(true);
      return;
    }

    const res = await fetch("/api/start_game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, theme }),
    });
    if (!res.ok) {
      alert("Failed to start game");
      return;
    }

    const { game_id } = await res.json();
    localStorage.removeItem("answerLog");
    localStorage.setItem("game_id", game_id);
    window.location.href = `/games/${game_id}`;
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
        <div className={"text-gray-400 mb-6 px-5"}>
          Can you guess the GitHub repository from the code?
          {username.length > 0 && (
            <p className={"text-gray-600 my-4 px-5 text-center"}>
              Hello <span className="font-bold">{username}!</span>
            </p>
          )}
        </div>
        <motion.button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={() => startGame(username)}
        >
          Start Game
        </motion.button>
        {answerLog.length > 0 && (
          <div>
            <h2 className="text-black font-bold text-lg mt-12 mb-3 mx-3">
              Your previous score
            </h2>
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
      <Modal
        isOpen={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        backdrop="opaque"
        radius="sm"
        classNames={{
          base: "text-gray-400 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent className="bg-white rounded-md p-4 border border-gray-100 shadow-lg">
          <>
            <h2 className="text-gray-600 font-bold text-lg mt-12 mb-3 mx-3">
              Please enter your name
            </h2>
            <input
              className="border border-gray-300 rounded-md p-2 mb-4"
              ref={usernameRef}
            />
            <motion.button
              className="bg-indigo-500 hover:bg-indigo-700 text-white w-40 mx-auto font-bold py-2 px-4 rounded-full"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={() => {
                localStorage.setItem(
                  "username",
                  usernameRef.current?.value || ""
                );
                setUsername(usernameRef.current?.value || "");
                setNameModalOpen(false);
                startGame(usernameRef.current?.value || "");
              }}
            >
              Start Game
            </motion.button>
          </>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default Home;
