import { useState, useEffect, useRef } from "react";
import { Answer, GameData, QuestionData } from "../../../types";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/router";

export default function Game() {
  const router = useRouter();
  const { gameId } = router.query;
  const [game, setGame] = useState<GameData | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [_, setAnswer] = useState<string>(""); // this is for re-rendering component
  const answerRef = useRef<string>(""); // this is for checking answer synchronously
  // const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  // const [questionIndex, setQuestionIndex] = useState(0); // 現在の質問のインデックス
  const [snippetIndex, setSnippetIndex] = useState(0); // 現在のスニペットのインデックス
  const [showModal, setShowModal] = useState(false); // モーダルの表示フラグ
  const [answerable, setAnswerable] = useState(false); // 回答可能かどうか
  const [secondsRemaining, setSecondsRemaining] = useState(60); // タイマーの残り時間
  const snipetControls = useAnimation();
  const snipetDragControls = useAnimation();
  const modalControls = useAnimation();
  const gameRound = 10; // ゲームのラウンド数
  const dragParentRef = useRef<HTMLDivElement>(null);
  const dragAreaRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!gameId) return;

    const existUsername = localStorage.getItem("username");
    if (existUsername) {
      setUsername(existUsername);
    } else {
      setUsername("");
    }

    console.log("Fetching game", gameId);
    fetch(`/api/game?gameId=${gameId}`).then(async (res) => {
      if (!res.ok) {
        alert("Failed to fetch game");
        setGame(null);
        return;
      }

      if (res.status === 404) {
        setGame(null);
        return;
      }
      const game = await res.json();
      setGame(game);
      fetchQuestion();
    });
  }, [gameId]);

  async function updateGame() {
    console.log("Updating game", gameId);
    const response = await fetch(`/api/game?gameId=${gameId}`);
    if (!response.ok) {
      return;
    }
    const data: GameData = await response.json();
    setGame(data);
  }

  async function fetchQuestion() {
    console.log("fetching question");
    const response = await fetch(`/api/question?game_id=${gameId}`);
    const data: QuestionData = await response.json();
    snipetControls.start({ scale: [0.1, 1] });
    snipetDragControls.start({ x: 0, y: 0 });
    setCurrentQuestion(data);
    setAnswerable(true);
    updateGame();
  }

  useEffect(() => {
    if (currentQuestion) {
      setSecondsRemaining(60);
      const timerId = setInterval(() => {
        setSecondsRemaining((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(timerId);
            checkAnswer(answerRef.current);
            return 60;
          }
          return prevSeconds - 1;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [currentQuestion]);

  function nextSnippet(dir: number = 1) {
    return () => {
      if (!currentQuestion) return;

      const nextIndex = snippetIndex + dir;
      if (nextIndex < 0) {
        setSnippetIndex(currentQuestion.repository.snippets.length - 1);
      } else if (nextIndex < currentQuestion.repository.snippets.length) {
        setSnippetIndex(nextIndex);
      } else {
        setSnippetIndex(0);
      }
      snipetDragControls.start({ x: 0, y: 0 });
    };
  }

  if (!game) {
    return <></>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-700">
      <h2 className="text-white text-2xl font-bold mb-4">
        What is this repository? {game.rounds.length}/{gameRound}
      </h2>
      <div className="text-white text-md mb-2">
        <span className="font-bold">
          {currentQuestion?.repository.star_num}
        </span>
        {" stars, "}
        <span className="font-bold">
          {currentQuestion?.repository.fork_num}
        </span>
        {" forks"}
      </div>
      <div className="text-white text-md mb-2 text-left text-center">
        {secondsRemaining < 30 && (
          <p className="text-green-500 ml-2">
            Hint:{" "}
            <span className="font-bold">
              {currentQuestion?.repository.lang}
            </span>
          </p>
        )}
        {secondsRemaining < 15 && (
          <p className="text-green-500 ml-2">
            Hint:{" "}
            <img
              src={currentQuestion?.repository.avatarURL}
              className="w-7 h-7 inline-block"
            />
          </p>
        )}
      </div>
      <div className="relative w-full">
        <div className="w-full flex justify-center">
          <div className="absolute w-full mx-auto md:max-w-2xl">
            <div
              className={
                "text-lg text-right font-bold mr-4 " +
                (secondsRemaining < 10 ? "text-red-500" : "text-indigo-400")
              }
              style={{ top: "4%", right: "4%" }}
            >
              {secondsRemaining}s
            </div>
          </div>
        </div>
        <motion.div
          animate={snipetControls}
          transition={{ ease: "easeInOut", delay: 0.3, duration: 0.5 }}
          style={{
            scale: 0.1,
            boxShadow: "0px 0px 20px 16px rgba(0, 0, 0, 0.4)",
          }}
          className="w-5/6 mx-auto md:max-w-xl bg-white rounded-full relative overflow-hidden aspect-square"
        >
          <div
            className="relative flex justify-center items-center"
            ref={dragParentRef}
            style={{
              background: "white",
              aspectRatio: 1,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <motion.pre
              drag
              dragConstraints={dragParentRef}
              animate={snipetDragControls}
              ref={dragAreaRef}
              className="font-mono text-sm"
            >
              {currentQuestion?.repository.snippets[snippetIndex]}
            </motion.pre>
          </div>
        </motion.div>
      </div>
      <div className="relative w-5/6 md:max-w-xl">
        <motion.div
          className="absolute w-8 h-8 text-indigo-400 cursor-pointer text-4xl font-bold"
          whileHover={{ scale: 1.2 }}
          style={{ left: "6%", bottom: "28px" }}
          onClick={nextSnippet(-1)}
        >
          {"←"}
        </motion.div>
      </div>
      {/* 次のSnippetを表示するためのコンポーネント */}
      <div className="relative w-5/6 md:max-w-xl">
        <motion.div
          className="absolute w-8 h-8 text-indigo-400 cursor-pointer text-4xl font-bold"
          whileHover={{ scale: 1.2 }}
          style={{ right: "6%", bottom: "28px" }}
          onClick={nextSnippet()}
        >
          {"→"}
        </motion.div>
      </div>
      {/* 横並びに選択肢を表示する */}
      <h3 className="text-white text-lg mt-4 mx-3">
        Choose the repository you guess
      </h3>
      <div className="mt-1 flex flex-wrap justify-center md:max-w-xl">
        {currentQuestion?.candidates.map((candidate) => (
          <button
            key={candidate}
            className={
              "py-1.5 px-2 rounded-full m-1.5 " +
              (answerRef.current == candidate
                ? "bg-indigo-500 hover:bg-indigo-600 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700")
            }
            onClick={() => {
              setAnswer(candidate);
              answerRef.current = candidate; // ここで答えをrefにも保存
            }}
          >
            {candidate}
          </button>
        ))}
      </div>
      <button
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 ml-2 mt-4 rounded-full"
        onClick={() => checkAnswer(answerRef.current)}
        disabled={!answerable}
      >
        Guess!!
      </button>
      <div className="text-white text-lg mt-4 mx-3">
        {game.rounds.map((round, index) => (
          <div key={index} className="mb-2">
            {index + 1}:
            <span
              className={round.isCorrect ? "text-green-500" : "text-red-500"}
            >
              {round.isCorrect ? " Correct! " : " Wrong. "}
            </span>
            <br />
            Correct answer{" "}
            {/* <img
              src={round.repoName}
              className="w-8 h-8"
              style={{ display: "inline-block" }}
            /> */}
            [{round.repoName}]
            <br />
            Your answer is [{round.userAnswer}]
          </div>
        ))}
      </div>
      {showModal && (
        <motion.div
          animate={modalControls}
          transition={{ duration: 0.5 }}
          className="text-white fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-90 text-center flex flex-col items-center justify-center"
        >
          <p
            className={
              "text-4xl font-extrabold leading-none tracking-tight my-6 " +
              (answerRef.current == currentQuestion?.repository.name
                ? "text-green-500"
                : "text-red-500")
            }
          >
            {currentQuestion?.repository.name == answerRef.current
              ? "Correct!🎉"
              : "Oops!😢"}
          </p>
          <div className="text-4xl font-bold leading-none tracking-tight text-gray-200 mb-6 border-b-2 border-gray-200 pb-2">
            The repository is [
            <img
              src={currentQuestion?.repository.avatarURL}
              className="w-10 h-10"
              style={{ display: "inline-block" }}
            />
            {currentQuestion?.repository.name}]
            <p className="text-gray-300 font-normal text-sm max-w-md mx-auto my-2">
              {currentQuestion?.repository.desc}
            </p>
            <p className="text-gray-300 font-normal text-sm max-w-md mx-auto my-2">
              <a href={currentQuestion?.repository.url} target="_blank">
                {currentQuestion?.repository.url}
              </a>
            </p>
          </div>
          <p className="text-4xl font-bold leading-none tracking-tight text-gray-200 mb-6">
            {answerRef.current
              ? `Your Answer is ${answerRef.current}`
              : "You selected nothing"}
          </p>
          <motion.button
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold mt-6 py-2 px-4 rounded-full"
            onClick={goToNextQuestion}
          >
            {game.finished_at ? "Show Result" : "Next Round"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );

  async function checkAnswer(userAnswer: string) {
    setAnswerable(false);
    const sendRes = await fetch("/api/send_answer", {
      method: "POST",
      body: JSON.stringify({
        user_id: username,
        game_id: gameId,
        user_answer: userAnswer,
        time_remaining: secondsRemaining,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    setShowModal(true);

    const game = await fetch(`/api/game?gameId=${gameId}`).then((res) =>
      res.json()
    );
    setGame(game);

    // LocalStorageに回答履歴を保存
    const currentLog: Answer = {
      user_id: username || "",
      repo_image_url: currentQuestion?.repository.avatarURL || "",
      repo_url: currentQuestion?.repository.url || "",
      user_answer: userAnswer,
      time_remaining: secondsRemaining,
      correct_answer: currentQuestion?.repository.name || "",
      is_correct: sendRes.isCorrect,
    };
    const existingLogs: Answer[] = JSON.parse(
      localStorage.getItem("answerLog") || "[]"
    );
    localStorage.setItem(
      "answerLog",
      JSON.stringify([...existingLogs, currentLog])
    );
  }

  function goToNextQuestion() {
    if (game?.finished_at) {
      // スコアをLocalStorageに保存
      const existingLogs: Answer[] = JSON.parse(
        localStorage.getItem("answerLog") || "[]"
      );
      const correctAnswers = existingLogs.filter(
        (answer) => answer.is_correct
      ).length;
      localStorage.setItem("score", correctAnswers.toString());
      window.location.href = `/games/${gameId}/result`;
    } else {
      setShowModal(false);
      setAnswer("");
      answerRef.current = "";
      fetchQuestion();
    }
  }
}
