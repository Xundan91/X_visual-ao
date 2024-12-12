import { CodeIcon, FunctionSquareIcon, Icon, PlusIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";

export default function HandlerAddNode(props: Node) {
    return <div className="bg-white border p-2 border-black/50 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center">
        <CodeIcon size={60} strokeWidth={1} />
        Handler.add()
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
        {/* <Button className="aspect-square h-full" variant="ghost">
            <PlusIcon size={50} color="black" fill="green" />
            <Handle type="target" position={Position.Left} />

        </Button> */}
    </div>
} 