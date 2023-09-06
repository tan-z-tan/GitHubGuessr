import { NextApiRequest, NextApiResponse } from "next";
import { QuestionData } from "../../types";
import axios from "axios";

const repos = [
  {
    name: "torvalds/linux",
    url: "https://github.com/torvalds/linux",
    lang: "C",
  },
  {
    name: "microsoft/vscode",
    url: "https://github.com/microsoft/vscode",
    lang: "TypeScript",
  },
  {
    name: "facebook/react",
    url: "https://github.com/facebook/react",
    lang: "JavaScript",
  },
  {
    name: "angular/angular",
    url: "https://github.com/angular/angular",
    lang: "TypeScript",
  },
  {
    name: "tensorflow/tensorflow",
    url: "https://github.com/tensorflow/tensorflow",
    lang: "Python",
  },
  {
    name: "kubernetes/kubernetes",
    url: "https://github.com/kubernetes/kubernetes",
    lang: "Go",
  },
  {
    name: "docker/docker-ce",
    url: "https://github.com/docker/docker-ce",
    lang: "Go",
  },
  {
    name: "nodejs/node",
    url: "https://github.com/nodejs/node",
    lang: "JavaScript",
  },
  {
    name: "npm/cli",
    url: "https://github.com/npm/cli",
    lang: "JavaScript",
  },
  {
    name: "yarnpkg/yarn",
    url: "https://github.com/yarnpkg/yarn",
    lang: "JavaScript",
  },
];

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

    // 簡単のため、ファイルの最初の10行をスニペットとして取得
    const snippet = content.split("\n").slice(0, 32).join("\n");

    randomSnipets.push(snippet);
  }
  return randomSnipets;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // ここでランダムにリポジトリを選択して、そのリポジトリの情報を返す
  const randomRepo = repos[Math.floor(Math.random() * repos.length)];
  const repositoryResponse = await fetch(
    `https://api.github.com/repos/${randomRepo.name}`,
    {
      referrerPolicy: "no-referrer",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
  const repositoryJSON = await repositoryResponse.json();
  const starCount = repositoryJSON.stargazers_count;
  const flakCount = repositoryJSON.forks_count;
  const avatarURL = repositoryJSON.owner?.avatar_url;
  const defaultBranch: string = repositoryJSON.default_branch;
  // 実際にgit の中身を取得する
  const snipet: string[] = await getRandomSnipetsFromRepo(
    randomRepo.name.split("/")[0],
    randomRepo.name.split("/")[1],
    defaultBranch,
    randomRepo.lang
  );

  const questionData: QuestionData = {
    repository: {
      id: randomRepo.url,
      org: randomRepo.name.split("/")[0],
      avatarURL: avatarURL,
      name: randomRepo.name,
      url: randomRepo.url,
      lang: randomRepo.lang,
      star_num: starCount,
      folk_num: flakCount,
    },
    codeSnippets: [
      {
        id: 1,
        repository_id: randomRepo.url,
        lang: randomRepo.lang,
        code: snipet[0],
      },
    ],
  };

  res.status(200).json(questionData);
};
