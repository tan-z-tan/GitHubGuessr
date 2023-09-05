import type { NextPage } from "next";
import Link from 'next/link';
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";

const Home: NextPage = () => {
  const [history, setHistory] = useState([]); // ゲームの履歴を保持

  function startGame() {
    // ゲームを開始するロジック
    // 例: ラウンドデータを作成し、ゲーム画面へ遷移
    window.location.href = "/game";
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>GitHub-Guessr</title>
        <meta name="description" content="Guess GitHub repositories by codes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>GitHub-Guessr</h1>
        <button onClick={() => startGame()}>Start Game</button>
        {history.length > 0 && ( /* 履歴があれば表示 */
          <div>
            <h2>履歴</h2>
            {history.map((game, index) => (
              <div key={index}>{/* game の詳細を表示 */}</div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
