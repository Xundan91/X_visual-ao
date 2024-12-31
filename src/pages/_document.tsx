import { ThemeProvider } from "@/components/theme-provider";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>VAO</title>
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <body className="antialiased overflow-hidden">
          <Main />
          <NextScript />
        </body>
      </ThemeProvider>
    </Html>
  );
}
