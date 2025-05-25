import type { NextPage } from "next";
import { Modal, ModalContent } from "@nextui-org/react";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Answer, Language } from "../types"; // Imported Language
import Layout from "../components/Layout";

const languages: Language[] = ['Python', 'Go', 'TypeScript', 'C', 'Java'];

const languageDescriptions: Record<Language, string> = {
  Python: "Guess repositories written primarily in Python.",
  Go: "Guess repositories written primarily in Go.",
  TypeScript: "Guess repositories written primarily in TypeScript.",
  C: "Guess repositories written primarily in C.",
  Java: "Guess repositories written primarily in Java.",
};

const languageIcons: Record<Language, string> = {
  Python: "/icons/python.svg",
  Go: "/icons/go.svg",
  TypeScript: "/icons/typescript.svg",
  C: "/icons/c.svg",
  Java: "/icons/java.svg",
};

const Home: NextPage = () => {
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const [username, setUsername] = useState<string>("");
  // const [theme, setTheme] = useState<string>("all"); // Theme will be determined in startGame
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null); // Added selectedLanguage state
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

  async function startGame(username?: string, language?: Language | null) { // Added language parameter
    if (username === undefined || username === "") {
      setNameModalOpen(true);
      return;
    }

    const currentTheme = language ? language : "all"; // Determine theme based on language

    const requestBody: { username: string; theme: string; language?: Language } = { // Added language to body type
      username,
      theme: currentTheme,
    };

    if (language) {
      requestBody.language = language;
    }

    const res = await fetch("/api/start_game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // Send language in body
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
      <main className={"relative flex flex-col items-center justify-center flex-1"}>
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

        {/* Language Selection UI */}
        <div className="mt-10 w-full max-w-md px-5">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 text-center">
            Or, play in a specific language mode:
          </h2>
          <div className="space-y-4">
            {languages.map((lang) => (
              <div key={lang} className="p-4 border rounded-lg shadow-sm bg-white">
                <div className="flex items-center mb-2">
                  <img src={languageIcons[lang]} alt={`${lang} icon`} className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700">{lang} Mode</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">{languageDescriptions[lang]}</p>
                <motion.button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onClick={() => {
                    setSelectedLanguage(lang); // Set selected language state
                    startGame(username, lang);
                  }}
                >
                  Start {lang} Game
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {answerLog.length > 0 && (
          <div className="mt-12"> {/* Added margin-top for spacing */}
            <h2 className="text-black font-bold text-lg mb-3 mx-3">
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
        <div className="absolute bottom-0 mb-2 text-gray-400">
          <a
            href="about"
            className="text-gray-500 hover:text-gray-600"
          >
            What is GitHub-Guessr?
          </a>
        </div>
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
                const currentUsername = usernameRef.current?.value || "";
                localStorage.setItem(
                  "username",
                  currentUsername
                );
                setUsername(currentUsername);
                setNameModalOpen(false);
                // For the modal, we assume it's a general game start, not language specific
                // Or, we could add language selection to the modal too, but that's out of scope for now.
                startGame(currentUsername);
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
