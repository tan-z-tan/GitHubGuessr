export type Repository = {
  updatedAt: Date;
  org: string;
  avatarURL: string;
  name: string;
  url: string;
  lang: string;
  desc: string;
  star_num: number;
  fork_num: number;
  snippets: string[];
};

export type Theme = {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
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
  time_remaining: number;
  correct_answer: string;
  repo_image_url: string;
  repo_url: string;
  is_correct: boolean;
};

export type GameData = {
  id: string;
  username: string;
  theme: string;
  roundNum: number;
  rounds: {
    repoName: string;
    userAnswer: string | null;
    timeRemaining: number;
    isCorrect: boolean;
  }[];
  correct_num: number;
  correct_rate: number;
  score: number;
  finished_at: Date | null;
};
