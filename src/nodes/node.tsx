import { Button } from "@/components/ui/button"
import { useGlobalState } from "@/hooks/useGlobalStore"
import { cn } from "@/lib/utils"
import { Handle, Position, useReactFlow } from "@xyflow/react"
import { Node } from "@/nodes/index"
import { ChevronsLeft, ChevronsRight, Loader, MoveLeft, MoveRight, Plus, StepBack, Trash } from "lucide-react"
import { PropsWithChildren } from "react"

interface NodeContainerProps extends PropsWithChildren<Node> {
    onDelete?: (nodeId: string) => void
    onRunFromHere?: (nodeId: string) => void
    onAddClick?: () => void
}

export default function NodeContainer(props: NodeContainerProps) {
    const { activeNode, runningNodes, successNodes, errorNodes, setActiveNode, order, toggleSidebar, setAttach, attach, flowIsRunning } = useGlobalState()
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

    const orderNumber = order[props.id]

    return (
        <div className="relative">
            {/* Toolbar */}
            {orderNumber !== undefined && <div className="absolute -left-2 -top-3 bg-white border border-black/30 rounded-full aspect-square w-5 h-5 flex justify-center items-center z-20 text-xs">
                {orderNumber + 1}
            </div>}

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
                <Handle type="target" position={Position.Left} />
                {props.data.attachable && <Handle type="source" position={Position.Right} />}
                {props.data.attachable && <Button disabled={flowIsRunning} variant="ghost" onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleSidebar(true)
                    setAttach(props.id)
                    setActiveNode(undefined)
                    if (props.onAddClick) props.onAddClick()
                }} data-willattach={attach == props.id} className="absolute -right-3 bg-white p-0 border rounded-full w-6 h-6 flex justify-center items-center data-[willattach=true]:bg-yellow-100">
                    <Plus size={20} />
                </Button>}
            </div>

        </div>
    )
}