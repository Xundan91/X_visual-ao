import { CodeIcon, FunctionSquareIcon, Icon, PlusIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes } from ".";

export default function HandlerAddNode(props: Node) {
    const { activeNode } = useGlobalState()

    const iAmActive = activeNode?.id === props.id

    return <div data-active={iAmActive} className="bg-white border data-[active=true]:border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center w-28 h-28">
        <CodeIcon size={30} strokeWidth={1} />
        <div>{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>
} 