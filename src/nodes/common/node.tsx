import { Button } from "@/components/ui/button"
import { useGlobalState } from "@/hooks/useGlobalStore"
import { cn } from "@/lib/utils"
import { Node, useReactFlow } from "@xyflow/react"
import { Loader, MoveLeft, MoveRight, Trash } from "lucide-react"
import { PropsWithChildren } from "react"

interface NodeContainerProps extends PropsWithChildren<Node> {
    onDelete?: (nodeId: string) => void
    onRunFromHere?: (nodeId: string) => void
}

export default function NodeContainer(props: NodeContainerProps) {
    const { activeNode, runningNodes, successNodes, errorNodes } = useGlobalState()
    const { getNode, getNodes, setCenter } = useReactFlow()

    // order of preference for applying classes is selected > running > success > error
    const iAmSelected = activeNode?.id === props.id
    const iAmError = !!errorNodes.find(node => node.id == props.id)
    const iAmSuccess = !iAmError && !!successNodes.find(node => node.id == props.id)
    const iAmRunning = !iAmError && !iAmSuccess && !!runningNodes.find(node => node.id == props.id)
    // running - yellow
    // success - green
    // error - red
    // selected - blue  

    function thisNode() {
        const nodes = getNodes()
        const thisNode = getNode(props.id)
        if (!thisNode) return { node: null, index: -1 }
        // return nodes.findIndex(n => n.id === props.id)
        return {
            node: thisNode,
            index: nodes.findIndex(n => n.id === props.id)
        }
    }

    const handleMoveLeft = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        const { index, node } = thisNode()
        if (index <= 1) return
        if (!node) return

        // update order of this node to the left, and swap x,y positions
        const newNodes = [...getNodes()]
        const prevNode = newNodes[index - 1]
        if (!prevNode) return

        const myPosition = { ...node.position }
        const prevPosition = { ...prevNode.position }

        const nodeCopy = { ...node, position: prevPosition }
        const prevNodeCopy = { ...prevNode, position: myPosition }

        newNodes[index - 1] = nodeCopy
        newNodes[index] = prevNodeCopy

        dispatchEvent(new CustomEvent("update-nodes", { detail: { nodes: newNodes } }))
        setCenter(nodeCopy.position.x + 200, nodeCopy.position.y + 200, { zoom: 1, duration: 500 })
    }

    const handleMoveRight = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        const { index, node } = thisNode()
        if (index >= getNodes().length - 1) return
        if (!node) return

        const newNodes = [...getNodes()]
        const nextNode = newNodes[index + 1]
        if (!nextNode) return

        const myPosition = { ...node.position }
        const nextPosition = { ...nextNode.position }

        const nodeCopy = { ...node, position: nextPosition }
        const nextNodeCopy = { ...nextNode, position: myPosition }

        newNodes[index + 1] = nodeCopy
        newNodes[index] = nextNodeCopy

        dispatchEvent(new CustomEvent("update-nodes", { detail: { nodes: newNodes } }))
        setCenter(nodeCopy.position.x + 200, nodeCopy.position.y + 200, { zoom: 1, duration: 500 })
    }

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        const { index, node } = thisNode()
        if (!node) return

        const confirm_ = confirm("Are you sure you want to delete this node?")
        if (!confirm_) return

        const newNodes = [...getNodes()]
        newNodes.splice(index, 1)

        dispatchEvent(new CustomEvent("update-nodes", { detail: { nodes: newNodes } }))
    }

    return (
        <div className="relative">
            {/* Toolbar */}
            {iAmSelected && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border border-black/30 rounded-md p-1 flex gap-1 shadow-sm">
                    <Button
                        disabled={thisNode().index <= 1}
                        onClick={handleMoveLeft}
                        variant="ghost"
                        title="Move left"
                        className="p-2 h-7 w-7"
                    >
                        <MoveLeft size={16} />
                    </Button>
                    <Button
                        disabled={thisNode().index >= getNodes().length - 2}
                        onClick={handleMoveRight}
                        variant="ghost"
                        title="Move right"
                        className="p-2 h-7 w-7"
                    >
                        <MoveRight size={16} />
                    </Button>
                    {/* <button
                        onClick={() => props.onRunFromHere?.(props.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Run from here"
                    >
                        <Play size={16} />
                    </Button> */}
                    <Button
                        onClick={handleDelete}
                        variant="ghost"
                        title="Delete"
                        className="p-2 h-7 w-7"
                    >
                        <Trash size={16} className="text-red-500" />
                    </Button>
                </div>
            )}

            {/* Node Container */}
            <div data-selected={iAmSelected}
                data-running={iAmRunning}
                data-success={iAmSuccess}
                data-error={iAmError}
                className={cn(`bg-white border data-[selected=true]:!border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center w-28 h-28 relative`,
                    `data-[running=true]:bg-yellow-50 data-[success=true]:bg-green-50 data-[error=true]:bg-red-50`,
                    `data-[selected=true]:border-black data-[running=true]:border-yellow-500 data-[success=true]:border-green-500 data-[error=true]:border-red-500`,
                )}>
                {iAmRunning && <Loader className="absolute top-1 right-1 animate-spin" size={20} />}
                {props.children}
            </div>
        </div>
    )
}