import fs from "fs";
import axios from "axios";
import { Repository } from "../types";
import { githubPopularRepos } from "../data/github_repos";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import firestore from "../utils/firebaseAdmin";

dotenv.config(); // .envの内容をprocess.envに反映

const EXT_BY_LANG: { [key: string]: string } = {
  TypeScript: ".ts",
  JavaScript: ".js",
  Python: ".py",
  Go: ".go",
  C: ".c",
  D: ".d",
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
const MAX_LINE = 32;

async function selectRandomSnippet(repoName: string, files: any[]) {
  for (let i = 0; i < SNIPPETS; i++) {
    // retry 5 times
    for (let retry = 0; retry < 5; retry++) {
      const randomIndex = Math.floor(Math.random() * files.length);
      const f = files[randomIndex];

      if (!f) {
        continue;
      }
      // timeout 10s
      const response = await axios.get(
        `${GITHUB_API_URL}/repos/${repoName}/contents/${f.path}`,
        {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
          timeout: 10000,
        }
      );
      // Base64デコードして内容を取得
      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );
      // if there is no alphabet character, retry
      if (!content.match(/[a-z]/)) {
        console.log("a to z character found");
        continue;
      }

      // if snippet contains repository name, retry
      if (content.includes(repoName)) {
        console.log("repository name found");
        continue;
      }

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
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        timeout: 10000,
      },
    }
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

async function upsertRepository(repository: Repository) {
  const repoId = repository.name.replace("/", "-");
  const docRef = firestore.collection("repositories").doc(repoId);
  const doc = await docRef.get();
  if (doc.exists) {
    await docRef.update(repository);
  } else {
    await docRef.set(repository);
  }
}

async function fetchRepository(
  repoName: string
): Promise<Repository | undefined> {
  const repoId = repoName.replace("/", "-");
  const docRef = firestore.collection("repositories").doc(repoId);
  const doc = await docRef.get();
  if (doc.exists) {
    const data = doc.data();
    if (!data) {
      return undefined;
    }
    const updatedAt = data.updatedAt.toDate();
    return {
      ...data,
      updatedAt: updatedAt,
    } as Repository;
  } else {
    return undefined;
  }
}

async function fetchSnippetsForRepos() {
  const output: Repository[] = [];

  for (const repoMeta of githubPopularRepos) {
    // fetch repo information
    console.log(`fetching ${repoMeta.name}`);
    const repoDoc = await fetchRepository(repoMeta.name);
    if (
      repoDoc &&
      repoDoc.updatedAt.getTime() > new Date().getTime() - 1000 * 60 * 60 * 12
    ) {
      console.log("skip");
      output.push(repoDoc);
      continue;
    }

    const repositoryResponse = await fetch(
      `https://api.github.com/repos/${repoMeta.name}`,
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
    const lang = repoMeta.lang;
    const snippets = await getRandomSnippetsFromRepo(
      repoMeta.name,
      defaultBranch,
      lang.split(",").map((l) => l.trim())
    );
    const repo: Repository = {
      org: repoMeta.name.split("/")[0],
      updatedAt: new Date(),
      avatarURL: avatarURL,
      name: repoMeta.name,
      url: githubURL,
      lang: lang,
      desc: repoMeta.desc,
      star_num: starCount,
      fork_num: flakCount,
      snippets: snippets,
    };
    output.push(repo);
    await upsertRepository(repo);
  }

  // write to file
  fs.writeFileSync(
    "./data/repo_with_snippets.ts",
    `export const githubPopularRepos = ${JSON.stringify(output, null, 2)}`
  );
}

// 関数を呼び出して結果を出力
fetchSnippetsForRepos();
