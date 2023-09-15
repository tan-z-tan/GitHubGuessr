import { NextApiRequest, NextApiResponse } from "next";
import { GameData } from "../../types";
import firestore from "../../utils/firebaseAdmin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.gameId as string;
  if (!gameId) {
    res.status(404).json({ message: "Game not found" });
    return;
  }
  const game = await fetchGame(gameId);
  if (!game) {
    res.status(404).json({ message: "Game not found" });
    return;
  }
  res.status(200).json(game);
};

async function fetchGame(gameId: string): Promise<GameData> {
  const game = await firestore.collection("games").doc(gameId).get();
  if (!game.exists) {
    throw new Error("Game not found");
  }
  return game.data() as GameData;
}
