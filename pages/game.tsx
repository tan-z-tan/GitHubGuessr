import { useState, useEffect } from "react";
import { Answer, QuestionData } from "../types";
import { motion, useAnimation } from "framer-motion";

export default function Game() {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [answer, setAnswer] = useState("");
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0); // 現在の質問のインデックス
  const [showModal, setShowModal] = useState(false); // モーダルの表示フラグ
  const [answerable, setAnswerable] = useState(false); // 回答可能かどうか
  const snipetControls = useAnimation();
  const modalControls = useAnimation();
  const gameRount = 4; // ゲームのラウンド数

  useEffect(() => {
    console.log("useEffect", questionIndex);
    // ゲーム開始時にanswerLogをリセット
    if (questionIndex === 0) {
      localStorage.removeItem("answerLog");
    }

    const answerLog = JSON.parse(localStorage.getItem("answerLog") || "[]");
    if (answerLog.length) setAnswerLog(answerLog);

    fetchQuestion();
  }, [questionIndex]);

  async function fetchQuestion() {
    const response = await fetch("/api/question");
    const data: QuestionData = await response.json();
    snipetControls.start({ scale: [0.1, 1] });
    setCurrentQuestion(data);
    setAnswerable(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-700">
      <h2 className="text-white text-2xl font-bold mb-4">
        What is this repository?
      </h2>
      <motion.div
        animate={snipetControls}
        transition={{ ease: "easeInOut", delay: 0.3, duration: 0.5 }}
        style={{ scale: 0.1 }}
        className="max-w-600 w-5/6 bg-white rounded-full position-relative overflow-hidden aspect-square"
      >
        <div
          className="relative flex justify-center items-center"
          style={{
            background: "white",
            aspectRatio: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <motion.pre drag className="font-mono text-sm">
            {currentQuestion?.codeSnippets[0]?.code}
          </motion.pre>
        </div>
      </motion.div>
      <input
        type="text"
        value={answer}
        disabled={!answerable}
        onChange={(e) => setAnswer(e.target.value)}
        // enterキーで回答
        onKeyDown={(e) => {
          if (e.key === "Enter") checkAnswer();
        }}
        placeholder="リポジトリ名を入力"
        className="bg-gray-200 rounded-full px-4 py-2 mt-4 w-80 text-center mb-4"
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
            Your answer was "{answer.user_answer}"
            <br />
            Correct answer{" "}
            <img
              src={answer.repo_image_url}
              className="w-8 h-8"
              style={{ display: "inline-block" }}
            />
            "{answer.correct_answer}"
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
              ? "You win!🎉"
              : "You lose😢"}
          </p>
          <p className="text-4xl font-bold leading-none tracking-tight text-gray-200 mb-6">
            Your Answer: "{answer}"
          </p>
          <p className="text-4xl font-bold leading-none tracking-tight text-gray-200 mb-6">
            Correct Answer:
            <img
              src={currentQuestion?.repository.avatarURL}
              className="w-10 h-10"
              style={{ display: "inline-block" }}
            />
            "{currentQuestion?.repository.name}"
          </p>
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={goToNextQuestion}
          >
            {questionIndex === gameRount - 1 ? "Show Result" : "Next Question"}
          </button>
        </motion.div>
      )}
    </div>
  );

  function checkAnswer() {
    if (!answer) return; // もし文字がなければ何もしない

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
    if (questionIndex === gameRount - 1) {
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
