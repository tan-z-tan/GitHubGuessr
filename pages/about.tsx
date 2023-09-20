import { NextPage } from "next";
import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout title="About GitHub-Guessr">
      <main
        className={"flex flex-col items-center justify-center flex-1 max-w-2xl"}
      >
        <h1
          className={
            "text-4xl font-extrabold leading-none tracking-tight text-gray-600 mb-4"
          }
        >
          About GitHub-Guessr
        </h1>
        <div className={"main text-gray-400 mb-6 px-5"}>
          <h2 className="text-2xl text-gray-600 font-bold my-4 text-center">
            What is GitHub-Guessr?
          </h2>
          <p className="mb-6">
            GitHub-Guessr is a game designed for engineers where the challenge
            is to identify GitHub repositories based on code snippets.
            <br />
            In today&apos;s coding world, we often use many open-source
            libraries without looking at their code. With GitHub-Guessr, you can
            play a game to learn how popular libraries are made and which
            languages they use. Ity&apos;s also a fun way to test your skills.
          </p>
          <h2 className="text-2xl text-gray-600 font-bold my-4 text-center">
            How to play
          </h2>
          <p className="mb-6">
            The game is simple. You will be presented with a code snippet from a
            random popular GitHub repository. Your task is to guess the
            repository from the code. There are 10 rounds in a game. For each
            round you need to select the correct repository within 60 seconds.
            <br />
            You can guess by programming language, what the code does, or any
            information you can get from the code. The final score is calculated
            based on the number of correct answers and the time remaining.
          </p>
          <h2 className="text-2xl text-gray-600 font-bold my-4 text-center">
            Contact and Feedback
          </h2>
          <p className="mb-6">
            If you have any suggestions or comments regarding the game, they are
            very welcome.
            <br />
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfk8ny1V01X3CZkfOZBjO28tpj866M___QjBtQLSAAXSgBnGA/viewform?usp=sf_link"
              className="text-indigo-500 hover:text-indigo-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact form
            </a>
          </p>
          <p>Wishing you a delightful engineering journey!</p>
          <p className="mt-6">
            GitHub-Guessr is created by{" "}
            <a href="https://twitter.com/tan_z_tan">@tan_z_tan</a>.
          </p>
        </div>
      </main>
    </Layout>
  );
}
