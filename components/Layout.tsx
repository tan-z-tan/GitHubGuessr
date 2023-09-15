import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

export default function Layout({
  children,
  className,
  title,
  ogImageUrl,
  description,
}: PropsWithChildren<{
  className?: string;
  title?: string;
  ogImageUrl?: string;
  description?: string;
}>) {
  const router = useRouter();
  const { locales, defaultLocale, asPath } = router;
  const isTopPage = router.pathname === "/";
  const desc =
    description ||
    "Guess GitHub repositories by codes. GitHubGuessr is a game for geeks. Can you guess the GitHub repository from the code?";

  return (
    <motion.div
      initial="initial"
      animate="in"
      variants={{
        initial: {
          opacity: 0,
        },
        in: {
          opacity: 1,
        },
      }}
      transition={{
        duration: 0.8,
      }}
      className={
        "flex flex-col items-center justify-center min-h-screen py-2 " +
        className
      }
    >
      <Head>
        <title>{title || "GitHub-Guessr"}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={desc} />
        <meta property="og:title" content={title || "GitHub-Guessr"} />
        <meta property="og:type" content={isTopPage ? "website" : "website"} />
        <meta property="og:site_name" content={title || "GitHub-Guessr"} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={ogImageUrl || "/api/og"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta httpEquiv="content-language" content={"en"} />
      </Head>
      {children}
      <footer className="flex items-center justify-center w-full h-12 border-t text-gray-500 text-xl mt-6">
        <span className="font-extrabold">GitHub-Guessr</span>
        <a
          className="ml-3 text-gray-600 hover:text-gray-500"
          href="https://github.com/tan-z-tan/GitHubGuessr"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/github-mark.png"
            className="w-5 h-5 inline-block mr-0.5"
            style={{ marginTop: "-4px" }}
          />
          Code
        </a>
      </footer>
    </motion.div>
  );
}
