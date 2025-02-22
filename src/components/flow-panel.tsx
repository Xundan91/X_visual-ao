import { useGlobalState } from "@/hooks/useGlobalStore"
import { Panel } from "@xyflow/react"
import { ConnectButton } from "arweave-wallet-kit"

export default function FlowPanel() {
    const { activeNode } = useGlobalState()

    if (!activeNode) return null

    return <Panel position="top-center" className="bg-white rounded-md p-1 px-4 border flex items-center justify-center gap-2">
        {activeNode?.id}
    </Panel>
}