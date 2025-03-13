import { ThemeProvider } from "@/components/theme-provider";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Visual AO</title>
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        <body className="antialiased overflow-hidden">
          <Main />
          <NextScript />
        </body>
      </ThemeProvider>
    </Html>
  );
}
