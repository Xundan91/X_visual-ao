import { Handle, Node, Position } from "@xyflow/react"
import { useGlobalState } from "@/hooks/useGlobalStore";
import { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader, MessageSquareShare } from "lucide-react";
import { keyToNode } from ".";
import { TNodes } from ".";

// data field structure for react-node custom node
export interface data {
    target: string;
    action: string;
    data: string;
    tags: Tag[];
}

// the handler add node for react-flow
export default function AOSendNode(props: Node) {
    const { activeNode, runningNodes, successNodes, errorNodes } = useGlobalState()
    const data = props.data as unknown as data


    // order of preference for applying classes is selected > running > success > error
    const iAmSelected = activeNode?.id === props.id
    const iAmError = !!errorNodes.find(node => node.id == props.id)
    const iAmSuccess = !iAmError && !!successNodes.find(node => node.id == props.id)
    const iAmRunning = !iAmError && !iAmSuccess && !!runningNodes.find(node => node.id == props.id)
    // running - yellow
    // success - green
    // error - red
    // selected - blue  

    return <div data-selected={iAmSelected}
        data-running={iAmRunning}
        data-success={iAmSuccess}
        data-error={iAmError}

        className={cn(`bg-white border data-[selected=true]:!border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center w-28 h-28 relative`,
            `data-[running=true]:bg-yellow-50 data-[success=true]:bg-green-50 data-[error=true]:bg-red-50`,
            `data-[selected=true]:border-black data-[running=true]:border-yellow-500 data-[success=true]:border-green-500 data-[error=true]:border-red-500`,
        )}>
        {
            iAmRunning && <Loader className="absolute top-1 right-1 animate-spin" size={20} />
        }
        <MessageSquareShare size={30} strokeWidth={1} />
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>
}

export function AOSendNodeSidebar() {
    return <div>
        <div>Target</div>
        <div>Action</div>
        <div>Data</div>
        <div>Tags</div>
    </div>
}
