import { ImageResponse } from "next/server";
import { GameData } from "../../types";
import { NextRequest } from "next/server";
import { sys } from "typescript";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  if (!gameId) {
    return defaultOGImage();
  }
  const game = await fetch(
    `${process.env.SERVERHOST}/api/game?gameId=${gameId}`
  ).then(async (res) => {
    if (!res.ok) {
      return null;
    }

    if (res.status === 404) {
      return null;
    }
    // GameData
    return (await res.json()) as GameData;
  });
  if (!game) {
    return defaultOGImage();
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundImage:
            "radial-gradient(circle at top left, #8720f3, transparent), radial-gradient(circle at bottom, #288, transparent), radial-gradient(circle at top right, #40a5ff, transparent)",
          justifyContent: "center",
          alignItems: "center",
          padding: "42px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            backgroundColor: "#fff",
            justifyContent: "space-between",
            borderRadius: "16px",
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={`${process.env.SERVERHOST}/logo.png`}
            style={{ width: "36%" }}
          />
          <p
            style={{
              fontSize: 60,
              fontWeight: "normal",
              textAlign: "center",
              width: "100%",
              // margin: "0 auto",
            }}
          >
            <span
              style={{
                color: "#9060fe",
                fontWeight: "bold",
                fontSize: 64,
                paddingRight: 28,
              }}
            >
              {game.username}
            </span>
            <span style={{ paddingRight: 28 }}>
              guessed {game.correct_num} repos correctly!😍
            </span>
          </p>
          <p
            style={{
              fontSize: 60,
              fontWeight: 700,
              textAlign: "right",
              width: "100%",
              margin: "0 auto",
            }}
          >
            Score: {game.score}
          </p>
          <p style={{ fontSize: 28, textAlign: "right", float: "right" }}>
            https://github-guessr.vercel.app
          </p>
        </div>
      </div>
    )
  );
}

function defaultOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundImage:
            "radial-gradient(circle at top left, #8720f3, transparent), radial-gradient(circle at bottom, #288, transparent), radial-gradient(circle at top right, #40a5ff, transparent)",
          color: "#444",
          justifyContent: "center",
          alignItems: "center",
          padding: "42px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            backgroundColor: "white",
            justifyContent: "space-between",
            borderRadius: "16px",
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={`${process.env.SERVERHOST}/logo.png`}
            style={{ width: "50%" }}
          />
          <p
            style={{
              fontSize: 60,
              fontWeight: "normal",
              textAlign: "center",
              width: "100%",
              margin: "0 auto",
            }}
          >
            Can you guess the GitHub repository from the code?
          </p>
          <p style={{ fontSize: 28, textAlign: "right", float: "right" }}>
            https://github-guessr.vercel.app
          </p>
        </div>
      </div>
    )
  );
}
