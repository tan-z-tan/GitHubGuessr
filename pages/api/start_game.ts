import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { GameData, Language } from "../../types"; // Imported Language
import firestore from "../../utils/firebaseAdmin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = uuidv4().replace(/-/g, "");
  const { username, theme, round_num, language } = req.body as { username: string; theme: string; round_num?: number; language?: Language };

  const game: GameData = {
    id: gameId,
    username: username,
    theme: theme,
    roundNum: round_num || 10,
    rounds: [],
    correct_num: 0,
    correct_rate: 0,
    score: 0,
    finished_at: null,
  };

  if (language) {
    game.language = language;
  }

  // store game data to firestore
  await storeGame(game);
  res.status(200).json({ game_id: game.id });
};

async function storeGame(game: GameData) {
  await firestore.collection("games").doc(game.id).set(game);
}
