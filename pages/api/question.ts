import { NextApiRequest, NextApiResponse } from "next";
import { QuestionData } from "../../types";
import axios from "axios";
import { githubPopularRepos } from "../../data/repo_with_snippets";

const EXT_BY_LANG: { [key: string]: string } = {
  TypeScript: ".ts",
  JavaScript: ".js",
  Python: ".py",
  Go: ".go",
  C: ".c",
  "C++": ".cpp",
  Java: ".java",
  Ruby: ".rb",
  PHP: ".php",
  Rust: ".rs",
  Swift: ".swift",
  Kotlin: ".kt",
  Scala: ".scala",
  Perl: ".pl",
  Haskell: ".hs",
  Clojure: ".clj",
  Elixir: ".ex",
  Erlang: ".erl",
  Dart: ".dart",
  Crystal: ".cr",
  Julia: ".jl",
  Lua: ".lua",
  OCaml: ".ml",
  R: ".r",
  Scheme: ".scm",
  "Vim script": ".vim",
  Shell: ".sh",
  PowerShell: ".ps1",
  HTML: ".html",
  CSS: ".css",
  SCSS: ".scss",
  Less: ".less",
};
const GITHUB_API_URL = "https://api.github.com";
const SNIPETS = 1;
const MAX_LINE = 64;

async function getRandomSnipetsFromRepo(
  owner: string,
  repo: string,
  defaultBranch: string,
  lang: string
): Promise<string[]> {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    // githun access token
    { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
  );
  const tree = response.data.tree;
  const fileExt = EXT_BY_LANG[lang];
  const files = tree.filter(
    (item: any) => item.type === "blob" && item.path.endsWith(fileExt)
  );

  const randomSnipets: string[] = [];
  for (let i = 0; i < SNIPETS; i++) {
    const randomIndex = Math.floor(Math.random() * files.length);
    const f = files[randomIndex];
    console.log("random file", f);
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${f.path}`,
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
    );
    // Base64デコードして内容を取得
    const content = Buffer.from(response.data.content, "base64").toString(
      "utf-8"
    );

    // ファイルのランダムな部分を取得
    const lines = content.split("\n");
    const randomStart = Math.floor(Math.random() * (lines.length - MAX_LINE));
    const snippet = content
      .split("\n")
      .slice(randomStart, randomStart + MAX_LINE)
      .join("\n");

    randomSnipets.push(snippet);
  }
  return randomSnipets;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // ここでランダムにリポジトリを選択して、そのリポジトリの情報を返す
  const randomRepo =
    githubPopularRepos[Math.floor(Math.random() * githubPopularRepos.length)];

  const questionData: QuestionData = {
    repository: {
      id: randomRepo.name,
      org: randomRepo.org,
      avatarURL: randomRepo.avatarURL,
      name: randomRepo.name,
      url: randomRepo.url,
      lang: randomRepo.lang,
      star_num: randomRepo.star_num,
      fork_num: randomRepo.fork_num,
      snippets: randomRepo.snippets,
    },
    candidates: githubPopularRepos.map((repo) => repo.name),
  };

  res.status(200).json(questionData);
};
