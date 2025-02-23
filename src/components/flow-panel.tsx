import { useGlobalState } from "@/hooks/useGlobalStore"
import { Panel } from "@xyflow/react"
import { ConnectButton } from "arweave-wallet-kit"
import { PlayIcon, Trash2 } from "lucide-react"
import { Loader } from "lucide-react"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { deleteNode, runNode } from "@/lib/events"

export default function FlowPanel() {
    const { activeNode, flowIsRunning } = useGlobalState()

    async function runThis() {
        runNode(activeNode!.id)
    }

    async function deleteThis() {
        deleteNode(activeNode!.id)
    }

    if (!activeNode) return null

    return <Panel position="top-center" className="bg-white whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
        <Button disabled={flowIsRunning} className="aspect-square h-full w-full" variant="ghost" onClick={runThis}>
            {flowIsRunning ? <Loader size={25} color="green" className="animate-spin" /> : <PlayIcon size={25} color="green" fill="green" />}
        </Button>
        <Button variant="ghost" className="aspect-square h-full w-full" onClick={deleteThis}>
            <Trash2 size={25} color="red" />
        </Button>
    </Panel>
}