import { NextApiRequest, NextApiResponse } from "next";
import { QuestionData } from "../../types";
import { githubPopularRepos } from "../../data/repo_with_snippets";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // ここでランダムにリポジトリを選択して、そのリポジトリの情報を返す
  const randomRepo =
    githubPopularRepos[Math.floor(Math.random() * githubPopularRepos.length)];

  // snippet must be more than 32 characters and shuffled. Return only 5 snippets at most.
  var snippets = randomRepo.snippets.filter((snippet) => snippet.length > 32);
  snippets.sort(() => Math.random() - 0.5);
  snippets = snippets.slice(0, 5);

  const questionData: QuestionData = {
    repository: {
      org: randomRepo.org,      
      updatedAt: new Date(),  // we don't use updatedAt for now
      avatarURL: randomRepo.avatarURL,
      name: randomRepo.name,
      url: randomRepo.url,
      lang: randomRepo.lang,
      desc: randomRepo.desc,
      star_num: randomRepo.star_num,
      fork_num: randomRepo.fork_num,
      snippets: snippets,
    },
    candidates: githubPopularRepos.map((repo) => repo.name),
  };

  res.status(200).json(questionData);
};
