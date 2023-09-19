import { GameData } from "../../../types";
import { motion } from "framer-motion";
import Layout from "../../../components/Layout";
import React from "react";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";

export default function Result({ game }: { game: GameData | null }) {
  function shareResult() {
    const url = `https://github-guessr.vercel.app/games/${game?.id}`;
    const text = `My 😺GitHub-Guessr😺 score is ${game?.score}!\n`;
    const hashtags = "GitHubGuessr";
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const encodedHashtags = encodeURIComponent(hashtags);
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}&hashtags=${encodedHashtags}`;
    window.open(shareUrl, "_blank");
  }

  if (game === null) {
    return (
      <Layout>
        <h1 className="text-3xl font-bold mb-4">No result found 🧐</h1>
        <h2 className="text-4xl font-extrabold leading-none tracking-tight text-gray-600 mt-6 mb-4">
          GitHub-Guessr
        </h2>
        <motion.button
          className="bg-white border border-indigo-500
        hover:text-indigo-400 text-indigo-500 font-bold py-2 px-4 rounded-full mt-4"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={() => (window.location.href = "/")}
        >
          Go to Top
        </motion.button>
      </Layout>
    );
  }
  const hitNum = game.correct_num;
  const score = game.score;
  const scoreBin = Math.ceil((hitNum / game.rounds.length) * 10) / 10;
  const data = [
    {
      name: "0",
      ratio: 0.01131221719,
      color: "gray",
    },
    {
      name: "0.1",
      ratio: 0.03846153846,
      color: "gray",
    },
    {
      name: "0.2",
      ratio: 0.04740406321,
      color: "gray",
    },
    {
      name: "0.3",
      ratio: 0.06334841629,
      color: "gray",
    },
    {
      name: "0.4",
      ratio: 0.1199095023,
      color: "gray",
    },
    {
      name: "0.5",
      ratio: 0.1719457014,
      color: "gray",
    },
    {
      name: "0.6",
      ratio: 0.149321267,
      color: "gray",
    },
    {
      name: "0.7",
      ratio: 0.1606334842,
      color: "gray",
    },
    {
      name: "0.8",
      ratio: 0.1199095023,
      color: "gray",
    },
    {
      name: "0.9",
      ratio: 0.07239819005,
      color: "gray",
    },
    {
      name: "1.0",
      ratio: 0.04524886878,
      color: "gray",
    },
  ];

  return (
    <Layout
      ogImageUrl={`${process.env.SERVERHOST}/api/og?gameId=${game.id}`}
      title={`${game.username}'s GitHub-Guessr score is ${score}!`}
    >
      <main className={"flex flex-col items-center justify-center flex-1 px-2"}>
        <h1 className="text-3xl font-bold mb-4 text-center">
          Player{" "}
          <span className="font-bold text-indigo-500">
            {game.username}
            {"'s"}
          </span>
          <br />
          GitHub-Guessr score is{" "}
          <span className="text-indigo-500 text-2xl">
            <span className="font-extrabold text-4xl">
              {" " + score}
              {score > 1000
                ? "🎉🎉🎉"
                : score >= 700
                ? "🎉"
                : score >= 400
                ? "🙂"
                : "😢"}
            </span>
          </span>
        </h1>
        <div className="text-gray-500 w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart width={150} height={40} data={data}>
              <Bar dataKey="ratio">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      parseFloat(entry.name) <= scoreBin ? "#8884d8" : "#bbb"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-gray-700 mt-2 text-lg">
          You guessed {hitNum} repositories correctly!
        </p>
        <table className="table-auto border-collapse border border-indigo-500 my-6 break-words">
          <thead className="text-gray-500">
            <tr>
              <th className="border border-indigo-500 px-2 py-1"></th>
              <th className="border border-indigo-500 px-2 py-1">
                Your Answer
              </th>
              <th className="border border-indigo-500 px-2 py-1">Answer</th>
              <th className="border border-indigo-500 px-2 py-1">Result</th>
            </tr>
          </thead>
          <tbody>
            {game.rounds.map((round, index) => (
              <tr key={index}>
                <td className="border border-indigo-500 px-2 py-1">
                  {index + 1}
                </td>
                <td className="border border-indigo-500 px-2 py-1">
                  <a
                    href={`https://github.com/${round.userAnswer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {round.userAnswer?.replace("/", "/ ")}
                  </a>
                </td>
                <td className="border border-indigo-500 px-2 py-1">
                  <a
                    href={`https://github.com/${round.repoName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {round.repoName.replace("/", "/ ")}
                  </a>
                </td>
                <td
                  className={
                    "border border-indigo-500 px-2 py-1" +
                    (round.isCorrect ? " text-green-500" : " text-red-500")
                  }
                >
                  {round.isCorrect ? "Correct" : "Wrong"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <motion.button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mt-4"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={shareResult}
        >
          Share your score
        </motion.button>
        <motion.button
          className="bg-white border border-indigo-500
        hover:text-indigo-400 text-indigo-500 font-bold py-2 px-4 rounded-full mt-4"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={() => (window.location.href = "/")}
        >
          Go to Top
        </motion.button>
      </main>
    </Layout>
  );
}

export const getServerSideProps = async (context: any) => {
  const gameId = context.params.gameId;
  const protocol = context.req.headers['x-forwarded-proto'] || 'http';
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  if (!gameId) {
    return {
      props: {
        gameId: null,
      },
    };
  }

  const game: GameData = await fetch(`${baseUrl}/api/game?gameId=${gameId}`).then(
    async (res) => {
      if (!res.ok) {
        return null;
      }
      if (res.status === 404) {
        return null;
      }
      const game = await res.json();
      return game;
    }
  );

  return {
    props: {
      game: game,
    },
  };
};
