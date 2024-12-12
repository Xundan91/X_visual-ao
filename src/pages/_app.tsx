import "@/styles/globals.css";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import type { AppProps } from "next/app";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";


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
    <div className="flex">
      <LeftSidebar />
      <Component {...pageProps} />
      <RightSidebar />
    </div>
  </ArweaveWalletKit>
}
