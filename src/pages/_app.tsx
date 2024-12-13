import "@/styles/globals.css";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import type { AppProps } from "next/app";
import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"



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
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel maxSize={30} minSize={15} defaultSize={20}>
          <LeftSidebar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <Component {...pageProps} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="z-20 absolute right-0">
        <RightSidebar />
      </div>
    </div>
    <Toaster />
  </ArweaveWalletKit>
}
