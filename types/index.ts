export type Repository = {
  id: string; // URL を ID として使うことが一般的なので、string 型としています
  org: string;
  avatarURL: string;
  name: string;
  url: string;
  lang: string;
  star_num: number;
  fork_num: number;
  snippets: string[];
};

export type Theme = {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard"; // 難易度は列挙型で管理すると便利です
};

export type ThemeRepository = {
  theme_id: number;
  repository_id: string;
};

export type QuestionData = {
  repository: Repository;
  candidates: string[];
};

export type Answer = {
  user_id: string;
  user_answer: string;
  correct_answer: string;
  repo_image_url: string;
  repo_url: string;
  is_correct: boolean;
};

export type Round = {
  id: number;
  currentQuestionIndex: number; // 現在の質問のインデックス
  answers: Array<{
    // 回答のログ。どのリポジトリに何と回答したかを保持
    repository_id: string;
    answer: boolean; // true: correct, false: wrong
  }>;
};

export type User = {
  id: string; // ユニークなユーザID
  nickname: string;
  currentRoundId?: number; // 現在進行中のラウンド。存在しない場合は未参加とみなす
};
