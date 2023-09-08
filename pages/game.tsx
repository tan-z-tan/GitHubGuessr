import { useState, useEffect, use, useRef } from "react";
import { Answer, QuestionData } from "../types";
import { motion, useAnimation } from "framer-motion";
import Autocomplete from "react-select";

export default function Game() {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [answer, setAnswer] = useState("");
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0); // 現在の質問のインデックス
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
    const answerLog = JSON.parse(localStorage.getItem("answerLog") || "[]");
    if (answerLog.length) {
      setAnswerLog(answerLog);
      setQuestionIndex(answerLog.length);
    }

    fetchQuestion();
  }, [questionIndex]);

  async function fetchQuestion() {
    const response = await fetch("/api/question");
    const data: QuestionData = await response.json();
    snipetControls.start({ scale: [0.1, 1] });
    snipetDragControls.start({ x: 0, y: 0 });
    setCurrentQuestion(data);
    setAnswerable(true);
  }

  useEffect(() => {
    if (currentQuestion) {
      setSecondsRemaining(60);
      const timerId = setInterval(() => {
        setSecondsRemaining((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(timerId);
            checkAnswer();
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-700">
      <div
        className={
          "text-lg w-full md:max-w-lg text-right font-bold mr-4 " +
          (secondsRemaining < 10 ? "text-red-500" : "text-indigo-400")
        }
      >
        {secondsRemaining}s
      </div>
      <h2 className="text-white text-2xl font-bold mb-4">
        What is this repository? {questionIndex + 1}/{gameRound}
      </h2>
      <div className="text-white text-md mb-4">
        <span className="font-bold">
          {currentQuestion?.repository.star_num}
        </span>
        {" stars, "}
        <span className="font-bold">
          {currentQuestion?.repository.fork_num}
        </span>
        {" forks"}
      </div>
      <motion.div
        animate={snipetControls}
        transition={{ ease: "easeInOut", delay: 0.3, duration: 0.5 }}
        style={{
          scale: 0.1,
          boxShadow: "0px 0px 20px 16px rgba(0, 0, 0, 0.4)",
        }}
        className="w-11/12 md:max-w-xl bg-white rounded-full relative overflow-hidden aspect-square"
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
      <Autocomplete
        className="w-80 rounded-full bg-gray-200 px-4 py-0 mt-2 mb-4"
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: "None",
            backgroundColor: "transparent",
            "&:hover": {
              borderColor: "None",
            },
            "&:focus": {
              borderColor: "None",
            },
            "&:active": {
              borderColor: "None",
            },
          }),
        }}
        defaultValue={null}
        onChange={(selected) => {
          if (selected) setAnswer(selected.value);
        }}
        options={currentQuestion?.candidates.map((candidate) => {
          return { value: candidate, label: candidate };
        })}
      />
      <button
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => checkAnswer()}
        disabled={!answerable}
      >
        Guess
      </button>
      <div className="text-white text-lg mt-4 mx-3">
        {answerLog.map((answer, index) => (
          <div key={index} className="mb-2">
            {index + 1}:
            <span
              className={answer.is_correct ? "text-green-500" : "text-red-500"}
            >
              {answer.is_correct ? " Correct! " : " Wrong. "}
            </span>
            <br />
            Correct answer{" "}
            <img
              src={answer.repo_image_url}
              className="w-8 h-8"
              style={{ display: "inline-block" }}
            />
            [{answer.correct_answer}]
            <br />
            Your answer is [{answer.user_answer}]
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
              (answer == currentQuestion?.repository.name
                ? "text-green-500"
                : "text-red-500")
            }
          >
            {currentQuestion?.repository.name == answer
              ? "Correct!🎉"
              : "Oops!😢"}
          </p>
          <p className="text-4xl font-bold leading-none tracking-tight text-gray-200 mb-6 border-b-2 border-gray-200 pb-2">
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
          </p>
          <p className="text-4xl font-bold leading-none tracking-tight text-gray-200 mb-6">
            Your Answer is [{answer}]
          </p>
          <motion.button
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold mt-6 py-2 px-4 rounded-full"
            onClick={goToNextQuestion}
          >
            {questionIndex >= gameRound - 1 ? "Show Result" : "Next Quize"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );

  function checkAnswer() {
    // if (!answer) return; // もし文字がなければ何もしない

    setAnswerable(false);
    const isCorrect = answer === currentQuestion?.repository.name;
    // setCorrectAnswer(isCorrect);
    modalControls.start({ opacity: [0, 1] });
    setShowModal(true);

    // LocalStorageに回答履歴を保存
    const currentLog: Answer = {
      user_id: "dummyUser", // 今回はダミーのユーザーIDを使用
      repo_image_url: currentQuestion?.repository.avatarURL || "",
      repo_url: currentQuestion?.repository.url || "",
      user_answer: answer,
      correct_answer: currentQuestion?.repository.name || "",
      is_correct: isCorrect,
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
    if (questionIndex >= gameRound - 1) {
      // スコアをLocalStorageに保存
      const existingLogs: Answer[] = JSON.parse(
        localStorage.getItem("answerLog") || "[]"
      );
      const correctAnswers = existingLogs.filter(
        (answer) => answer.is_correct
      ).length;
      localStorage.setItem("score", correctAnswers.toString());
      window.location.href = "/result";
    } else {
      setShowModal(false);
      setAnswer("");
      setQuestionIndex(questionIndex + 1);
    }
  }
}
