import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { GameData } from "../../types";
import firestore from "../../utils/firebaseAdmin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = uuidv4().replace(/-/g, "");
  const game: GameData = {
    id: gameId,
    username: req.body.username,
    theme: req.body.theme,
    roundNum: req.body.round_num || 10,
    rounds: [],
    correct_num: 0,
    correct_rate: 0,
    score: 0,
    finished_at: null,
  };

  // store game data to firestore
  await storeGame(game);
  res.status(200).json({ game_id: game.id });
};

async function storeGame(game: GameData) {
  await firestore.collection("games").doc(game.id).set(game);
}
