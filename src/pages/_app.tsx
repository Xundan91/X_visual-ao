import "@/styles/globals.css";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/sonner";



export default function App({ Component, pageProps }: AppProps) {

  return <ArweaveWalletKit
    config={{
      permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION"],
      ensurePermissions: true,
    }}
    theme={{
      displayTheme: "light",
      radius: "none"
    }}
  >
    <Component {...pageProps} />
    <Toaster />
  </ArweaveWalletKit>
}
