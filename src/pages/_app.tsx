import "@/styles/globals.css";
import 'intro.js/introjs.css';
import { ArweaveWalletKit } from "arweave-wallet-kit";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/sonner";
import { Steps, Step } from 'intro.js-react';
import { useEffect, useState } from "react";
import * as introJs from "intro.js"
import { onChange, refresh, steps, tutorial } from "@/tutorial";


export default function App({ Component, pageProps }: AppProps) {
  const [enabled, setEnabled] = useState(false)

  // useEffect(() => {
  //   (async () => {
  //     await new Promise(resolve => setTimeout(resolve, 3000))
  //     const tutorialDone = localStorage.getItem('tutorialDone')
  //     if (!tutorialDone) {
  //       // yes no prompt withh options
  //       const result = window.confirm('Do you want to see the tutorial?')
  //       if (result) {
  //         setEnabled(true)
  //       }
  //     }
  //   })()
  // }, [])

  return <ArweaveWalletKit
    config={{
      permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION"],
      ensurePermissions: true,
    }}
    theme={{
      displayTheme: "light",
      radius: "minimal",
      // nord
      accent: {
        r: 46,
        g: 52,
        b: 64
      }
    }}
  >
    <Steps
      enabled={enabled}
      steps={steps}
      initialStep={0}
      onChange={onChange}
      onAfterChange={refresh}
      onExit={() => { console.log('onExit') }}
      options={{
        showBullets: false,
        showProgress: false,
        showStepNumbers: false,
        exitOnOverlayClick: false,
        exitOnEsc: false,
      }}
    />
    <Component {...pageProps} />
    <Toaster />
  </ArweaveWalletKit>
}
