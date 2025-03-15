import { useGlobalState } from "@/hooks/useGlobalStore"
import { Panel } from "@xyflow/react"
import { ConnectButton } from "arweave-wallet-kit"
import { PlayIcon, Trash2, Code, Workflow } from "lucide-react"
import { Loader } from "lucide-react"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { deleteNode, getCode, getConnectedNodes, updateNodeData } from "@/lib/events"
import { findSpawnedProcess, parseOutupt, runLua, spawnProcess, spawnToken } from "@/lib/aos"
import { useEffect, useState } from "react"
import { data as TokenData } from "@/nodes/token"
import { AOAuthority, AOModule } from "@/lib/constants"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Node } from "@/nodes/index"
import { SmolText } from "./right-sidebar"
import { useReactFlow } from "@xyflow/react"
import SyntaxHighlighter from "./syntax-highlighter"
import { useTheme } from "next-themes"
import { Switch } from "./ui/switch"
import { SelectLabel } from "./ui/select"

export default function FlowPanel() {
    const { activeNode, flowIsRunning, setFlowIsRunning, addErrorNode, addOutput, addRunningNode, addSuccessNode, activeProcess, resetNode } = useGlobalState()
    const [nodeRunning, setNodeRunning] = useState(false)
    const [showCodeDialog, setShowCodeDialog] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [fullCode, setFullCode] = useState("")
    const reactFlowInstance = useReactFlow()
    const { theme } = useTheme()

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
                        addOutput({ type: "error", message: e.message, preMessage: activeNode.id })
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
                addOutput({ type: "error", message: res.Error, preMessage: activeNode.id, aoMessage: res })
            } else {
                addSuccessNode(activeNode!)
                addOutput({ type: "output", message: parseOutupt(res), preMessage: activeNode.id, aoMessage: res })
            }
        } catch (e: any) {
            console.log(e)
            addErrorNode(activeNode!)
            addOutput({ type: "error", message: e.message, preMessage: activeNode.id })
        } finally {
            setNodeRunning(false)
            setFlowIsRunning(false)
        }
    }

    async function deleteThis() {
        deleteNode(activeNode!.id)
    }

    async function showFullCode({ comments = true }: { comments?: boolean }) {
        if (!activeProcess) return

        let code = ""

        if (activeNode) {
            // Show code only for the active node
            try {
                code = await getCode(activeNode.id)
            } catch (e) {
                code = `-- [error:${activeNode.id}]\n-- Error generating code: ${e}`
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
                    code += await getCode(node.id, node.data)
                } catch (e) {
                    code += `\n-- [error:${node.id}]\n-- Error generating code: ${e}\n`
                }
            }
        }

        if (!comments) {
            code = code.split("\n").filter(line => !line.trim().startsWith("--")).join("\n")
        }

        // collapse multiple empty newlines with or without tab into a single empty line
        code = code.split("\n\n").filter(line => line.trim() !== "").join("\n")

        setFullCode(code.trim() || "-- No code generated")
        setShowCodeDialog(true)
    }

    useEffect(() => {
        showFullCode({ comments: showComments })
    }, [showComments]);

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
        const horizontalSpacing = 300  // Spacing between columns
        const verticalSpacing = 150    // Minimum spacing between nodes

        // Keep track of nodes we've positioned and their levels
        const nodesByLevel = new Map<number, string[]>()
        nodesByLevel.set(0, [startNode.id])

        // First pass: Assign levels to all nodes (BFS) while preserving Y-order
        const assignLevels = () => {
            const queue = [{ id: startNode.id, level: 0 }]
            const visited = new Set<string>([startNode.id])

            while (queue.length > 0) {
                const { id, level } = queue.shift()!

                // Get all nodes connected to this node
                const connectedEdges = edges.filter(edge => edge.source === id)

                // Sort connected nodes by Y position
                const connectedNodes = connectedEdges
                    .map(edge => ({
                        id: edge.target,
                        node: nodes.find(n => n.id === edge.target)!
                    }))
                    .sort((a, b) => a.node.position.y - b.node.position.y)

                // Process nodes in Y-order
                for (const { id: targetId } of connectedNodes) {
                    if (!visited.has(targetId)) {
                        visited.add(targetId)

                        // Assign level to this node
                        const nextLevel = level + 1
                        if (!nodesByLevel.has(nextLevel)) {
                            nodesByLevel.set(nextLevel, [])
                        }
                        nodesByLevel.get(nextLevel)!.push(targetId)

                        // Add to queue for processing
                        queue.push({ id: targetId, level: nextLevel })
                    }
                }
            }
        }

        // Second pass: Position nodes by level while maintaining Y-order
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
                const nodesAtLevel = nodesByLevel.get(level) || []

                // Get original Y positions and sort nodes
                const nodePositions = nodesAtLevel.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId)!
                    const parentEdge = edges.find(e => e.target === nodeId)!
                    const parentNode = nodes.find(n => n.id === parentEdge.source)!
                    return {
                        id: nodeId,
                        originalY: node.position.y,
                        parentY: parentNode.position.y
                    }
                }).sort((a, b) => {
                    // First sort by parent Y position
                    if (a.parentY !== b.parentY) {
                        return a.parentY - b.parentY
                    }
                    // Then by original Y position
                    return a.originalY - b.originalY
                })

                // Calculate vertical distribution
                const totalHeight = (nodePositions.length - 1) * verticalSpacing
                const startingY = startY - totalHeight / 2

                // Position each node
                nodePositions.forEach(({ id }, index) => {
                    const x = startX + level * horizontalSpacing
                    const y = startingY + index * verticalSpacing

                    reactFlowInstance.setNodes(nds =>
                        nds.map(n => {
                            if (n.id === id) {
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
            <Panel position="top-left" className="bg-muted whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
                <span className="text-xs font-medium">;)</span>
            </Panel>
        )
    }

    if (!activeNode) {
        // Return a simplified panel when no node is active
        return (
            <Panel position="top-left" className="bg-muted whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
                <Button
                    key="show-code-button"
                    disabled={!activeProcess || flowIsRunning}
                    className="h-12 w-16 flex flex-col items-center justify-center gap-1 p-2"
                    variant="ghost"
                    onClick={() => showFullCode({ comments: showComments })}
                    title="Show full code"
                >
                    <Code key="code-icon" size={25} />
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
                    <Workflow key="format-icon" size={25} />
                    <span className="text-xs font-medium">Format</span>
                </Button>

                <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
                    <DialogContent className="max-w-3xl bg-muted">
                        <DialogHeader className="flex flex-row items-center justify-between">
                            <DialogTitle>Full Flow Code</DialogTitle>
                        </DialogHeader>
                        <div className="rounded-md overflow-clip border">
                            <SyntaxHighlighter code={fullCode} theme={theme} style={{ marginTop: "0px", borderTopWidth: "0px", borderBottomWidth: "0px", maxHeight: "70vh", overflowY: "scroll" }} />
                        </div>
                        <div className="absolute bottom-0.5 right-6 flex items-center justify-center gap-0.5">
                            <div className="text-xs font-medium text-muted-foreground">Show comments</div>
                            <Switch id="enable-comments" checked={showComments} onCheckedChange={setShowComments} className="scale-75" />
                        </div>
                    </DialogContent>
                </Dialog>
            </Panel>
        )
    }

    return <Panel position="top-left" className="bg-muted whitespace-nowrap rounded-md p-1 border flex items-center justify-center gap-2">
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
            onClick={() => showFullCode({ comments: showComments })}
            title="Show node code"
        >
            <Code key="code-icon" size={20} />
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
            <DialogContent className="max-w-3xl bg-muted">
                <DialogHeader className="flex flex-row items-center mr-5 justify-between">
                    <DialogTitle>Node Code</DialogTitle>
                </DialogHeader>
                <div className="rounded-md overflow-clip border">
                    <SyntaxHighlighter code={fullCode} theme={theme} style={{ marginTop: "0px", borderTopWidth: "0px", borderBottomWidth: "0px", maxHeight: "70vh", overflowY: "scroll" }} />
                </div>
                <div className="absolute bottom-0.5 right-6 flex items-center justify-center gap-0.5">
                    <div className="text-xs font-medium text-muted-foreground">Show comments</div>
                    <Switch id="enable-comments" checked={showComments} onCheckedChange={setShowComments} className="scale-75" />
                </div>
            </DialogContent>
        </Dialog>
    </Panel>
}