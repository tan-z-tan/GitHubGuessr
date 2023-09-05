import { useEffect, useState } from "react";
import { Answer } from "../types";

// type AnswerLog = {
//   answer: string;
//   isCorrect: boolean;
// };

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
    <div>
      <h1>
        結果: {score}/{answerLog.length}
      </h1>
      <ul>
        {answerLog.map((answer, index) => (
          <li key={index}>
            <p>
              Question {index + 1}: Your answer - {answer.user_answer}, Correct answer - {answer.correct_answer}
            </p>
            <p>{answer.is_correct ? "Correct!" : "Wrong"}</p>
          </li>
        ))}
      </ul>
      <button onClick={() => (window.location.href = "/")}>
        メイン画面へ戻る
      </button>
      <button onClick={() => (window.location.href = "/game")}>
        もう一度チャレンジする
      </button>
    </div>
  );
}
