import { useGlobalState } from "@/hooks/useGlobalStore"
import { Panel } from "@xyflow/react"
import { ConnectButton } from "arweave-wallet-kit"
import { PlayIcon, Trash2, Code } from "lucide-react"
import { Loader } from "lucide-react"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { deleteNode, getCode, getConnectedNodes, updateNodeData } from "@/lib/events"
import { findSpawnedProcess, parseOutupt, runLua, spawnProcess, spawnToken } from "@/lib/aos"
import { useState } from "react"
import { data as TokenData } from "@/nodes/token"
import { AOAuthority, AOModule } from "@/lib/constants"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Node } from "@/nodes/index"

export default function FlowPanel() {
    const { activeNode, flowIsRunning, setFlowIsRunning, addErrorNode, addOutput, addRunningNode, addSuccessNode, activeProcess, resetNode } = useGlobalState()
    const [nodeRunning, setNodeRunning] = useState(false)
    const [showCodeDialog, setShowCodeDialog] = useState(false)
    const [fullCode, setFullCode] = useState("")

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

    async function showFullCode() {
        if (!activeProcess) return

        let code = ""

        if (activeNode) {
            // Show code only for the active node
            try {
                code = await getCode(activeNode.id, activeNode.data)
                code = `-- [ ${activeNode.id} ]\n${code}`
            } catch (e) {
                code = `-- [ ${activeNode.id} ]\n-- Error generating code: ${e}`
            }
        } else {
            // Show code for all connected nodes when no node is selected
            const rootNodes: Node[] = []
            const n = getConnectedNodes("start")

            // Extract root nodes
            n.forEach(node => {
                if (Array.isArray(node)) {
                    let n = node.find(nn => !Array.isArray(nn))
                    if (n) {
                        rootNodes.push(n as Node)
                    }
                } else {
                    rootNodes.push(node)
                }
            })

            // Generate code for each node
            for (const node of rootNodes) {
                try {
                    const nodeCode = await getCode(node.id, node.data)
                    code += `\n-- [ ${node.id} ]\n${nodeCode}\n`
                } catch (e) {
                    code += `\n-- [ ${node.id} ]\n-- Error generating code: ${e}\n`
                }
            }
        }

        setFullCode(code || "-- No code generated")
        setShowCodeDialog(true)
    }

    if (!activeNode) {
        // Return a simplified panel when no node is active
        return (
            <Panel position="top-center" className="bg-white whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
                <Button
                    key="show-code-button"
                    disabled={!activeProcess || flowIsRunning}
                    className="aspect-square h-full w-full"
                    variant="ghost"
                    onClick={showFullCode}
                    title="Show full code"
                >
                    <Code key="code-icon" size={25} color="#555" />
                </Button>

                <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
                    <DialogContent className="max-w-3xl bg-white">
                        <DialogHeader>
                            <DialogTitle>Full Flow Code</DialogTitle>
                        </DialogHeader>
                        <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[70vh]">
                            <pre className="text-sm whitespace-pre-wrap">{fullCode}</pre>
                        </div>
                    </DialogContent>
                </Dialog>
            </Panel>
        )
    }

    return <Panel position="top-center" className="bg-white whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
        <Button key="run-button" disabled={flowIsRunning || nodeRunning} className="aspect-square h-full w-full" variant="ghost" onClick={runThis}>
            {flowIsRunning || nodeRunning ? <Loader key="loader" size={25} color="green" className="animate-spin" /> : <PlayIcon key="play-icon" size={25} color="green" fill="green" />}
        </Button>
        <Button key="delete-button" variant="ghost" className="aspect-square h-full w-full" onClick={deleteThis}>
            <Trash2 key="trash-icon" size={25} color="red" />
        </Button>
        <Button
            key="show-code-button"
            disabled={flowIsRunning}
            className="aspect-square h-full w-full"
            variant="ghost"
            onClick={showFullCode}
            title="Show node code"
        >
            <Code key="code-icon" size={25} color="#555" />
        </Button>

        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
            <DialogContent className="max-w-3xl bg-white">
                <DialogHeader>
                    <DialogTitle>Node Code</DialogTitle>
                </DialogHeader>
                <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[70vh]">
                    <pre className="text-sm whitespace-pre-wrap">{fullCode}</pre>
                </div>
            </DialogContent>
        </Dialog>
    </Panel>
}