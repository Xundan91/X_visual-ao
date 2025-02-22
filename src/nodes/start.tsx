import { Button } from "@/components/ui/button";
import { Loader, PlayIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { useGlobalState } from "@/hooks/useGlobalStore";

export default function StartNode(props: Node) {
    const { flowIsRunning } = useGlobalState()

    return <div className="bg-white border border-black/50 rounded-md aspect-square cursor-pointer w-28 h-12">
        <Button disabled={flowIsRunning} className="aspect-square h-full w-full" variant="ghost">
            {flowIsRunning ? <Loader size={25} color="green" className="animate-spin" /> : <PlayIcon size={25} color="green" fill="green" />}
            RUN ALL
            <Handle type="source" position={Position.Right} />
        </Button>
    </div>
}