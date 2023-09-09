import { NextApiRequest, NextApiResponse } from "next";
import firestore from "../../utils/firebaseAdmin";

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
  const {
    user_id,
    game_id,
    user_answer,
    correct_answer,
    round,
    time_remaining,
  } = req.body;
  console.log(req.body);
  const answer: UserAnswer = {
    user_id: user_id,
    game_id: game_id,
    user_answer: user_answer,
    round: round,
    correct_answer: correct_answer,
    time_remaining: time_remaining,
    is_correct: user_answer === correct_answer,
  };

  await storeAnswer(answer);
  res.status(200).json({ message: "success" });
};

async function storeAnswer(answer: UserAnswer) {
  firestore.collection("answers").add(answer);
}
