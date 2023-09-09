import { NextApiRequest, NextApiResponse } from "next";
import { QuestionData } from "../../types";
import { githubPopularRepos } from "../../data/repo_with_snippets";
import lodash from "lodash";

const QUIZ_NUM = 12;
export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Pick random repositories from githubPopularRepos
  const randomRepos = lodash.sampleSize(
    githubPopularRepos.filter((repo) => repo.snippets.length > 0),
    QUIZ_NUM
  );
  const targetRepo = randomRepos[0];

  // snippet must be more than 32 characters and shuffled. Return only 5 snippets at most.
  var snippets = targetRepo.snippets.filter((snippet) => snippet.length > 32);
  snippets.sort(() => Math.random() - 0.5);
  snippets = snippets.slice(0, 5);

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
