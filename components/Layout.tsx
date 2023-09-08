import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

export default function Layout({
  children,
  className,
  title,
  description,
}: PropsWithChildren<{
  className?: string;
  title?: string;
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
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isTopPage ? "website" : "website"} />
        <meta property="og:site_name" content={title || "GitHub-Guessr"} />
        <meta property="og:description" content={desc} />
        <meta httpEquiv="content-language" content={"en"} />
      </Head>
      {children}
      <footer className="flex items-center justify-center w-full h-12 border-t text-gray-500 mt-6">
        <a className="flex items-center justify-center font-extrabold" href="/">
          <span className="text-xl tracking-tight">GitHub-Guessr</span>
        </a>
        <a className="flex items-center justify-center">
          <span className="text-xl tracking-tight">@tan-z-tan</span>
        </a>
      </footer>
    </motion.div>
  );
}
