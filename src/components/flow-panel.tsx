import { useGlobalState } from "@/hooks/useGlobalStore"
import { Panel } from "@xyflow/react"
import { ConnectButton } from "arweave-wallet-kit"
import { PlayIcon, Trash2, Code, Workflow } from "lucide-react"
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
import { SmolText } from "./right-sidebar"
import { useReactFlow } from "@xyflow/react"

export default function FlowPanel() {
    const { activeNode, flowIsRunning, setFlowIsRunning, addErrorNode, addOutput, addRunningNode, addSuccessNode, activeProcess, resetNode } = useGlobalState()
    const [nodeRunning, setNodeRunning] = useState(false)
    const [showCodeDialog, setShowCodeDialog] = useState(false)
    const [fullCode, setFullCode] = useState("")
    const reactFlowInstance = useReactFlow()

    async function runThis() {
        if (!activeNode) return

        try {
            setFlowIsRunning(true)
            setNodeRunning(true)
            resetNode(activeNode.id)
            addRunningNode(activeNode)

            let code = await getCode(activeNode!.id)

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
                code = await getCode(activeNode.id)
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
                code = await getCode(activeNode.id)
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

    async function formatFlow() {
        if (flowIsRunning) return

        const nodes = reactFlowInstance.getNodes()
        const edges = reactFlowInstance.getEdges()

        // Find the start node
        const startNode = nodes.find(node => node.id === "start")
        if (!startNode) return

        // Starting position
        const startX = startNode.position.x
        const startY = startNode.position.y
        const horizontalSpacing = 300  // Increased for better spacing between columns
        const verticalSpacing = 150    // Spacing between nodes in the same column

        // Keep track of nodes we've positioned and their levels
        const positionedNodes = new Set<string>([startNode.id])
        const nodesByLevel = new Map<number, Set<string>>()
        nodesByLevel.set(0, new Set([startNode.id]))

        // First pass: Assign levels to all nodes (BFS)
        const assignLevels = () => {
            const queue = [{ id: startNode.id, level: 0 }]
            const visited = new Set<string>([startNode.id])

            while (queue.length > 0) {
                const { id, level } = queue.shift()!

                // Get all nodes connected to this node
                const connectedEdges = edges.filter(edge => edge.source === id)

                for (const edge of connectedEdges) {
                    if (!visited.has(edge.target)) {
                        visited.add(edge.target)

                        // Assign level to this node
                        const nextLevel = level + 1
                        if (!nodesByLevel.has(nextLevel)) {
                            nodesByLevel.set(nextLevel, new Set())
                        }
                        nodesByLevel.get(nextLevel)!.add(edge.target)

                        // Add to queue for processing
                        queue.push({ id: edge.target, level: nextLevel })
                    }
                }
            }
        }

        // Second pass: Position nodes by level
        const positionNodesByLevel = () => {
            // Position the start node
            reactFlowInstance.setNodes(nds =>
                nds.map(node => {
                    if (node.id === startNode.id) {
                        return {
                            ...node,
                            position: { x: startX, y: startY }
                        }
                    }
                    return node
                })
            )

            // Position all other nodes by level
            const maxLevel = Math.max(...Array.from(nodesByLevel.keys()))

            for (let level = 1; level <= maxLevel; level++) {
                const nodesAtLevel = Array.from(nodesByLevel.get(level) || [])
                const totalNodesAtLevel = nodesAtLevel.length

                // Position each node at this level
                nodesAtLevel.forEach((nodeId, index) => {
                    const node = nodes.find(n => n.id === nodeId)
                    if (!node) return

                    // Calculate vertical position
                    // Center the nodes vertically with equal spacing
                    const totalHeight = (totalNodesAtLevel - 1) * verticalSpacing
                    const y = startY - totalHeight / 2 + index * verticalSpacing

                    // Calculate horizontal position (fixed distance from previous level)
                    const x = startX + level * horizontalSpacing

                    // Update node position
                    reactFlowInstance.setNodes(nds =>
                        nds.map(n => {
                            if (n.id === nodeId) {
                                return {
                                    ...n,
                                    position: { x, y }
                                }
                            }
                            return n
                        })
                    )
                })
            }
        }

        // Execute the layout algorithm
        assignLevels()
        positionNodesByLevel()

        // Center the view on the flow
        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2, duration: 500 })
        }, 100)
    }

    if (!activeProcess) {
        return (
            <Panel position="top-left" className="bg-white whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
                <span className="text-xs font-medium">;)</span>
            </Panel>
        )
    }

    if (!activeNode) {
        // Return a simplified panel when no node is active
        return (
            <Panel position="top-left" className="bg-white whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
                <Button
                    key="show-code-button"
                    disabled={!activeProcess || flowIsRunning}
                    className="h-12 w-16 flex flex-col items-center justify-center gap-1 p-2"
                    variant="ghost"
                    onClick={showFullCode}
                    title="Show full code"
                >
                    <Code key="code-icon" size={25} color="#555" />
                    <span className="text-xs font-medium">Full Code</span>
                </Button>

                <Button
                    key="format-flow-button"
                    disabled={flowIsRunning}
                    className="h-12 w-16 flex flex-col items-center justify-center gap-1 p-2"
                    variant="ghost"
                    onClick={formatFlow}
                    title="Format flow"
                >
                    <Workflow key="format-icon" size={25} color="#555" />
                    <span className="text-xs font-medium">Format</span>
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

    return <Panel position="top-left" className="bg-white whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
        <Button
            key="run-button"
            disabled={flowIsRunning || nodeRunning}
            className="h-12 w-16 flex flex-col items-center justify-center gap-1 p-2"
            variant="ghost"
            onClick={runThis}
        >
            {flowIsRunning || nodeRunning ?
                <Loader key="loader" size={20} color="green" className="animate-spin" /> :
                <PlayIcon key="play-icon" size={20} color="green" fill="green" />
            }
            <span className="text-xs font-medium">Run</span>
        </Button>
        <Button
            key="show-code-button"
            disabled={flowIsRunning}
            className="h-12 w-16 flex flex-col items-center justify-center gap-1 p-2"
            variant="ghost"
            onClick={showFullCode}
            title="Show node code"
        >
            <Code key="code-icon" size={20} color="#555" />
            <span className="text-xs font-medium">Code</span>
        </Button>
        <Button
            key="delete-button"
            variant="ghost"
            className="h-12 w-16 flex flex-col items-center justify-center gap-1 p-2"
            onClick={deleteThis}
        >
            <Trash2 key="trash-icon" size={20} color="red" />
            <span className="text-xs font-medium">Delete</span>
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