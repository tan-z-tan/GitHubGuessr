import fs from "fs";
import axios from "axios";
import { Repository } from "../types";
import { githubPopularRepos } from "../data/github_repos";
import dotenv from "dotenv";

dotenv.config(); // .envの内容をprocess.envに反映

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
const SNIPPETS = 10;
const MAX_LINE = 64;

async function selectRandomSnippet(repoName: string, files: any[]) {
  // 基準を満たすファイルが見つからない場合は10回までリトライ
  for (let retry = 0; retry < 10; retry++) {
    const randomIndex = Math.floor(Math.random() * files.length);
    const f = files[randomIndex];

    if (!f) {
      continue;
    }
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${repoName}/contents/${f.path}`,
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
    );
    // Base64デコードして内容を取得
    const content = Buffer.from(response.data.content, "base64").toString(
      "utf-8"
    );
    const lines = content.split("\n");
    // line が10行未満の場合はリトライ
    if (lines.length < 10) {
      continue;
    }

    // ファイルのランダムな部分を取得
    const randomStart = Math.floor(Math.random() * (lines.length - MAX_LINE));
    const snippet = content
      .split("\n")
      .slice(randomStart, randomStart + MAX_LINE)
      .join("\n");
    return snippet;
  }
  return undefined;
}

async function getRandomSnippetsFromRepo(
  repoName: string,
  defaultBranch: string,
  langs: string[]
): Promise<string[]> {
  console.log(
    `${GITHUB_API_URL}/repos/${repoName}/git/trees/${defaultBranch}?recursive=1`
  );
  console.log("langs", langs);
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${repoName}/git/trees/${defaultBranch}?recursive=1`,
    // githun access token
    { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
  );
  const tree = response.data.tree;
  const fileExts = langs.map((lang) => EXT_BY_LANG[lang]).filter((ext) => ext);
  const files = tree.filter(
    (item: any) =>
      item.type === "blob" && fileExts.some((ext) => item.path.endsWith(ext))
  );

  const randomSnippets: string[] = [];
  for (let i = 0; i < SNIPPETS; i++) {
    const snippet = await selectRandomSnippet(repoName, files);
    if (!snippet) {
      continue;
    }
    randomSnippets.push(snippet);
  }
  return randomSnippets;
}

async function fetchSnippetsForRepos() {
  const output: Repository[] = [];

  for (const repo of githubPopularRepos) {
    // fetch repo information
    const repositoryResponse = await fetch(
      `https://api.github.com/repos/${repo.name}`,
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
    const githubURL = repositoryJSON.html_url;
    const defaultBranch: string = repositoryJSON.default_branch;
    const lang = repo.lang;
    const snippets = await getRandomSnippetsFromRepo(
      repo.name,
      defaultBranch,
      lang.split(",").map((l) => l.trim())
    );
    output.push({
      id: repo.name,
      org: repo.name.split("/")[0],
      avatarURL: avatarURL,
      name: repo.name,
      url: githubURL,
      lang: repo.lang,
      desc: repo.desc,
      star_num: starCount,
      fork_num: flakCount,
      snippets: snippets,
    });
  }

  // Typescript形式で保存。このデータを pages/api/question.tsで利用する。
  fs.writeFileSync(
    "./data/repo_with_snippets.ts",
    "export const githubPopularRepos = " + JSON.stringify(output, null, 2) + ";"
  );
  console.log(JSON.stringify(output, null, 2));
}

// 関数を呼び出して結果を出力
fetchSnippetsForRepos();
