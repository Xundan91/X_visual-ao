import { CodeIcon, FunctionSquareIcon, Icon, PlusIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";

export default function HandlerAddNode(props: Node) {
    const { activeNode } = useGlobalState()

    const iAmActive = activeNode?.id === props.id

    return <div data-active={iAmActive} className="bg-white border data-[active=true]:border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center">
        <CodeIcon size={60} strokeWidth={1} />
        Handlers.add()
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
        {/* <Button className="aspect-square h-full" variant="ghost">
            <PlusIcon size={50} color="black" fill="green" />
            <Handle type="target" position={Position.Left} />

        </Button> */}
    </div>
} 