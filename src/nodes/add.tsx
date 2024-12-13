import { PlusIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";

export default function AddNode(props: Node) {
    return <div className="bg-white border border-dashed border-black/50 rounded-md aspect-square cursor-pointer w-12 h-12">
        <Button className="aspect-square h-full w-full" variant="ghost">
            <PlusIcon size={50} color="gray" fill="green" />
            <Handle type="target" position={Position.Left} />
        </Button>
    </div>
} 