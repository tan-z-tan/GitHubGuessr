import { Analytics } from "../components/analytics";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
