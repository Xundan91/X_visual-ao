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

        try {
            setFlowIsRunning(true)
            setNodeRunning(true)
            resetNode(activeNode.id)
            addRunningNode(activeNode)

            let code = await getCode(activeNode!.id, activeNode!.data)

            if (activeNode.type === "token") {
                // Only spawn token if we don't have a tokenId or respawn is true
                const data = activeNode.data as TokenData
                if (!data.tokenId || data.respawn) {
                    try {
                        const tokenId = await spawnToken(data, activeProcess, activeNode)
                        data.tokenId = tokenId
                        updateNodeData(activeNode.id, data)
                    } catch (e: any) {
                        addErrorNode(activeNode!)
                        addOutput({ type: "error", message: e.message })
                        return
                    }
                }
                // code = `tokens = tokens or {}\ntokens["${data.name}"] = "${data.tokenId}"`
                code = await getCode(activeNode.id, activeNode.data)
            }

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
        <Button key="run-button" disabled={flowIsRunning || nodeRunning} className="aspect-square h-full w-full" variant="ghost" onClick={runThis}>
            {flowIsRunning || nodeRunning ? <Loader key="loader" size={25} color="green" className="animate-spin" /> : <PlayIcon key="play-icon" size={25} color="green" fill="green" />}
        </Button>
        <Button key="delete-button" variant="ghost" className="aspect-square h-full w-full" onClick={deleteThis}>
            <Trash2 key="trash-icon" size={25} color="red" />
        </Button>
    </Panel>
}