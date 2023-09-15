import { NextApiRequest, NextApiResponse } from "next";
import firestore from "../../utils/firebaseAdmin";
import { GameData } from "../../types";

type UserAnswer = {
  user_id: string;
  game_id: string;
  user_answer: string;
  round: number;
  correct_answer: string;
  time_remaining: number;
  is_correct: boolean;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { user_id, game_id, user_answer, time_remaining } = req.body;
  const game = await fetchGame(game_id);
  if (!game) {
    res.status(404).json({ message: "Game not found" });
    return;
  }
  const round = game.rounds.length - 1; // starts from 0
  const correctRepo = game.rounds[round].repoName;

  const isCorrect = user_answer === correctRepo;
  const answer: UserAnswer = {
    user_id: user_id,
    game_id: game_id,
    user_answer: user_answer,
    round: round,
    correct_answer: correctRepo,
    time_remaining: time_remaining,
    is_correct: isCorrect,
  };
  await storeAnswer(answer);

  game.rounds[round].userAnswer = user_answer;
  game.rounds[round].timeRemaining = time_remaining;
  game.rounds[round].isCorrect = isCorrect;

  if (isCorrect) {
    game.correct_num++;
    game.correct_rate = game.correct_num / game.roundNum;
    game.score += 100 + time_remaining;
  }

  if (game.rounds.length >= game.roundNum) {
    game.finished_at = new Date();
  }
  await updateGame(game_id, game);

  res.status(200).json({
    isCorrect: isCorrect,
    finished: game.finished_at ? true : false,
  });
};

async function storeAnswer(answer: UserAnswer) {
  firestore.collection("answers").add(answer);
}

async function fetchGame(gameId: string): Promise<GameData> {
  const game = await firestore.collection("games").doc(gameId).get();
  if (!game.exists) {
    throw new Error("Game not found");
  }
  return game.data() as GameData;
}

async function updateGame(gameId: string, game: any) {
  await firestore.collection("games").doc(gameId).set(game);
}
