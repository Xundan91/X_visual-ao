import { ThemeProvider } from "@/components/theme-provider";
import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Visual AO</title>
        <Script type="module" src="https://analytics_arlink.ar.io/browser.js"
          data-process-id="kbKE34Qy2RMHUktFf4hMOoXy9zv1muMg-l3ggHn6jjY"
          data-track-url-hashes="true"
          data-debug="true">
        </Script>
      </Head>

      <body className="antialiased overflow-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
