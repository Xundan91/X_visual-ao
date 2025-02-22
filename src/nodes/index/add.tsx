import { PlusIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { NodeSizes } from "@/nodes/index";

export default function AddNode(props: Node) {
    const { flowIsRunning } = useGlobalState()

    return <div className="bg-white border border-dashed border-black/50 rounded-md cursor-pointer" style={{ width: NodeSizes.addNode.width, height: NodeSizes.addNode.height }}>
        <Button disabled={flowIsRunning} className="aspect-square h-full w-full" variant="ghost">
            <PlusIcon size={50} color="gray" fill="green" />
            Add Node
        </Button>
    </div>
} 