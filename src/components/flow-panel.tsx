import { useGlobalState } from "@/hooks/useGlobalStore"
import { Panel } from "@xyflow/react"
import { ConnectButton } from "arweave-wallet-kit"
import { PlayIcon, Trash2 } from "lucide-react"
import { Loader } from "lucide-react"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { deleteNode, getCode } from "@/lib/events"
import { parseOutupt, runLua } from "@/lib/aos"
import { useState } from "react"
export default function FlowPanel() {
    const { activeNode, flowIsRunning, setFlowIsRunning, addErrorNode, addOutput, addRunningNode, addSuccessNode, activeProcess, resetNode } = useGlobalState()
    const [nodeRunning, setNodeRunning] = useState(false)

    async function runThis() {
        if (!activeNode) return
        const code = getCode(activeNode!.id, activeNode!.data)

        try {
            setFlowIsRunning(true)
            setNodeRunning(true)
            resetNode(activeNode.id)
            addRunningNode(activeNode)

            const res = await runLua(code, activeProcess)
            if (res.Error) {
                addErrorNode(activeNode!)
                addOutput({ type: "error", message: res.Error })
            } else {
                addSuccessNode(activeNode!)
                addOutput({ type: "output", message: parseOutupt(res) })
            }
            console.log(res)
        } catch (e: any) {
            console.log(e)
            addErrorNode(activeNode!)
            addOutput({ type: "error", message: e.message })
        } finally {
            setNodeRunning(false)
            setFlowIsRunning(false)
        }
    }

    async function deleteThis() {
        deleteNode(activeNode!.id)
    }

    if (!activeNode) return null

    return <Panel position="top-center" className="bg-white whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
        <Button disabled={flowIsRunning || nodeRunning} className="aspect-square h-full w-full" variant="ghost" onClick={runThis}>
            {flowIsRunning || nodeRunning ? <Loader size={25} color="green" className="animate-spin" /> : <PlayIcon size={25} color="green" fill="green" />}
        </Button>
        <Button variant="ghost" className="aspect-square h-full w-full" onClick={deleteThis}>
            <Trash2 size={25} color="red" />
        </Button>
    </Panel>
}