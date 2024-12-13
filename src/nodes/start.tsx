import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"

export default function StartNode(props: Node) {
    return <div className="bg-white border border-black/50 rounded-md aspect-square cursor-pointer w-12 h-12">
        <Button className="aspect-square h-full w-full" variant="ghost">
            <PlayIcon size={25} color="green" fill="green" />
            <Handle type="source" position={Position.Right} />
        </Button>
    </div>
}