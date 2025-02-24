import { useGlobalState } from "@/hooks/useGlobalStore"
import { Panel } from "@xyflow/react"
import { ConnectButton } from "arweave-wallet-kit"
import { PlayIcon, Trash2 } from "lucide-react"
import { Loader } from "lucide-react"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { deleteNode, getCode, updateNodeData } from "@/lib/events"
import { findSpawnedProcess, parseOutupt, runLua, spawnProcess, spawnToken } from "@/lib/aos"
import { useState } from "react"
import { data as TokenData } from "@/nodes/token"
import { AOAuthority, AOModule } from "@/lib/constants"
export default function FlowPanel() {
    const { activeNode, flowIsRunning, setFlowIsRunning, addErrorNode, addOutput, addRunningNode, addSuccessNode, activeProcess, resetNode } = useGlobalState()
    const [nodeRunning, setNodeRunning] = useState(false)

    async function runThis() {
        if (!activeNode) return
        let code = getCode(activeNode!.id, activeNode!.data)

        if (activeNode.type === "token") {
            setFlowIsRunning(true)
            setNodeRunning(true)
            resetNode(activeNode.id)
            addRunningNode(activeNode)

            // if current active node is a token node
            // spawn a new process form the activeProcess for the token and store its id in active node data
            // if a process was spawned already, just run the code on that process
            const data = activeNode.data as TokenData
            try {
                code = await spawnToken(data, activeProcess, activeNode, code)
            } catch (e: any) {
                addErrorNode(activeNode!)
                addOutput({ type: "error", message: e.message })
                return
            }
        }

        try {
            setFlowIsRunning(true)
            setNodeRunning(true)
            resetNode(activeNode.id)
            addRunningNode(activeNode)

            console.log("running", code)
            const res = await runLua(code, activeProcess)
            console.log("output", res)
            if (res.Error) {
                addErrorNode(activeNode!)
                addOutput({ type: "error", message: res.Error })
            } else {
                addSuccessNode(activeNode!)
                addOutput({ type: "output", message: parseOutupt(res) })
            }
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