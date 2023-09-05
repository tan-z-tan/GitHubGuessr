import { useState, useEffect } from "react";
import { Answer, QuestionData } from "../types";

export default function Game() {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [answer, setAnswer] = useState("");
  const [answerLog, setAnswerLog] = useState<Answer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0); // 現在の質問のインデックス
  const [showModal, setShowModal] = useState(false); // モーダルの表示フラグ
  const [correctAnswer, setCorrectAnswer] = useState(false); // 回答が正しいかどうか

  useEffect(() => {
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
    setCurrentQuestion(data);
  }

  return (
    <div>
      {/* 最初のスニペットを表示すると仮定 */}
      <div>{currentQuestion?.codeSnippets[0]?.code}</div>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="リポジトリ名を入力"
      />
      <button onClick={() => checkAnswer()}>Guess</button>
      {answerLog.map((answer, index) => (
          <p key={index}>
            {index + 1}: Your answer - {answer.user_answer}, Correct answer - {answer.correct_answer}
            <p>{answer.is_correct ? "Correct!" : "Wrong"}</p>
          </p>
        ))}      
      {showModal && (
        <div>
          <p>Your Answer: {answer}</p>
          <p>Correct Answer: {currentQuestion?.repository.name}</p>
          <p>{correctAnswer ? 'You win!' : 'You lose'}</p>
          <button onClick={goToNextQuestion}>Next Repository</button>
        </div>
      )}
    </div>
  );

  function checkAnswer() {
    if (!answer) return; // もし文字がなければ何もしない

    const isCorrect = answer === currentQuestion?.repository.name;
    setCorrectAnswer(isCorrect);
    setShowModal(true);

    // LocalStorageに回答履歴を保存
    const currentLog: Answer = {
        user_id: "dummyUser",  // 今回はダミーのユーザーIDを使用
        user_answer: answer,
        correct_answer: currentQuestion?.repository.name || "",
        is_correct: isCorrect,
    };
    const existingLogs: Answer[] = JSON.parse(localStorage.getItem("answerLog") || "[]");
    localStorage.setItem("answerLog", JSON.stringify([...existingLogs, currentLog]));
  }

  function goToNextQuestion() {
    if (questionIndex === 3) {
      // スコアをLocalStorageに保存
      const existingLogs: Answer[] = JSON.parse(localStorage.getItem("answerLog") || "[]");
      const correctAnswers = existingLogs.filter(answer => answer.is_correct).length;
      localStorage.setItem("score", correctAnswers.toString());
      window.location.href = "/result";
    } else {
      setShowModal(false);
      setAnswer('');
      setQuestionIndex(questionIndex + 1);
    }
  }
}
