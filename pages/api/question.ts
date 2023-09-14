import { NextApiRequest, NextApiResponse } from "next";
import { GameData, QuestionData, Repository } from "../../types";
import { githubPopularRepos } from "../../data/repo_with_snippets";
import lodash from "lodash";
import firestore from "../../utils/firebaseAdmin";

const QUIZ_NUM = 12;
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.game_id as string;
  console.log("gameId", gameId);
  const game = await fetchGame(gameId);
  if (!game) {
    res.status(404).json({ message: "Game not found" });
    return;
  }
  // if (game.finished_at) {
  //   res.status(200).json({ message: "Game finished" });
  //   return;
  // }

  // Pick random repositories from githubPopularRepos
  const allRepos = filterUsedRepos(githubPopularRepos, game.rounds.map((round: any) => round.repository_id));
  const randomRepos: Repository[] = lodash.sampleSize(
    allRepos.filter((repo) => repo.snippets.length > 0),
    QUIZ_NUM
  );
  const targetRepo = randomRepos[0];

  // snippet must be more than 32 characters and shuffled. Return only 5 snippets at most.
  var snippets = targetRepo.snippets.filter((snippet) => snippet.length > 32);
  snippets.sort(() => Math.random() - 0.5);
  snippets = snippets.slice(0, 5);

  game.rounds.push({
    repoName: targetRepo.name,
    userAnswer: "",
    isCorrect: false,
    timeRemaining: -1,
  });
  await updateGame(gameId, game);

  const questionData: QuestionData = {
    repository: {
      org: targetRepo.org,
      updatedAt: new Date(), // we don't use updatedAt for now
      avatarURL: targetRepo.avatarURL,
      name: targetRepo.name,
      url: targetRepo.url,
      lang: targetRepo.lang,
      desc: targetRepo.desc,
      star_num: targetRepo.star_num,
      fork_num: targetRepo.fork_num,
      snippets: snippets,
    },
    candidates: lodash.shuffle(randomRepos).map((repo) => repo.name),
  };

  res.status(200).json(questionData);
};

function filterUsedRepos(
  repos: any[],
  usedRepoNames: string[]
) {
  return repos.filter((repo) => {
    return !usedRepoNames.includes(repo.name);
  });
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
